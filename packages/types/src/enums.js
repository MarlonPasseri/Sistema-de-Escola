"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementAudience = exports.AttendanceStatus = exports.InterventionStatus = exports.RiskLevel = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["SCHOOL_ADMIN"] = "SCHOOL_ADMIN";
    UserRole["COORDINATOR"] = "COORDINATOR";
    UserRole["TEACHER"] = "TEACHER";
    UserRole["STUDENT"] = "STUDENT";
    UserRole["GUARDIAN"] = "GUARDIAN";
})(UserRole || (exports.UserRole = UserRole = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "LOW";
    RiskLevel["MEDIUM"] = "MEDIUM";
    RiskLevel["HIGH"] = "HIGH";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var InterventionStatus;
(function (InterventionStatus) {
    InterventionStatus["OPEN"] = "OPEN";
    InterventionStatus["IN_PROGRESS"] = "IN_PROGRESS";
    InterventionStatus["WAITING_GUARDIAN"] = "WAITING_GUARDIAN";
    InterventionStatus["RESOLVED"] = "RESOLVED";
    InterventionStatus["CANCELLED"] = "CANCELLED";
})(InterventionStatus || (exports.InterventionStatus = InterventionStatus = {}));
var AttendanceStatus;
(function (AttendanceStatus) {
    AttendanceStatus["PRESENT"] = "PRESENT";
    AttendanceStatus["ABSENT"] = "ABSENT";
    AttendanceStatus["LATE"] = "LATE";
    AttendanceStatus["JUSTIFIED"] = "JUSTIFIED";
})(AttendanceStatus || (exports.AttendanceStatus = AttendanceStatus = {}));
var AnnouncementAudience;
(function (AnnouncementAudience) {
    AnnouncementAudience["ALL"] = "ALL";
    AnnouncementAudience["CLASS"] = "CLASS";
    AnnouncementAudience["STUDENT"] = "STUDENT";
    AnnouncementAudience["GUARDIAN"] = "GUARDIAN";
    AnnouncementAudience["TEACHER"] = "TEACHER";
})(AnnouncementAudience || (exports.AnnouncementAudience = AnnouncementAudience = {}));
//# sourceMappingURL=enums.js.map