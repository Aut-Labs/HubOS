import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Tooltip,
  Typography,
  styled
} from "@mui/material";
import { memo, useEffect, useMemo, useState } from "react";
import LoadingProgressBar from "@components/LoadingProgressBar";
import RefreshIcon from "@mui/icons-material/Refresh";
import { setTitle } from "@store/ui-reducer";
import { useAppDispatch } from "@store/store.model";
import AutLoading from "@components/AutLoading";
import useQueryTaskTypes from "@hooks/useQueryTaskTypes";
import { ModuleDefinitionCard } from "../Modules/Shared/PluginCard";
import HubOsTabs from "@components/HubOsTabs";

const GridBox = styled(Box)(({ theme }) => {
  return {
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "1fr",
    gridGap: "30px",
    [theme.breakpoints.up("sm")]: {
      gridTemplateColumns: "repeat(2,minmax(0,1fr))"
    },
    [theme.breakpoints.up("lg")]: {
      gridTemplateColumns: "repeat(3,minmax(0,1fr))"
    }
  };
});

const AutTasksTab = ({ tasks, isLoading }) => {
  return (
    <GridBox sx={{ flexGrow: 1, mt: 4 }}>
      {/* @TODO - Iulia to redesign this */}
      {tasks.map((taskType, index) => (
        <ModuleDefinitionCard
          key={`modules-plugin-${index}`}
          isFetching={isLoading}
          taskType={taskType}
        />
      ))}
    </GridBox>
  );
};

const SocialTasksTab = ({ tasks, isLoading }) => {
  const { discordTasks, twitterTasks, githubTasks } = tasks;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4, mt: 4 }}>
      {discordTasks?.length > 0 && (
        <Box>
          <Typography
            variant="h4"
            sx={{
              color: "white",
              fontWeight: 600,
              borderBottom: "1px solid",
              borderColor: "grey.700",
              pb: 1,
              mb: 2
            }}
          >
            Discord Tasks
          </Typography>
          <GridBox>
            {discordTasks.map((taskType, index) => (
              <ModuleDefinitionCard
                key={`discord-task-${index}`}
                isFetching={isLoading}
                taskType={taskType}
              />
            ))}
          </GridBox>
        </Box>
      )}

      {twitterTasks?.length > 0 && (
        <Box>
          <Typography
            variant="h4"
            sx={{
              color: "white",
              fontWeight: 600,
              borderBottom: "1px solid",
              borderColor: "grey.700",
              pb: 1,
              mb: 2
            }}
          >
            Twitter Tasks
          </Typography>
          <GridBox>
            {twitterTasks.map((taskType, index) => (
              <ModuleDefinitionCard
                key={`twitter-task-${index}`}
                isFetching={isLoading}
                taskType={taskType}
              />
            ))}
          </GridBox>
        </Box>
      )}

      {githubTasks?.length > 0 && (
        <Box>
          <Typography
            variant="h4"
            sx={{
              color: "white",
              fontWeight: 600,
              borderBottom: "1px solid",
              borderColor: "grey.700",
              pb: 1,
              mb: 2
            }}
          >
            GitHub Tasks
          </Typography>
          <GridBox>
            {githubTasks.map((taskType, index) => (
              <ModuleDefinitionCard
                key={`github-task-${index}`}
                isFetching={isLoading}
                taskType={taskType}
              />
            ))}
          </GridBox>
        </Box>
      )}

      {!discordTasks?.length &&
        !twitterTasks?.length &&
        !githubTasks?.length && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 4
            }}
          >
            <Typography sx={{ color: "grey.400" }}>
              No social tasks available
            </Typography>
          </Box>
        )}
    </Box>
  );
};

const TaskManager = ({ isLoading, data, refetch }) => {
  const dispatch = useAppDispatch();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  useEffect(() => {
    dispatch(setTitle(`Modules`));
  }, [dispatch]);

  const filteredTasks = useMemo(() => {
    const discordTasks: any[] = [];
    const twitterTasks: any[] = [];
    const githubTasks: any[] = [];
    const otherTasks: any[] = [];

    if (data) {
      data.forEach((task) => {
        const taskType = task.metadata.properties.type;

        // Sort by specific task types
        if (
          taskType === "DiscordGatherings" ||
          taskType === "DiscordPolls" ||
          taskType === "JoinDiscord"
        ) {
          discordTasks.push(task);
        } else if (
          taskType === "TwitterLike" ||
          taskType === "TwitterComment" ||
          taskType === "TwitterFollow" ||
          taskType === "TwitterRetweet"
        ) {
          twitterTasks.push(task);
        } else if (taskType === "GitHubOpenPR" || taskType === "GitHubCommit") {
          githubTasks.push(task);
        } else {
          otherTasks.push(task);
        }
      });
    }

    return {
      discordTasks,
      twitterTasks,
      githubTasks,
      otherTasks
    };
  }, [data]);

  const tabs = useMemo(() => {
    if (filteredTasks && filteredTasks.otherTasks.length) {
      return [
        {
          label: "Āut Tasks",
          props: {
            tasks: filteredTasks.otherTasks,
            isLoading: isLoading
          },
          component: AutTasksTab
        },
        {
          label: "Socials Tasks",
          props: {
            tasks: filteredTasks,
            isLoading: isLoading
          },
          component: SocialTasksTab
        }
      ];
    } else {
      return [];
    }
  }, [filteredTasks, isLoading, data]);

  return (
    <>
      <LoadingProgressBar isLoading={isLoading} />
      <Container maxWidth="md" sx={{ py: "20px" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            position: "relative"
          }}
        >
          <Typography textAlign="center" color="white" variant="h3" mb={4}>
            Task Manager
          </Typography>
        </Box>

        {!isLoading && !data?.length && (
          <Box
            sx={{
              display: "flex",
              gap: "20px",
              mt: 12,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Typography color="rgb(107, 114, 128)" variant="subtitle2">
              No task types were found...
            </Typography>
            <Button
              size="medium"
              color="offWhite"
              startIcon={<RefreshIcon />}
              sx={{
                ml: 1
              }}
              disabled={isLoading}
              onClick={refetch}
            >
              Refresh
            </Button>
          </Box>
        )}

        {isLoading && !tabs ? (
          <AutLoading width="130px" height="130px" />
        ) : (
          <>
            <HubOsTabs selectedTabIndex={selectedTabIndex} tabs={tabs} />
            <GridBox sx={{ flexGrow: 1, mt: 4 }}>
              {/* @TODO - Iulia to redesign this */}
              {/* {filteredTasks.otherTasks.map((taskType, index) => (
                <ModuleDefinitionCard
                  key={`modules-plugin-${index}`}
                  isFetching={isLoading}
                  taskType={taskType}
                />
              ))} */}
            </GridBox>
          </>
        )}
      </Container>
    </>
  );
};

export default memo(TaskManager);
