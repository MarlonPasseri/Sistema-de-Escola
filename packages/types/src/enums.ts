export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  COORDINATOR = 'COORDINATOR',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  GUARDIAN = 'GUARDIAN',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum InterventionStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_GUARDIAN = 'WAITING_GUARDIAN',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  JUSTIFIED = 'JUSTIFIED',
}

export enum AnnouncementAudience {
  ALL = 'ALL',
  CLASS = 'CLASS',
  STUDENT = 'STUDENT',
  GUARDIAN = 'GUARDIAN',
  TEACHER = 'TEACHER',
}
