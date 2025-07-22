import { Users, Table, Download, BarChart3, Settings, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActivities } from "@/hooks/use-activities";
import { statusConfigs } from "@/lib/types";

interface SidebarProps {
  onAddEmployee: () => void;
  onManageTables: () => void;
  onExportData: () => void;
  onViewReports: () => void;
}

export function Sidebar({ onAddEmployee, onManageTables, onExportData, onViewReports }: SidebarProps) {
  const { data: activities = [] } = useActivities();

  const systemStatus = {
    trackingService: { status: "online", icon: "fas fa-check", color: "text-green-500" },
    database: { status: "connected", icon: "fas fa-check", color: "text-green-500" },
    lastSync: "2 min ago",
    activeConnections: 23,
  };

  const recentActivities = activities.slice(0, 4).map(activity => ({
    name: activity.employeeName,
    action: activity.description,
    time: new Date(activity.timestamp).toLocaleString(),
    type: activity.action.toLowerCase().includes('status') ? 'status' : 'general',
  }));

  return (
    <div className="w-64 bg-white border-r border-slate-200 p-6">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button onClick={onAddEmployee} className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
            <Button onClick={onManageTables} variant="outline" className="w-full justify-start">
              <Table className="h-4 w-4 mr-2" />
              Manage Tables
            </Button>
            <Button onClick={onExportData} variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button onClick={onViewReports} variant="outline" className="w-full justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </div>
        </div>

        {/* System Status */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">System Status</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Tracking Service</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Database</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Last Sync</span>
              <span className="text-slate-500">{systemStatus.lastSync}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Active Connections</span>
              <span className="text-slate-700 font-medium">{systemStatus.activeConnections}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-700">Recent Activity</h3>
            <button className="text-xs text-primary hover:text-primary/80">View all →</button>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Activity className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-900 font-medium">{activity.name}</p>
                  <p className="text-xs text-slate-500 truncate">{activity.action}</p>
                  <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
