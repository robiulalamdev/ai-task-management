export interface ITask {
  _id: string;
  name: string;
  status: "Pending" | "In Progress" | "Completed";
  date: string;
  start_date: string;
  end_date: string;
}

// You can also create a type for the form data, which doesn't include the id
export type TaskFormData = Omit<ITask, "id">;

// If you need a type for the status options
export type TaskStatus = ITask["status"];
