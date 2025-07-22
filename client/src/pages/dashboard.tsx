import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Filter, Users, Clock, Moon, BarChart3 } from "lucide-react";
import { Navigation } from "@/components/layout/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { FloorPlan } from "@/components/floor-plan";
import { EmployeeModal } from "@/components/employee-modal";
import { AddEmployeeModal } from "@/components/add-employee-modal";
import { useEmployees } from "@/hooks/use-employees";
import { useTables } from "@/hooks/use-tables";
import { useActivities } from "@/hooks/use-activities";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { statusConfigs, type Employee, type FilterState, type EmployeeStatus } from "@/lib/types";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: employees = [] } = useEmployees();
  const { data: tables = [] } = useTables();
  const { data: activities = [] } = useActivities();
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    department: "all",
    status: "all",
  });

  // Filter employees based on current filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !filters.search || 
      employee.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.jobTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
      (employee.currentProject && employee.currentProject.toLowerCase().includes(filters.search.toLowerCase()));
    
    const matchesDepartment = filters.department === "all" || employee.department === filters.department;
    const matchesStatus = filters.status === "all" || employee.status === filters.status;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Calculate analytics
  const analytics = {
    totalActivities: activities.length,
    activeEmployees: employees.filter(emp => emp.status === 'present').length,
    avgIdleTime: employees.reduce((acc, emp) => acc + (emp.idleTime || 0), 0) / Math.max(employees.length, 1),
    sleepSessions: employees.filter(emp => emp.status === 'sleep').length,
  };

  const handleSeatClick = (employeeId: number | null, tableId: number, seatNumber: number) => {
    if (employeeId) {
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee) {
        setSelectedEmployee(employee);
        setShowEmployeeModal(true);
      }
    } else {
      toast({
        title: "Unassigned Seat",
        description: `Table ${tableId}, Seat ${seatNumber} is available for assignment`,
      });
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowAddEmployeeModal(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowAddEmployeeModal(true);
    setShowEmployeeModal(false);
  };

  const handleExportData = async () => {
    try {
      const exportData = {
        employees,
        tables,
        activities: activities.slice(0, 100), // Last 100 activities
        timestamp: new Date().toISOString(),
        analytics,
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `workspace-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data Exported",
        description: "Workspace data has been exported successfully",
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
    setFilters({ search: "", department: "", status: "" });
    toast({
      title: "Filters Cleared",
      description: "All filters have been reset",
    });
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}.${Math.round(mins/60 * 10)}h` : `${mins}m`;
  };

  const departments = [...new Set(employees.map(emp => emp.department))];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation title="Enhanced Workspace Tracking" />
      
      <div className="flex h-[calc(100vh-73px)]">
        <Sidebar
          onAddEmployee={handleAddEmployee}
          onManageTables={() => setLocation("/tables")}
          onExportData={handleExportData}
          onViewReports={() => setLocation("/reports")}
        />
        
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Enhanced Workspace Overview</h2>
                  <p className="text-slate-600 mt-1">Real-time employee tracking with advanced status monitoring</p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search employees, projects, or departments..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filters.department} onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.entries(statusConfigs).map(([status, config]) => (
                      <SelectItem key={status} value={status}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button onClick={clearFilters} variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-700 ml-3">Total Activities</h3>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{analytics.totalActivities}</div>
                  <p className="text-sm text-slate-500 mt-1">System events tracked</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-700 ml-3">Active Employees</h3>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{analytics.activeEmployees}</div>
                  <p className="text-sm text-slate-500 mt-1">Currently present</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-700 ml-3">Avg Idle Time</h3>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{formatTime(analytics.avgIdleTime)}</div>
                  <p className="text-sm text-slate-500 mt-1">Today's average</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Moon className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-700 ml-3">Sleep Sessions</h3>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{analytics.sleepSessions}</div>
                  <p className="text-sm text-slate-500 mt-1">Detected today</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Interactive Floor Plan */}
              <div className="lg:col-span-2">
                <FloorPlan
                  employees={filteredEmployees}
                  tables={tables}
                  onSeatClick={handleSeatClick}
                />
              </div>

              {/* Employee List and Analytics */}
              <div className="space-y-6">
                {/* Employee List */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Employee List</CardTitle>
                      <span className="text-sm text-slate-500">{filteredEmployees.length} employees</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-64 overflow-y-auto">
                      {filteredEmployees.map((employee) => {
                        const status = employee.status as EmployeeStatus;
                        const config = statusConfigs[status];
                        
                        return (
                          <div
                            key={employee.id}
                            className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer transition-colors border-b last:border-0"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowEmployeeModal(true);
                            }}
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium text-sm mr-3">
                                {employee.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 text-sm">{employee.fullName}</div>
                                <div className="text-xs text-slate-500">{employee.jobTitle}</div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${config.bgColor} ${config.pulse ? 'animate-pulse' : ''}`} />
                              <span className="text-xs text-slate-600 capitalize">{config.label}</span>
                            </div>
                          </div>
                        );
                      })}
                      
                      {filteredEmployees.length === 0 && (
                        <div className="p-6 text-center text-slate-500">
                          No employees found matching your filters
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Productivity Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Productivity Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Active Time</span>
                        <span className="text-sm font-medium text-slate-900">
                          {formatTime(employees.reduce((acc, emp) => acc + (emp.totalActiveTime || 0), 0) / Math.max(employees.length, 1))} avg
                        </span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Idle Time</span>
                        <span className="text-sm font-medium text-slate-900">{formatTime(analytics.avgIdleTime)} avg</span>
                      </div>
                      <Progress value={15} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Focus Score</span>
                        <span className="text-sm font-medium text-slate-900">87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Live Updates */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Live Updates</CardTitle>
                      <div className="flex items-center text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                        <span className="text-sm">Live</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activities.slice(0, 5).map((activity, index) => (
                        <div key={activity.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                            <span className="text-slate-700 truncate">{activity.description}</span>
                          </div>
                          <span className="text-slate-500 flex-shrink-0">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                      
                      {activities.length === 0 && (
                        <div className="text-center text-slate-500 py-4">
                          No recent activities
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EmployeeModal
        employee={selectedEmployee}
        isOpen={showEmployeeModal}
        onClose={() => {
          setShowEmployeeModal(false);
          setSelectedEmployee(null);
        }}
        onEdit={handleEditEmployee}
      />

      <AddEmployeeModal
        isOpen={showAddEmployeeModal}
        onClose={() => {
          setShowAddEmployeeModal(false);
          setEditingEmployee(null);
        }}
        employee={editingEmployee}
      />
    </div>
  );
}
