import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Expand } from "lucide-react";
import { statusConfigs, type Employee, type Table, type EmployeeStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FloorPlanProps {
  employees: Employee[];
  tables: Table[];
  onSeatClick: (employeeId: number | null, tableId: number, seatNumber: number) => void;
}

export function FloorPlan({ employees, tables, onSeatClick }: FloorPlanProps) {
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  const getEmployeeAtSeat = (tableId: number, seatNumber: number): Employee | undefined => {
    return employees.find(emp => emp.tableId === tableId && emp.seatNumber === seatNumber);
  };

  const getOccupiedSeats = (tableId: number): number => {
    return employees.filter(emp => emp.tableId === tableId).length;
  };

  const renderSeat = (table: Table, seatNumber: number) => {
    const employee = getEmployeeAtSeat(table.id, seatNumber);
    const status = (employee?.status as EmployeeStatus) || "unassigned";
    const config = statusConfigs[status];
    const seatId = `table-${table.id}-seat-${seatNumber}`;
    
    return (
      <div
        key={seatId}
        className={cn(
          "relative inline-block w-8 h-8 rounded-full border-2 border-white shadow-sm cursor-pointer mx-1 mb-2 transition-all duration-200",
          config.bgColor,
          "hover:scale-110 hover:shadow-lg"
        )}
        onClick={() => onSeatClick(employee?.id || null, table.id, seatNumber)}
        onMouseEnter={() => setHoveredSeat(seatId)}
        onMouseLeave={() => setHoveredSeat(null)}
      >
        {config.pulse && employee && (
          <div className={cn(
            "absolute inset-0 rounded-full animate-ping opacity-75",
            config.bgColor
          )} />
        )}
        
        {employee && hoveredSeat === seatId && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap z-20 animate-in fade-in-0 zoom-in-95">
            <div className="font-medium">{employee.fullName}</div>
            <div className="text-gray-300">{employee.jobTitle}</div>
            <div className="text-gray-300">Last: {employee.lastActivity ? new Date(employee.lastActivity).toLocaleTimeString() : 'Unknown'}</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Interactive Floor Plan</CardTitle>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600">Click seats for employee details</span>
            <Button variant="ghost" size="icon">
              <Expand className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Legend */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Status Indicators</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            {Object.entries(statusConfigs).map(([status, config]) => (
              <div key={status} className="flex items-center">
                <div className={cn(
                  "w-3 h-3 rounded-full mr-2",
                  config.bgColor,
                  config.pulse && "animate-pulse"
                )} />
                <span className="text-slate-700">{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floor Plan Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <div key={table.id} className="bg-slate-100 rounded-lg p-4 text-center relative">
              <h4 className="font-medium text-slate-700 mb-3">{table.name}</h4>
              <div className="flex flex-wrap justify-center">
                {Array.from({ length: table.seats }, (_, i) => renderSeat(table, i + 1))}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                {getOccupiedSeats(table.id)}/{table.seats} occupied
              </div>
              {table.department && (
                <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                  {table.department}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
