import { useQuery } from "@tanstack/react-query";
import type { Activity } from "@shared/schema";

export function useActivities() {
  return useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  });
}

export function useExportEmployees() {
  return useQuery<any[]>({
    queryKey: ["/api/export/employees"],
    enabled: false, // Only run when explicitly called
  });
}

export function useExportActivities() {
  return useQuery<any[]>({
    queryKey: ["/api/export/activities"],
    enabled: false, // Only run when explicitly called
  });
}
