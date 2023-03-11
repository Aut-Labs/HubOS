import {
  useGetAllOnboardingQuestsQuery,
  useGetAllTasksPerQuestQuery
} from "@api/onboarding.api";
import { PluginDefinition } from "@aut-labs-private/sdk";
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  IconButton,
  Tooltip
} from "@mui/material";
import { Link, useLocation, useParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { memo, useEffect, useMemo } from "react";
import { IsAdmin } from "@store/Community/community.reducer";
import { useSelector } from "react-redux";
import LinkWithQuery from "@components/LinkWithQuery";
import AutTabs from "@components/AutTabs/AutTabs";
import { TaskStatus } from "@aut-labs-private/sdk/dist/models/task";
import { QuestTasks } from "./QuestShared";
import OverflowTooltip from "@components/OverflowTooltip";
import Tasks from "../../Task/Shared/Tasks";
import RefreshIcon from "@mui/icons-material/Refresh";
import LoadingProgressBar from "@components/LoadingProgressBar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { setTitle } from "@store/ui-reducer";
import { useAppDispatch } from "@store/store.model";

interface PluginParams {
  plugin: PluginDefinition;
}

const Quest = ({ plugin }: PluginParams) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isAdmin = useSelector(IsAdmin);
  const params = useParams<{ questId: string }>();

  const {
    data: allTasks,
    isLoading: isLoadingTasks,
    isFetching,
    refetch
  } = useGetAllTasksPerQuestQuery(
    {
      questId: +params.questId,
      pluginAddress: plugin.pluginAddress
    },
    {
      refetchOnMountOrArgChange: false,
      skip: false
    }
  );

  const { quest, isLoading: isLoadingPlugins } = useGetAllOnboardingQuestsQuery(
    plugin.pluginAddress,
    {
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        isLoading: isLoading || isFetching,
        quest: (data || []).find((q) => q.questId === +params?.questId)
      })
    }
  );

  useEffect(() => {
    dispatch(setTitle(`Quest - ${quest?.metadata?.name}`));
  }, [dispatch, quest]);

  const isLoading = useMemo(() => {
    return isLoadingPlugins || isLoadingTasks;
  }, [isLoadingTasks, isLoadingPlugins]);

  const { tasks, submissions } = useMemo(() => {
    return (allTasks || []).reduce(
      (prev, curr) => {
        if (curr.status === TaskStatus.Submitted) {
          prev.submissions = [...prev.submissions, curr];
        } else {
          prev.tasks = [...prev.tasks, curr];
        }
        return prev;
      },
      {
        tasks: [],
        submissions: []
      }
    );
  }, [allTasks]);

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: "20px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        position: "relative"
      }}
    >
      <LoadingProgressBar isLoading={isFetching} />
      {isLoading ? (
        <CircularProgress className="spinner-center" size="60px" />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            position: "relative"
          }}
        >
          <Stack alignItems="center" justifyContent="center">
            <Button
              startIcon={<ArrowBackIcon />}
              color="offWhite"
              sx={{
                position: "absolute",
                left: 0
              }}
              to="/aut-dashboard/modules/Onboarding/QuestOnboardingPlugin"
              component={Link}
            >
              Back
            </Button>
            <Typography textAlign="center" color="white" variant="h3">
              {quest?.metadata?.name}
              <Tooltip title="Refresh quests">
                <IconButton
                  size="medium"
                  component="span"
                  color="offWhite"
                  sx={{
                    ml: 1
                  }}
                  disabled={isLoading || isFetching}
                  onClick={refetch}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Typography>
          </Stack>

          <OverflowTooltip
            typography={{
              maxWidth: "400px"
            }}
            text={quest?.metadata?.description}
          />

          <Box
            sx={{
              display: "grid",
              alignItems: "center",
              mx: "auto",
              gridTemplateColumns: "1fr 1fr 1fr"
            }}
          >
            <Stack direction="column" alignItems="center">
              <Typography
                fontFamily="FractulAltBold"
                variant="subtitle2"
                color={quest?.active ? "success" : "error"}
              >
                {quest?.active ? "Active" : "Inactive"}
              </Typography>
              <Typography variant="caption" className="text-secondary">
                Status
              </Typography>
            </Stack>
            <Stack direction="column" alignItems="center">
              <Typography
                fontFamily="FractulAltBold"
                color="white"
                variant="subtitle2"
              >
                {new Date(quest?.startDate * 1000).toDateString()}
              </Typography>
              <Typography variant="caption" className="text-secondary">
                Start date
              </Typography>
            </Stack>
            <Stack direction="column" alignItems="center">
              <Typography
                fontFamily="FractulAltBold"
                color="white"
                variant="subtitle2"
              >
                {quest?.tasksCount}
              </Typography>
              <Typography variant="caption" className="text-secondary">
                Total tasks
              </Typography>
            </Stack>
          </Box>
        </Box>
      )}

      {!isLoading && !tasks?.length && (
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
          <Typography className="text-secondary" variant="subtitle2">
            No tasks have been added to this quest yet...
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            size="medium"
            color="offWhite"
            to="/aut-dashboard/modules/Task"
            preserveParams
            queryParams={{
              questPluginAddress: plugin.pluginAddress,
              returnUrlLinkName: "Back to quest",
              returnUrl: location.pathname,
              questId: params.questId
            }}
            component={LinkWithQuery}
          >
            Add first task
          </Button>
        </Box>
      )}

      {!isLoading && !!tasks.length && (
        <>
          {isAdmin && (
            <AutTabs
              tabStyles={{
                mt: 4,
                flex: 1
              }}
              tabs={[
                {
                  label: "Task",
                  props: {
                    isLoading,
                    tasks: tasks,
                    isAdmin,
                    questPluginAddress: plugin.pluginAddress,
                    questId: params.questId
                  },
                  component: QuestTasks
                },
                {
                  label: "Submissions",
                  props: {
                    isLoading,
                    isAdmin,
                    tasks: submissions,
                    questPluginAddress: plugin.pluginAddress,
                    questId: params.questId
                  },
                  component: QuestTasks
                }
              ]}
            />
          )}

          {!isAdmin && (
            <Tasks isAdmin={isAdmin} isLoading={isLoading} tasks={tasks} />
          )}
        </>
      )}
    </Container>
  );
};

export default memo(Quest);
