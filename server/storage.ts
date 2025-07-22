import { 
  employees, 
  tables, 
  activities, 
  type Employee, 
  type InsertEmployee, 
  type UpdateEmployee,
  type Table, 
  type InsertTable, 
  type UpdateTable,
  type Activity,
  type InsertActivity 
} from "@shared/schema";

export interface IStorage {
  // Employee methods
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: UpdateEmployee): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;
  
  // Table methods
  getTables(): Promise<Table[]>;
  getTable(id: number): Promise<Table | undefined>;
  createTable(table: InsertTable): Promise<Table>;
  updateTable(id: number, table: UpdateTable): Promise<Table | undefined>;
  deleteTable(id: number): Promise<boolean>;
  
  // Activity methods
  getActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Special methods
  assignEmployeeToSeat(employeeId: number, tableId: number, seatNumber: number): Promise<Employee | undefined>;
  updateEmployeeStatus(employeeId: number, status: string): Promise<Employee | undefined>;
}

export class MemStorage implements IStorage {
  private employees: Map<number, Employee> = new Map();
  private tables: Map<number, Table> = new Map();
  private activities: Map<number, Activity> = new Map();
  private currentEmployeeId = 1;
  private currentTableId = 1;
  private currentActivityId = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize with some default tables
    const defaultTables: InsertTable[] = [
      { name: "Engineering Hub", seats: 4, department: "Engineering" },
      { name: "Design Studio", seats: 4, department: "Design" },
      { name: "DevOps Corner", seats: 2, department: "Engineering" },
      { name: "Marketing Central", seats: 4, department: "Marketing" },
      { name: "Sales Floor", seats: 6, department: "Sales" },
      { name: "Conference Area", seats: 8, department: "General" }
    ];

