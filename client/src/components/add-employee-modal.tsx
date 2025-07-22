import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateEmployee, useUpdateEmployee } from "@/hooks/use-employees";
import { useAssignSeat } from "@/hooks/use-employees";
import { useTables } from "@/hooks/use-tables";
import { useToast } from "@/hooks/use-toast";
import type { Employee } from "@/lib/types";

const employeeFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  jobTitle: z.string().min(1, "Job title is required"),
  department: z.string().min(1, "Department is required"),
  currentProject: z.string().optional(),
  macAddress: z.string().optional(),
  tableId: z.string().optional(),
  seatNumber: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null;
}

const departments = [
  "Engineering",
  "Design", 
  "Marketing",
  "Sales",
  "HR",
  "Finance",
  "Operations"
];

export function AddEmployeeModal({ isOpen, onClose, employee }: AddEmployeeModalProps) {
  const { toast } = useToast();
  const { data: tables = [] } = useTables();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const assignSeat = useAssignSeat();
  
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      fullName: employee?.fullName || "",
      email: employee?.email || "",
      jobTitle: employee?.jobTitle || "",
      department: employee?.department || "",
      currentProject: employee?.currentProject || "",
      macAddress: employee?.macAddress || "",
      tableId: employee?.tableId?.toString() || "",
      seatNumber: employee?.seatNumber?.toString() || "",
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      const employeeData = {
        fullName: data.fullName,
        email: data.email,
        jobTitle: data.jobTitle,
        department: data.department,
        currentProject: data.currentProject || undefined,
        macAddress: data.macAddress || undefined,
        status: "unassigned",
        tableId: null,
        seatNumber: null,
        idleTime: 0,
        totalActiveTime: 0,
      };

      if (employee) {
        // Update existing employee
        await updateEmployee.mutateAsync({
          id: employee.id,
          data: employeeData,
        });
        toast({
          title: "Employee Updated",
          description: `${data.fullName} has been updated successfully.`,
        });
      } else {
        // Create new employee
        const newEmployee = await createEmployee.mutateAsync(employeeData);
        
        // Assign seat if specified
        if (data.tableId && data.seatNumber) {
          await assignSeat.mutateAsync({
            employeeId: newEmployee.id,
            tableId: parseInt(data.tableId),
            seatNumber: parseInt(data.seatNumber),
          });
        }
        
        toast({
          title: "Employee Added",
          description: `${data.fullName} has been added to the system.`,
        });
      }
      
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save employee. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedTableData = selectedTable ? tables.find(t => t.id === selectedTable) : null;
  const maxSeats = selectedTableData?.seats || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter employee name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="employee@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Senior Developer" {...field} />
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
                    <FormLabel>Department</FormLabel>
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

              <FormField
                control={form.control}
                name="currentProject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Project</FormLabel>
                    <FormControl>
                      <Input placeholder="Project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="macAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MAC Address</FormLabel>
                    <FormControl>
                      <Input placeholder="00:00:00:00:00:00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t pt-6">
              <h4 className="font-medium text-slate-900 mb-4">Seat Assignment (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tableId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Table</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedTable(value ? parseInt(value) : null);
                          form.setValue("seatNumber", "");
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Available Seat" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tables.map((table) => (
                            <SelectItem key={table.id} value={table.id.toString()}>
                              {table.name} ({table.department})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seatNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seat Number</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!selectedTable}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Seat" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: maxSeats }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              Seat {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createEmployee.isPending || updateEmployee.isPending}>
                {employee ? "Update Employee" : "Add Employee"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
