import { Task } from "@aut-labs-private/sdk";
import { memo } from "react";

interface TaskDetailsParams {
  task: Task;
}

const TaskDetails = ({ task }: TaskDetailsParams) => {
  return <>@Iulia - implement base task details</>;
};

export default memo(TaskDetails);
