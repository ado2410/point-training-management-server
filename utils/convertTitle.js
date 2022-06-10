const calculatePoint = (thirdTitleActivity) => {
    if (thirdTitleActivity.type !== "third") return "";
    if (thirdTitleActivity.title_activities.length === 0) return thirdTitleActivity.max_point;
    let point = thirdTitleActivity.title_activities.reduce((point, titleActivity) => {
        const activity = titleActivity.activity;
        if (!activity.student_activity) return point;
        const studentActivity = activity.student_activity;
        const studentValue = studentActivity.value || activity.default_value || 0;
        if (activity.type === "CHECK") {
            return point + titleActivity.point[studentValue];
        }
        else if (activity.type === "COUNT" || activity.type === "POINT") {
            let currentPoint = activity.default_value || 0;
            if (activity.type === "COUNT") currentPoint = studentValue * titleActivity.point[0];
            titleActivity.options.map(option => {
                switch (option.type) {
                    case "eq":
                        if (studentValue === parseFloat(option.value)) currentPoint = parseFloat(option.point);
                        break;
                    case "gt":
                        if (studentValue > parseFloat(option.value)) currentPoint = parseFloat(option.point);
                        break;
                    case "lt":
                        if (studentValue < parseFloat(option.value)) currentPoint = parseFloat(option.point);
                        break;
                    case "gte":
                        if (studentValue >= parseFloat(option.value)) currentPoint = parseFloat(option.point);
                        break;
                    case "lte":
                        if (studentValue <= parseFloat(option.value)) currentPoint = parseFloat(option.point);
                        break;
                }
            });
            return point + currentPoint;
        }
        else if (activity.type === "ENUM")
            return point + titleActivity.point[studentValue];
        else return point;
    }, thirdTitleActivity.default_point);
    return Math.min(Math.max(point, 0), thirdTitleActivity.max_point);
}

module.exports = calculatePoint;