    defaultTables.forEach(table => {
      const id = this.currentTableId++;
      const newTable: Table = {
        ...table,
        id,
        department: table.department || null,
        createdAt: new Date(),
      };
      this.tables.set(id, newTable);
    });
  }

  // Employee methods
  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = this.currentEmployeeId++;
    const now = new Date();
    const employee: Employee = {
      ...insertEmployee,
      id,
      status: insertEmployee.status || "unassigned",
      currentProject: insertEmployee.currentProject || null,
      tableId: insertEmployee.tableId || null,
      seatNumber: insertEmployee.seatNumber || null,
      macAddress: insertEmployee.macAddress || null,
      idleTime: insertEmployee.idleTime || 0,
      totalActiveTime: insertEmployee.totalActiveTime || 0,
      createdAt: now,
      updatedAt: now,
      lastActivity: now,
    };
    this.employees.set(id, employee);
    
    // Create activity log
    await this.createActivity({
      employeeId: id,
      employeeName: employee.fullName,
      action: "EMPLOYEE_CREATED",
      description: `${employee.fullName} was added to the system`,
      metadata: { department: employee.department, jobTitle: employee.jobTitle }
    });
    
    return employee;
  }

  async updateEmployee(id: number, updateEmployee: UpdateEmployee): Promise<Employee | undefined> {
    const existing = this.employees.get(id);
    if (!existing) return undefined;

    const updated: Employee = {
      ...existing,
      ...updateEmployee,
      updatedAt: new Date(),
    };
    this.employees.set(id, updated);
    
    // Create activity log
    await this.createActivity({
      employeeId: id,
      employeeName: updated.fullName,
      action: "EMPLOYEE_UPDATED",
      description: `${updated.fullName} information was updated`,
      metadata: updateEmployee
    });
    
    return updated;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const employee = this.employees.get(id);
    if (!employee) return false;
    
    // Create activity log before deletion
    await this.createActivity({
      employeeId: id,
      employeeName: employee.fullName,
      action: "EMPLOYEE_DELETED",
      description: `${employee.fullName} was removed from the system`,
      metadata: null
    });
    
    return this.employees.delete(id);
  }

  // Table methods
  async getTables(): Promise<Table[]> {
    return Array.from(this.tables.values());
  }

  async getTable(id: number): Promise<Table | undefined> {
    return this.tables.get(id);
  }

  async createTable(insertTable: InsertTable): Promise<Table> {
    const id = this.currentTableId++;
    const table: Table = {
      ...insertTable,
      id,
      department: insertTable.department || null,
      createdAt: new Date(),
    };
    this.tables.set(id, table);
    
    // Create activity log
    await this.createActivity({
      employeeId: null,
      employeeName: "System",
      action: "TABLE_CREATED",
      description: `Table "${table.name}" was created with ${table.seats} seats`,
      metadata: { tableId: id, seats: table.seats, department: table.department }
    });
    
    return table;
  }

  async updateTable(id: number, updateTable: UpdateTable): Promise<Table | undefined> {
    const existing = this.tables.get(id);
    if (!existing) return undefined;

    const updated: Table = {
      ...existing,
      ...updateTable,
    };
    this.tables.set(id, updated);
    
    // Create activity log
    await this.createActivity({
      employeeId: null,
      employeeName: "System",
      action: "TABLE_UPDATED",
      description: `Table "${updated.name}" was updated`,
      metadata: updateTable
    });
    
    return updated;
  }

  async deleteTable(id: number): Promise<boolean> {
    const table = this.tables.get(id);
    if (!table) return false;
    
    // Unassign all employees from this table
    const employeeArray = Array.from(this.employees.values());
    for (const employee of employeeArray) {
      if (employee.tableId === id) {
        await this.updateEmployee(employee.id, { 
          tableId: null, 
          seatNumber: null, 
          status: "unassigned" 
        });
      }
    }
    
    // Create activity log
    await this.createActivity({
      employeeId: null,
      employeeName: "System",
      action: "TABLE_DELETED",
      description: `Table "${table.name}" was deleted`,
      metadata: null
    });
    
    return this.tables.delete(id);
  }

  // Activity methods
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values()).sort((a, b) => 
      new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = {
      ...insertActivity,
      id,
      employeeId: insertActivity.employeeId || null,
      metadata: insertActivity.metadata || null,
      timestamp: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  // Special methods
  async assignEmployeeToSeat(employeeId: number, tableId: number, seatNumber: number): Promise<Employee | undefined> {
    const employee = this.employees.get(employeeId);
    const table = this.tables.get(tableId);
    
    if (!employee || !table) return undefined;
    if (seatNumber < 1 || seatNumber > table.seats) return undefined;
    
    // Check if seat is already taken
    const existingEmployee = Array.from(this.employees.values()).find(
      emp => emp.tableId === tableId && emp.seatNumber === seatNumber && emp.id !== employeeId
    );
    if (existingEmployee) return undefined;
    
    const updated = await this.updateEmployee(employeeId, {
      tableId,
      seatNumber,
      status: "present"
    });
    
    if (updated) {
      await this.createActivity({
        employeeId,
        employeeName: updated.fullName,
        action: "SEAT_ASSIGNMENT",
        description: `${updated.fullName} was assigned to ${table.name} - Seat ${seatNumber}`,
        metadata: { tableId, seatNumber, tableName: table.name }
      });
    }
    
    return updated;
  }

  async updateEmployeeStatus(employeeId: number, status: string): Promise<Employee | undefined> {
    const employee = this.employees.get(employeeId);
    if (!employee) return undefined;
    
    const updated = await this.updateEmployee(employeeId, {
      status,
      lastActivity: new Date(),
    });
    
    if (updated) {
      await this.createActivity({
        employeeId,
        employeeName: updated.fullName,
        action: "STATUS_CHANGE",
        description: `${updated.fullName} status changed to ${status}`,
        metadata: { previousStatus: employee.status, newStatus: status }
      });
    }
    
    return updated;
  }
}

export const storage = new MemStorage();
