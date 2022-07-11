/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    await knex("departments").del();
    await knex("departments").insert([
        { name: "Công nghệ" },
        { name: "Kinh tế" },
        { name: "Luật và Sư phạm" },
    ]);

    await knex("majors").del();
    await knex("majors").insert([
        { name: "Điện", department_id: 1 },
        { name: "Quản trị dịch vụ du lịch và lữ hành", department_id: 2 },
        { name: "Giao thông", department_id: 1 },
        { name: "Kinh doanh nông nghiệp", department_id: 2 },
        { name: "Kế toán", department_id: 2 },
        { name: "Luật kinh tế", department_id: 3 },
        { name: "Tài chính ngân hàng", department_id: 2 },
        { name: "Kinh tế phát triển", department_id: 2 },
        { name: "Quản lý nhà nước", department_id: 2 },
        { name: "Quản trị kinh doanh", department_id: 2 },
        { name: "Sinh học", department_id: 1 },
        { name: "Tiểu học", department_id: 3 },
        { name: "Công nghệ thông tin", department_id: 1 },
        { name: "Xây dựng", department_id: 1 },
    ]);

    await knex("classes").del();
    await knex("classes").insert([
        {
            name: "K11D",
            major_id: 1,
        },
        {
            name: "K11GT",
            major_id: 3,
        },
        {
            name: "K11KT",
            major_id: 5,
        },
        {
            name: "K11LK1",
            major_id: 6,
        },
        {
            name: "K11LK2",
            major_id: 6,
        },
        {
            name: "K11PT",
            major_id: 8,
        },
        {
            name: "K11SH",
            major_id: 11,
        },
        {
            name: "K11TT",
            major_id: 13,
        },
        {
            name: "K11XD",
            major_id: 14,
        },
        {
            name: "K12DL",
            major_id: 2,
        },
        {
            name: "K12KN",
            major_id: 4,
        },
        {
            name: "K12KT",
            major_id: 5,
        },
        {
            name: "K12LK1",
            major_id: 6,
        },
        {
            name: "K12LK2",
            major_id: 6,
        },
        {
            name: "K12NH",
            major_id: 7,
        },
        {
            name: "K12PT",
            major_id: 8,
        },
        {
            name: "K12QT",
            major_id: 10,
        },
        {
            name: "K12TH",
            major_id: 12,
        },
        {
            name: "K12TT",
            major_id: 13,
        },
        {
            name: "K12XD",
            major_id: 14,
        },
        {
            name: "K19D",
            major_id: 1,
        },
        {
            name: "K19DL",
            major_id: 2,
        },
        {
            name: "K19KT",
            major_id: 5,
        },
        {
            name: "K19LK",
            major_id: 6,
        },
        {
            name: "K19NH",
            major_id: 7,
        },
        {
            name: "K19QN",
            major_id: 9,
        },
        {
            name: "K19QT",
            major_id: 10,
        },
        {
            name: "K19TH",
            major_id: 12,
        },
        {
            name: "K19TT",
            major_id: 13,
        },
        {
            name: "K19XD",
            major_id: 14,
        },
        {
            name: "K20KT",
            major_id: 5,
        },
        {
            name: "K20LK",
            major_id: 6,
        },
        {
            name: "K20QN",
            major_id: 9,
        },
        {
            name: "K20QT",
            major_id: 10,
        },
        {
            name: "K20TH",
            major_id: 12,
        },
        {
            name: "K20TT",
            major_id: 13,
        },
        {
            name: "K21DL",
            major_id: 2,
        },
        {
            name: "K21KT",
            major_id: 5,
        },
        {
            name: "K21LK",
            major_id: 6,
        },
        {
            name: "K21NH",
            major_id: 7,
        },
        {
            name: "K21QN",
            major_id: 9,
        },
        {
            name: "K21QT",
            major_id: 10,
        },
        {
            name: "K21TH",
            major_id: 12,
        },
        {
            name: "K21TT",
            major_id: 13,
        },
    ]);

    await knex("user_types").del();
    await knex("user_types").insert([
        { code: "admin", name: "Người quản trị" },
        { code: "importer", name: "Người nhập liệu" },
        { code: "student", name: "Sinh viên" },
    ]);

    await knex("groups").del();
    await knex("groups").insert([
        { code: "PH", name: "Phân hiệu ĐHĐN tại Kon Tum" },
        { code: "DTN", name: "Đoàn thanh niên", group_id: 1 },
        { code: "CN", name: "Khoa Công nghệ", group_id: 1 },
        { code: "KT", name: "Khoa Kinh tế", group_id: 1 },
        { code: "LSP", name: "Khoa Luật - Sư phạm", group_id: 1 },
        { code: "HSSV", name: "Phòng công tác học sinh sinh viên", group_id: 1 },
        { code: "TTTT", name: "Phòng khảo thí", group_id: 1 },
        { code: "KTX", name: "Ký túc xá", group_id: 1 },
    ]);

    await knex("users").del();
    await knex("users").insert([
        {
            username: "admin",
            password: "password",
            first_name: "Jenny",
            last_name: "Đỗ",
            email: "adork2410@gmail.com",
            user_type_id: 1,
        },
        {
            username: "nguyenvana",
            password: "password",
            first_name: "Nguyễn Văn",
            last_name: "A",
            email: "nguyenvana@fake.com",
            user_type_id: 2,
        },
        {
            username: "nguyenvanb",
            password: "password",
            first_name: "Nguyễn Văn",
            last_name: "B",
            email: "nguyenvanb@fake.com",
            user_type_id: 2,
        },
        {
            username: "nguyenvanc",
            password: "password",
            first_name: "Nguyễn Văn",
            last_name: "C",
            email: "nguyenvanc@fake.com",
            user_type_id: 2,
        },
        {
            username: "nguyenvand",
            password: "password",
            first_name: "Nguyễn Văn",
            last_name: "D",
            email: "nguyenvand@fake.com",
            user_type_id: 2,
        },
    ]);

    await knex("group_users").del();
    await knex("group_users").insert([
        { user_id: 2, group_id: 1 },
        { user_id: 3, group_id: 2 },
        { user_id: 4, group_id: 3 },
        { user_id: 5, group_id: 4 },
    ]);

    await knex("students").del();

    await knex("years").del();
    await knex("years").insert([{ name: "2021-2022" }, { name: "2022-2023" }]);

    await knex("semesters").del();
    await knex("semesters").insert([{ name: "1", year_id: 1 }]);

    await knex("activity_types").del();
    await knex("activity_types").insert([
        { name: "Hoạt động sinh viên" },
        { name: "Khen thưởng" },
        { name: "Vi phạm" },
    ]);

    await knex("activities").del();

    await knex("student_activities").del();

    await knex("primary_titles").del();
    await knex("primary_titles").insert([
        {
            order: 1,
            title: "Đánh giá về ý thức tham gia học tập",
            description: "",
        },
        {
            order: 2,
            title: "Đánh giá về ý thức chấp hành nội quy, quy chế, quy định được thực hiện trong nhà trường",
            description: "",
        },
        {
            order: 3,
            title: "Đánh giá về ý thức tham gia các hoạt động chính trị, xã hội, văn hóa, văn nghệ, thể thao, phòng chống tội phạm và các tệ nạn xã hội",
            description: "",
        },
        {
            order: 4,
            title: "Đánh giá về ý thức công dân trong quan hệ cộng đồng",
            description: "",
        },
        {
            order: 5,
            title: "Đánh giá về ý thức và kết quả tham gia công tác cán bộ lớp, các đoàn thể, tổ chức trong nhà trường hoặc sinh viên đạt được thành tích trong học tập, rèn luyện",
            description: "",
        },
        { order: 6, title: "Điểm truyền thông", description: "" },
    ]);

    await knex("secondary_titles").del();
    await knex("secondary_titles").insert([
        {
            order: 1,
            title: "Ý thức và thái độ trong học tập",
            description: "",
            primary_title_id: 1,
        },
        {
            order: 2,
            title: "Ý thức và thái độ tham gia các câu lạc bộ học thuật, hoạt động học thuật, hoạt động ngoại khoá, hoạt động nghiên cứu khoa học",
            description: "",
            primary_title_id: 1,
        },
        {
            order: 3,
            title: "Ý thức và thái độ trong kỳ thi, kiểm tra đánh giá các học phần",
            description: "",
            primary_title_id: 1,
        },
        {
            order: 4,
            title: "Kết quả học tập (thang điểm 4)",
            description: "",
            primary_title_id: 1,
        },
        {
            order: 1,
            title: "Ý thức chấp hành các văn bản chỉ đạo của ngành, của cấp trên và ĐHĐN được thực hiện trong nhà trường",
            description: "",
            primary_title_id: 2,
        },
        {
            order: 2,
            title: "Ý thức chấp hành nội quy, quy chế và các quy định của nhà trường",
            description: "",
            primary_title_id: 2,
        },
        {
            order: 3,
            title: "Ý thức và hiệu quả tham gia các hoạt động rèn luyện về chính trị, xã hội, văn hóa, văn nghệ, thể thao",
            description: "",
            primary_title_id: 3,
        },
        {
            order: 4,
            title: "Ý thức tham gia các hoạt động công ích, tình nguyện, công tác xã hội trong nhà trường",
            description: "",
            primary_title_id: 3,
        },
        {
            order: 5,
            title: "Ý thức tham gia các hoạt động tuyên truyền, phòng chống tội phạm và các tệ nạn xã hội trong nhà trường",
            description: "",
            primary_title_id: 3,
        },
        {
            order: 1,
            title: "Ý thức chấp hành và tham gia tuyên truyền các chủ trương của Đảng, chính sách, pháp luật của Nhà nước",
            description: "",
            primary_title_id: 4,
        },
        {
            order: 2,
            title: "Có ý thức tham gia các hoạt động xã hội, có thành tích được ghi nhận, biểu dương, khen thưởng",
            description: "",
            primary_title_id: 4,
        },
        {
            order: 3,
            title: "Có tinh thần chia sẻ, giúp đỡ người gặp khó khăn, hoạn nạn",
            description: "",
            primary_title_id: 4,
        },
        {
            order: 1,
            title: "Có ý thức, tinh thần, thái độ, uy tín và đạt hiệu quả công việc khi sinh viên được phân công nhiệm vụ quản lý lớp, các tổ chức Đảng, Đoàn Thanh niên, Hội Sinh viên và các tổ chức khác trong nhà trường",
            description: "",
            primary_title_id: 5,
        },
        {
            order: 2,
            title: "Hỗ trợ và tham gia tích cực các hoạt động chung của tập thể lớp, khoa, trường và ĐHĐN",
            description: "",
            primary_title_id: 5,
        },
        {
            order: 3,
            title: "Đạt được thành tích trong học tập, rèn luyện",
            description: "",
            primary_title_id: 5,
        },
        {
            order: 1,
            title: "Cộng điểm truyền thông",
            description: "",
            primary_title_id: 6,
        },
    ]);

    await knex("third_titles").del();
    await knex("third_titles").insert([
        {
            order: 1,
            title: "Đi học chuyên cần, đúng giờ, không bỏ học giữa giờ, nghiêm túc trong giờ học; đủ điều kiện dự thi tất cả các học phần",
            max_point: 5,
            default_point: 5,
            description: "",
            secondary_title_id: 1,
        },
        {
            order: 1,
            title: "Có đăng ký, thực hiện, báo cáo đề tài nghiên cứu khoa học đúng tiến độ hoặc có đăng ký, tham dự kỳ thi sinh viên giỏi các cấp",
            max_point: 1,
            default_point: 0,
            description: "",
            secondary_title_id: 2,
        },
        {
            order: 2,
            title: "Tham gia các câu lạc bộ học thuật, các hoạt động học thuật, hoạt động ngoại khoá của trường hoặc các đơn vị khác tổ chức liên quan đến học thuật do trường điều động",
            max_point: 3,
            default_point: 0,
            description: "",
            secondary_title_id: 2,
        },
        {
            order: 1,
            title: "Không vi phạm quy chế thi và kiểm tra",
            max_point: 3,
            default_point: 3,
            description: "",
            secondary_title_id: 3,
        },
        {
            order: 1,
            title: "Cộng điểm kết quả học tập",
            max_point: 3,
            default_point: 0,
            description: "",
            secondary_title_id: 4,
        },
        {
            order: 1,
            title: "Chấp hành tốt các văn bản chỉ đạo của ngành, cấp trên và ĐHĐN được thực hiện trong nhà trường",
            max_point: 4,
            default_point: 4,
            description: "",
            secondary_title_id: 5,
        },
        {
            order: 2,
            title: "Tham gia đầy đủ, đạt yêu cầu các cuộc vận động, sinh hoạt chính trị theo chủ trương của cấp trên, ĐHĐN và nhà trường",
            max_point: 6,
            default_point: 0,
            description: "",
            secondary_title_id: 5,
        },
        {
            order: 1,
            title: "Chấp hành nội quy, quy chế và các quy định của nhà trường: về Thư viện, ký túc xá, ngoại trú, khảo sát lấy ý kiến, khám sức khỏe đầu khóa...",
            max_point: 15,
            default_point: 15,
            description: "",
            secondary_title_id: 6,
        },
        {
            order: 2,
            title: "Chấp hành quy định về đóng học phí",
            max_point: 5,
            default_point: 5,
            description: "",
            secondary_title_id: 6,
        },
        {
            order: 1,
            title: "Tham gia đầy đủ, đạt yêu cầu “Tuần sinh hoạt công dân sinh viên” (đánh giá chung cho cả hai học kỳ trong năm học)",
            max_point: 4,
            default_point: 4,
            description: "",
            secondary_title_id: 7,
        },
        {
            order: 2,
            title: "Tham gia đầy đủ, nghiêm túc hoạt động xã hội, văn hóa, văn nghệ, thể thao do ĐHĐN và nhà trường tổ chức, điều động",
            max_point: 6,
            default_point: 0,
            description: "",
            secondary_title_id: 7,
        },
        {
            order: 1,
            title: "Tham gia các hoạt động công ích, tình nguyện, công tác xã hội trong nhà trường (VD: Chiến dịch Mùa hè xanh, Mùa hè khởi nghiệp, Tiếp sức mùa thi hoặc tương đương)",
            max_point: 8,
            default_point: 0,
            description: "",
            secondary_title_id: 8,
        },
        {
            order: 1,
            title: "Tham gia các hoạt động tuyên truyền, phòng chống tội phạm và các tệ nạn xã hội trong nhà trường",
            max_point: 2,
            default_point: 0,
            description: "",
            secondary_title_id: 9,
        },
        {
            order: 1,
            title: "Chấp hành tốt, tham gia tuyên truyền các chủ trương của Đảng, chính sách, pháp luật của Nhà nước",
            max_point: 2,
            default_point: 2,
            description: "",
            secondary_title_id: 10,
        },
        {
            order: 2,
            title: "Có tham gia bảo hiểm y tế (bắt buộc) theo Luật bảo hiểm y tế",
            max_point: 10,
            default_point: 10,
            description: "",
            secondary_title_id: 10,
        },
        {
            order: 2,
            title: "Chấp hành, tham gia tuyên truyền các quy định về bảo đảm an toàn giao thông và “văn hóa giao thông”, an ninh, trật tự; an toàn giao thông (có giấy báo của các cơ quan hữu quan)",
            max_point: 3,
            default_point: 3,
            description: "",
            secondary_title_id: 10,
        },
        {
            order: 1,
            title: "Tham gia các hoạt động xã hội, có thành tích được ghi nhận, biểu dương, khen thưởng",
            max_point: 5,
            default_point: 0,
            description: "",
            secondary_title_id: 11,
        },
        {
            order: 1,
            title: "Tham gia các hoạt động: hỗ trợ tân sinh viên, sinh viên người nước ngoài, tham gia cứu người, hỗ trợ, giúp đỡ các tổ chức nhân đạo khi nhà trường có kêu gọi...",
            max_point: 5,
            default_point: 0,
            description: "",
            secondary_title_id: 12,
        },
        {
            order: 1,
            title: "Có ý thức, uy tín và hoàn thành tốt nhiệm vụ quản lý lớp, các tổ chức Đảng, Đoàn Thanh niên, Hội Sinh viên, tổ chức khác trong nhà trường",
            max_point: 5,
            default_point: 0,
            description: "",
            secondary_title_id: 13,
        },
        {
            order: 1,
            title: "Là thành viên tổ chức các chương trình; Cộng tác viên tham gia tích cực vào các hoạt động chung của lớp, khoa, trường",
            max_point: 3,
            default_point: 0,
            description: "",
            secondary_title_id: 14,
        },
        {
            order: 1,
            title: "Đạt thành tích trong học tập, rèn luyện (được tặng bằng khen, giấy khen, chứng nhận, thư khen của các cấp)",
            max_point: 2,
            default_point: 0,
            description: "",
            secondary_title_id: 15,
        },
        {
            order: 1,
            title: "Điểm truyền thông",
            max_point: 10,
            default_point: 0,
            description: "",
            secondary_title_id: 16,
        },
    ]);

    await knex("title_activities").del();
};
