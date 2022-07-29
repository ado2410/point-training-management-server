/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.raw(`
    CREATE OR REPLACE FUNCTION calculate_point(semester_id BIGINT, student_id BIGINT, third_title_id BIGINT) RETURNS DOUBLE PRECISION AS $$
        DECLARE
            default_point DOUBLE PRECISION;
            max_point DOUBLE PRECISION;
            point DOUBLE PRECISION;
            student_title_activities CURSOR FOR
                SELECT title_activities.point, title_activities.options, activities.type, activities.accepts, activities.default_value, student_activities.value
                FROM title_activities
                    JOIN activities ON title_activities.activity_id = activities.id
                    LEFT JOIN student_activities ON student_activities.activity_id = activities.id AND student_activities.student_id=$2
                WHERE title_activities.third_title_id=$3 AND title_activities.semester_id=$1;
            title_activitiy title_activities%rowtype;
            temp_point DOUBLE PRECISION = 0;
            _value DOUBLE PRECISION;
            _option JSONB;
            _options JSONB[];
            counter INT = 0;
        BEGIN
            -- Lấy thông tin các chỉ số của tiêu đề cấp 3 và gán cho các biến
            SELECT tt.default_point, tt.max_point, tt.default_point, COUNT(ta.third_title_id)
            INTO point, max_point, default_point, counter
            FROM third_titles AS tt LEFT JOIN title_activities AS ta ON tt.id = ta.third_title_id AND ta.semester_id=$1
            WHERE tt.id=$3
            GROUP BY tt.default_point, tt.max_point, tt.default_point;
            
            -- Vòng lặp từng mục cộng điểm
            FOR title_activity IN student_title_activities LOOP
                _value = COALESCE(title_activity.value, title_activity.default_value);
                --Nếu là kiểu CHECK
                IF title_activity.type = 'CHECK' THEN
                    IF _value = 0 THEN
                        point = point + COALESCE(title_activity.point[1], 0);
                    ELSE
                        point = point + COALESCE(title_activity.point[2], 0);
                    END IF;
                -- Nếu là kiểu POINT hoặc COUNT
                ELSEIF title_activity.type = 'POINT' OR title_activity.type = 'COUNT' THEN
                    temp_point = 0;
                    IF title_activity.type = 'COUNT' THEN temp_point = title_activity.point[1] * _value; END IF;
                    _options = title_activity.options;
                    FOREACH _option IN ARRAY _options LOOP
                        IF _option->>'type' = 'eq' AND text(_value) = _option->>'value' THEN temp_point = _option->>'point'; END IF;
                        IF _option->>'type' = 'gt' AND text(_value) > _option->>'value' THEN temp_point = _option->>'point'; END IF;
                        IF _option->>'type' = 'gte' AND text(_value) >= _option->>'value' THEN temp_point = _option->>'point'; END IF;
                        IF _option->>'type' = 'lt' AND text(_value) < _option->>'value' THEN temp_point = _option->>'point'; END IF;
                        IF _option->>'type' = 'lte' AND text(_value) <= _option->>'value' THEN temp_point = _option->>'point'; END IF;
                    END LOOP;
                    point = point + COALESCE(temp_point, 0);
                -- Nếu là kiểu ENUM
                ELSEIF title_activity.type = 'ENUM' THEN
                    point = point + COALESCE(title_activity.point[_value+1], 0);
                END IF;
            END LOOP;
            
            -- Kiểm tra nếu không có hoạt động cộng điểm thì cộng tối đa số điểm
            IF counter = 0 THEN point = max_point; END IF;
            
            -- Nếu điểm < 0 thì = 0, nếu điểm > điểm tối đa thì = điểm tối đa
            IF point < 0 THEN point = 0;
            ELSEIF point > max_point THEN point = max_point;
            END IF;
            
            RETURN point;
        END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_group_full_code(group_id bigint)
    RETURNS text AS $$
    DECLARE
        code text = '';
        parent_group_id bigint;
    BEGIN
        SELECT groups.group_id, groups.code
        INTO parent_group_id, code
        FROM groups
        WHERE groups.id = $1;
        IF parent_group_id IS NULL THEN RETURN code;
        ELSE RETURN CONCAT(get_group_full_code(parent_group_id), '_', code);
        END IF;
    END;
    $$
    LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_activity_code(semester_id bigint, activity_id bigint)
    RETURNS text AS $$
    DECLARE
        _group_id bigint;
        full_code text;
        index bigint;
    BEGIN
        -- Tìm group id
        SELECT activities.group_id
        INTO _group_id
        FROM activities
        WHERE activities.id = $2;
        
        -- Lấy group full code
        full_code = get_group_full_code(_group_id);
        
        -- Tìm chỉ mục
        SELECT row_number, id
        INTO index
        FROM (
            SELECT ROW_NUMBER() OVER (ORDER BY id) AS row_number, id
            FROM activities
            WHERE activities.group_id = _group_id AND activities.semester_id = $1
            ORDER BY id
        ) AS ac
        WHERE id = $2;
        
        RETURN CONCAT(full_code, '_', index);
    END;
    $$
    LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_id_from_group_full_code(full_code text)
    RETURNS bigint AS $$
    DECLARE
        group_id bigint;
    BEGIN
        SELECT groups.id
        INTO group_id
        FROM groups
        WHERE get_group_full_code(groups.id) = $1;
        RETURN group_id;
    END;
    $$
    LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_id_from_activity_code(semester_id bigint, activity_code text)
    RETURNS bigint AS $$
    DECLARE
        activity_id bigint;
    BEGIN
        SELECT activities.id
        INTO activity_id
        FROM activities
        WHERE get_activity_code($1, activities.id) = $2
        ORDER BY id;
        RETURN activity_id;
    END;
    $$
    LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_can_modify_attendance(semester_id bigint, student_id bigint, attendance jsonb)
    RETURNS boolean AS $$
    DECLARE
        format text = 'YYYY/MM/DD HH24:MI:SS';
        _open text = $3->>'open';
        _start text = $3->>'start';
        _end text = $3->>'end';
        _level text = $3->>'level';
        departments int[] = REPLACE(REPLACE($3->>'departments', '[', '{'), ']', '}')::int[];
        department int;
        classes int[] = REPLACE(REPLACE($3->>'classes', '[', '{'), ']', '}')::int[];
        _class int;
        positions text[] = REPLACE(REPLACE($3->>'positions', '[', '{'), ']', '}')::text[];
        _position text;
    BEGIN
        -- Nếu open === false
        IF _open != 'true' THEN RETURN false; END IF;
        
        -- Kiểm tra ngày
        IF _start IS NOT null OR _end IS NOT null THEN
            -- Nếu không có ngày bắt đầu
            IF _start IS null AND NOW() > TO_TIMESTAMP(_end, format) THEN RETURN false;
            -- Nếu không có ngày kết thúc
            ELSIF _end IS null AND NOW() < TO_TIMESTAMP(_start, format) THEN RETURN false;
            -- Nếu ngày không hợp lệ
            ELSIF NOW() < TO_TIMESTAMP(_start, format) OR NOW() > TO_TIMESTAMP(_end, format) THEN RETURN false;
            END IF;
        END IF;
        
        --Kiểm tra cấp
        IF _level = 'DEPARTMENT' THEN
            --Kiểm tra có trong khoa
            SELECT departments.id
            INTO department
            FROM students
                JOIN classes ON students.class_id = classes.id
                JOIN majors ON classes.major_id = majors.id
                JOIN departments ON majors.department_id = departments.id
            WHERE students.id = $2;

            IF department != ALL(departments) THEN RETURN false; END IF;
        ELSIF _level = 'CLASS' THEN
            --Kiểm tra có trong lớp
            SELECT classes.id
            INTO _class
            FROM students
                JOIN classes ON students.class_id = classes.id
            WHERE students.id = $2;

            IF _class != ALL(classes) THEN RETURN false; END IF;
        END IF;
        
        
        --Kiểm tra chức vụ lớp
        SELECT semester_students.position
        INTO _position
        FROM semester_students
        WHERE semester_students.semester_id = $1 AND semester_students.student_id = $2;
        
        IF _position != ALL(positions) THEN RETURN false; END IF;
        
        RETURN true;
    END;
    $$
    LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION is_in_group(user_id bigint, group_id bigint)
    RETURNS boolean AS $$
    DECLARE
        _row record;
        in_group boolean = false;
        parent_id bigint;
    BEGIN
        SELECT COUNT(*) > 0
        INTO in_group
        FROM group_users
        WHERE group_users.group_id = $2 AND group_users.user_id = $1;
        
        SELECT groups.group_id
        INTO parent_id
        FROM groups
        WHERE groups.id = $2;
        
        IF parent_id IS NOT NULL AND in_group = false THEN
            in_group = is_in_group($1, parent_id);
        END IF;
        
        RETURN in_group;
    END;
    $$
    LANGUAGE plpgsql;   
    `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.raw(`
    DROP FUNCTION calculate_point;
    DROP FUNCTION get_group_full_code;
    DROP FUNCTION get_activity_code;
    `);
};
