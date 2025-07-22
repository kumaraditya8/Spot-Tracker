import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/layout/navigation";
import { Download, Filter, BarChart3, Users, Clock, Activity } from "lucide-react";
import { useActivities } from "@/hooks/use-activities";
import { useEmployees } from "@/hooks/use-employees";
import { useToast } from "@/hooks/use-toast";
import { statusConfigs, type EmployeeStatus } from "@/lib/types";

interface FilterState {
  actionType: string;
  employee: string;
  fromDate: string;
  toDate: string;
}

export default function Reports() {
  const { toast } = useToast();
  const { data: activities = [] } = useActivities();
  const { data: employees = [] } = useEmployees();
  
  const [filters, setFilters] = useState<FilterState>({
    actionType: "all",
    employee: "all",
    fromDate: "",
    toDate: "",
  });

  // Calculate analytics
  const analytics = {
    totalActivities: activities.length,
    totalEmployees: employees.length,
    recentActivities: activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      const today = new Date();
      const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return activityDate >= oneDayAgo;
    }).length,
    filteredResults: activities.length, // This will be updated based on filters
  };

  // Filter activities based on current filters
  const filteredActivities = activities.filter(activity => {
    const matchesAction = filters.actionType === "all" || activity.action === filters.actionType;
    const matchesEmployee = filters.employee === "all" || activity.employeeId?.toString() === filters.employee;
    
    let matchesDateRange = true;
    if (filters.fromDate || filters.toDate) {
      const activityDate = new Date(activity.timestamp);
      if (filters.fromDate) {
        const fromDate = new Date(filters.fromDate);
        matchesDateRange = matchesDateRange && activityDate >= fromDate;
      }
      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        toDate.setHours(23, 59, 59, 999); // Include the entire day
        matchesDateRange = matchesDateRange && activityDate <= toDate;
      }
    }
    
    return matchesAction && matchesEmployee && matchesDateRange;
  });

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      let dataToExport;
      let filename;
      let mimeType;

      if (format === 'json') {
        if (filters.employee) {
          // Export specific employee data
          dataToExport = JSON.stringify(filteredActivities, null, 2);
          filename = `activities-${filters.employee}-${new Date().toISOString().split('T')[0]}.json`;
        } else {
          // Export all employees
          dataToExport = JSON.stringify(employees, null, 2);
          filename = `employees-${new Date().toISOString().split('T')[0]}.json`;
        }
        mimeType = 'application/json';
      } else {
        // CSV format
        const headers = ['Date & Time', 'Employee', 'Action', 'Description'];
        const csvData = [
          headers.join(','),
          ...filteredActivities.map(activity => [
            new Date(activity.timestamp).toLocaleString(),
            activity.employeeName,
            activity.action,
            `"${activity.description.replace(/"/g, '""')}"` // Escape quotes in CSV
          ].join(','))
        ].join('\n');
        
        dataToExport = csvData;
        filename = `activities-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }

      const blob = new Blob([dataToExport], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: `Data exported as ${format.toUpperCase()} successfully`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      actionType: "",
      employee: "",
      fromDate: "",
      toDate: "",
    });
  };

  const actionTypes = [...new Set(activities.map(activity => activity.action))];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation title="Reports & Analytics" showBackButton />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Reports & Analytics</h2>
            <p className="text-slate-600 mt-1">View detailed activity reports and export data</p>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button onClick={() => handleExport('json')} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Employees (JSON)
            </Button>
            <Button onClick={() => handleExport('json')} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Activities (JSON)
            </Button>
            <Button onClick={() => handleExport('csv')} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Employees (CSV)
            </Button>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-slate-700">Total Activities</div>
                    <div className="text-2xl font-bold text-slate-900">{analytics.totalActivities}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-slate-700">Total Employees</div>
                    <div className="text-2xl font-bold text-slate-900">{analytics.totalEmployees}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-slate-700">Recent Activities</div>
                    <div className="text-2xl font-bold text-slate-900">{analytics.recentActivities}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Filter className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-slate-700">Filtered Results</div>
                    <div className="text-2xl font-bold text-slate-900">{filteredActivities.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Activity Filters
              </CardTitle>
              <p className="text-sm text-slate-600">Filter activities by action, employee, and date range</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Action Type</label>
                  <Select value={filters.actionType} onValueChange={(value) => setFilters(prev => ({ ...prev, actionType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {actionTypes.map(action => (
                        <SelectItem key={action} value={action}>{action.replace(/_/g, ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Employee</label>
                  <Select value={filters.employee} onValueChange={(value) => setFilters(prev => ({ ...prev, employee: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Employees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>{employee.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">From Date</label>
                  <Input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">To Date</label>
                  <Input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <p className="text-sm text-slate-600">Detailed view of all system activities</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Date & Time</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Employee</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Action</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivities.map((activity) => (
                      <tr key={activity.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm text-slate-900">
                          {new Date(activity.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-900">
                          {activity.employeeName}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={
                            activity.action === 'STATUS_CHANGE' ? 'default' :
                            activity.action === 'EMPLOYEE_CREATED' ? 'secondary' :
                            activity.action === 'SEAT_ASSIGNMENT' ? 'outline' : 'secondary'
                          }>
                            {activity.action.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {activity.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredActivities.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No activities found matching your filters
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
