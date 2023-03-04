import { PluginDefinition } from "@aut-labs-private/sdk";
import { Container } from "@mui/material";
import { IsAdmin } from "@store/Community/community.reducer";
import { memo } from "react";
import { useSelector } from "react-redux";

interface PluginParams {
  plugin: PluginDefinition;
}

const JoinDiscordTask = ({ plugin }: PluginParams) => {
  const isAdmin = useSelector(IsAdmin);
  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        height: "100%",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        position: "relative"
      }}
    >
      @Iulia - Implement task details for join disctord
      {/* <TaskDetails /> */}
      {/* Join discord specific */}
    </Container>
  );
};

export default memo(JoinDiscordTask);
