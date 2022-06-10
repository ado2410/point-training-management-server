/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
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
    `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.raw("DROP FUNCTION calculate_point");
};
