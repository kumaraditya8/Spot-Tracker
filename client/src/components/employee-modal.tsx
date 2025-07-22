import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, History, Bell, Mail, MapPin, Clock, Network } from "lucide-react";
import { statusConfigs, type Employee, type EmployeeStatus } from "@/lib/types";

interface EmployeeModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (employee: Employee) => void;
}

export function EmployeeModal({ employee, isOpen, onClose, onEdit }: EmployeeModalProps) {
  if (!employee) return null;

  const status = employee.status as EmployeeStatus;
  const config = statusConfigs[status];
  
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const productivity = Math.max(0, Math.min(100, 
    Math.round((employee.totalActiveTime || 0) / (8 * 60) * 100)
  ));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Header */}
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
              {employee.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-bold text-slate-900">{employee.fullName}</h2>
                <Badge className={`${config.bgColor} text-white`}>
                  <div className="w-2 h-2 bg-white rounded-full mr-2" />
                  {config.label}
                </Badge>
              </div>
              <p className="text-slate-600 mb-1">{employee.jobTitle}</p>
              <p className="text-slate-500 text-sm">{employee.department} Department</p>
            </div>
          </div>

          {/* Employee Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-slate-400" />
                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <div className="text-slate-900">{employee.email}</div>
                </div>
              </div>
              
              {employee.currentProject && (
                <div className="flex items-center space-x-3">
                  <History className="h-5 w-5 text-slate-400" />
                  <div>
                    <label className="text-sm font-medium text-slate-700">Current Project</label>
                    <div className="text-slate-900">{employee.currentProject}</div>
                  </div>
                </div>
              )}
              
              {employee.tableId && employee.seatNumber && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <div>
                    <label className="text-sm font-medium text-slate-700">Seat Location</label>
                    <div className="text-slate-900">Table {employee.tableId} - Seat {employee.seatNumber}</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-slate-400" />
                <div>
                  <label className="text-sm font-medium text-slate-700">Last Activity</label>
                  <div className="text-slate-900">
                    {employee.lastActivity ? new Date(employee.lastActivity).toLocaleString() : 'Unknown'}
                  </div>
                </div>
              </div>
              
              {employee.macAddress && (
                <div className="flex items-center space-x-3">
                  <Network className="h-5 w-5 text-slate-400" />
                  <div>
                    <label className="text-sm font-medium text-slate-700">MAC Address</label>
                    <div className="text-slate-900 font-mono text-sm">{employee.macAddress}</div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-slate-400" />
                <div>
                  <label className="text-sm font-medium text-slate-700">Idle Time Today</label>
                  <div className="text-slate-900">{formatTime(employee.idleTime || 0)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-3">Today's Activity</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatTime(employee.totalActiveTime || 0)}
                </div>
                <div className="text-sm text-slate-600">Active Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {formatTime(employee.idleTime || 0)}
                </div>
                <div className="text-sm text-slate-600">Idle Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {productivity}%
                </div>
                <div className="text-sm text-slate-600">Productivity</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button onClick={() => onEdit(employee)} className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit Employee
            </Button>
            <Button variant="outline" className="flex-1">
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
            <Button variant="outline" className="flex-1">
              <Bell className="h-4 w-4 mr-2" />
              Set Alerts
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
