import type { Employee, Table, Activity } from "@shared/schema";

export type { Employee, Table, Activity };

export type EmployeeStatus = "present" | "idle" | "sleep" | "remote" | "absent" | "unassigned";

export type StatusConfig = {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  pulse?: boolean;
};

export const statusConfigs: Record<EmployeeStatus, StatusConfig> = {
  present: {
    label: "Present",
    color: "text-green-700",
    bgColor: "bg-green-500",
    icon: "fas fa-check",
    pulse: true,
  },
  idle: {
    label: "Idle",
    color: "text-yellow-700",
    bgColor: "bg-yellow-500",
    icon: "fas fa-clock",
    pulse: true,
  },
  sleep: {
    label: "Sleep",
    color: "text-purple-700",
    bgColor: "bg-purple-500",
    icon: "fas fa-moon",
    pulse: true,
  },
  remote: {
    label: "Remote",
    color: "text-blue-700",
    bgColor: "bg-blue-500",
    icon: "fas fa-laptop",
  },
  absent: {
    label: "Absent",
    color: "text-red-700",
    bgColor: "bg-red-500",
    icon: "fas fa-times",
  },
  unassigned: {
    label: "Unassigned",
    color: "text-gray-700",
    bgColor: "bg-gray-500",
    icon: "fas fa-question",
  },
};

export interface EmployeeFormData {
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  currentProject?: string;
  macAddress?: string;
}

export interface TableFormData {
  name: string;
  seats: number;
  department?: string;
}

export interface FilterState {
  search: string;
  department: string;
  status: string;
}
