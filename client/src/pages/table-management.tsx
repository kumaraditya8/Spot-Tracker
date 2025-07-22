import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/layout/navigation";
import { Plus, Table as TableIcon, Edit, Trash2, Users } from "lucide-react";
import { useTables, useCreateTable, useDeleteTable } from "@/hooks/use-tables";
import { useEmployees } from "@/hooks/use-employees";
import { useToast } from "@/hooks/use-toast";
import type { Table } from "@/lib/types";

const tableFormSchema = z.object({
  name: z.string().min(1, "Table name is required"),
  seats: z.number().min(1, "At least 1 seat is required").max(20, "Maximum 20 seats allowed"),
  department: z.string().optional(),
});

type TableFormData = z.infer<typeof tableFormSchema>;

const departments = [
  "Engineering",
  "Design", 
  "Marketing",
  "Sales",
  "HR",
  "Finance",
  "Operations",
  "General"
];

export default function TableManagement() {
  const { toast } = useToast();
  const { data: tables = [], isLoading } = useTables();
  const { data: employees = [] } = useEmployees();
  const createTable = useCreateTable();
  const deleteTable = useDeleteTable();
  
  const [showForm, setShowForm] = useState(false);
  
  const form = useForm<TableFormData>({
    resolver: zodResolver(tableFormSchema),
    defaultValues: {
      name: "",
      seats: 4,
      department: "",
    },
  });

  const onSubmit = async (data: TableFormData) => {
    try {
      await createTable.mutateAsync({
        name: data.name,
        seats: data.seats,
        department: data.department || undefined,
      });
      
      toast({
        title: "Table Created",
        description: `${data.name} has been created successfully.`,
      });
      
      form.reset();
      setShowForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create table. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTable = async (table: Table) => {
    const employeesAtTable = employees.filter(emp => emp.tableId === table.id);
    
    if (employeesAtTable.length > 0) {
      toast({
        title: "Cannot Delete Table",
        description: `${table.name} has ${employeesAtTable.length} assigned employees. Please reassign them first.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteTable.mutateAsync(table.id);
      toast({
        title: "Table Deleted",
        description: `${table.name} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete table. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTableOccupancy = (tableId: number) => {
    return employees.filter(emp => emp.tableId === tableId).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation title="Table Management" showBackButton />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500">Loading tables...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation title="Table Management" showBackButton />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Table Management</h2>
              <p className="text-slate-600 mt-1">Manage office tables and seating arrangements</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Table
            </Button>
          </div>

          {/* Add Table Form */}
          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New Table</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Table Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Engineering Table" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="seats"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Seats</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="20" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {departments.map((dept) => (
                                  <SelectItem key={dept} value={dept}>
                                    {dept}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createTable.isPending}>
                        <TableIcon className="h-4 w-4 mr-2" />
                        Create Table
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Tables Grid */}
          {tables.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map((table) => {
                const occupancy = getTableOccupancy(table.id);
                const occupancyPercentage = (occupancy / table.seats) * 100;
                
                return (
                  <Card key={table.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TableIcon className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{table.name}</CardTitle>
                        </div>
                        {table.department && (
                          <Badge variant="secondary">{table.department}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Capacity</span>
                        <span className="font-medium">{table.seats} seats</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Occupied</span>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">{occupancy}/{table.seats}</span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${occupancyPercentage}%` }}
                        />
                      </div>
                      
                      <div className="text-xs text-slate-500">
                        {occupancyPercentage.toFixed(0)}% occupied
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteTable(table)}
                          disabled={occupancy > 0}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <TableIcon className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Tables Found</h3>
                <p className="text-slate-600 mb-6 text-center max-w-md">
                  Get started by creating your first table
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Table
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
