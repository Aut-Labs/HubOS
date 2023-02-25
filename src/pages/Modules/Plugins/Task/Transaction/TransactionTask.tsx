import { PluginDefinition } from "@aut-labs-private/sdk";
import { IsAdmin } from "@store/Community/community.reducer";
import { memo } from "react";
import { useSelector } from "react-redux";

interface PluginParams {
  plugin: PluginDefinition;
}

const TransactionTask = ({ plugin }: PluginParams) => {
  const isAdmin = useSelector(IsAdmin);
  return (
    <>
      @Iulia - Implement task details
      {/* <TaskDetails /> */}
      {/* Transaction task specific */}
    </>
  );
};

export default memo(TransactionTask);
