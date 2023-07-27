import {
  useGetAllOnboardingQuestsQuery,
  useGetAllTasksPerQuestQuery,
  useLaunchOnboardingMutation
} from "@api/onboarding.api";
import { PluginDefinition } from "@aut-labs/sdk";
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Chip,
  Badge
} from "@mui/material";
import { Link, useLocation, useParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { memo, useEffect, useMemo } from "react";
import { CommunityData, IsAdmin } from "@store/Community/community.reducer";
import { useSelector } from "react-redux";
import LinkWithQuery from "@components/LinkWithQuery";
import { ButtonWithPulse, QuestTasks, getQuestStatus } from "./QuestShared";
import Tasks from "../../Task/Shared/Tasks";
import RefreshIcon from "@mui/icons-material/Refresh";
import LoadingProgressBar from "@components/LoadingProgressBar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { setTitle } from "@store/ui-reducer";
import { useAppDispatch } from "@store/store.model";
import AutLoading from "@components/AutLoading";
import { useEthers } from "@usedapp/core";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import SuccessDialog from "@components/Dialog/SuccessPopup";
import { autUrls } from "@api/environment";
import ErrorDialog from "@components/Dialog/ErrorPopup";

interface PluginParams {
  plugin: PluginDefinition;
}

const Quest = ({ plugin }: PluginParams) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isAdmin = useSelector(IsAdmin);
  const { account: userAddress } = useEthers();
  const params = useParams<{ questId: string }>();
  const communityData = useSelector(CommunityData);
  const urls = autUrls();

  const {
    data: tasksAndSubmissions,
    isLoading: isLoadingTasks,
    isFetching,
    refetch
  } = useGetAllTasksPerQuestQuery(
    {
      userAddress,
      isAdmin,
      questId: +params.questId,
      pluginAddress: plugin.pluginAddress
    },
    {
      refetchOnMountOrArgChange: true,
      skip: false
    }
  );

  const { tasks } = useMemo(
    () => tasksAndSubmissions || ({} as unknown as any),
    [tasksAndSubmissions]
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

  const twitterProps = {
    title: `${communityData?.name} has just launched on Āut Labs and joined the Coordination Renaissance🎉

We are now onboarding ${quest?.metadata?.name} - take a quest, prove yourself, & join us as we bring human Coordination to the next level⚖️`,
    // hashtags: ["Āut", "DAO", "Blockchain"]
    url: communityData?.properties?.address
      ? // keep this bizarre formatting otherwise the tweet won't have the correct new lines and alignment
        `${urls.showcase}?daoAddress=${communityData?.properties?.address}`
      : "https://Aut.id/"
  };

  const [
    launchOnboarding,
    {
      error: activateError,
      isError: activateIsError,
      isLoading: isActivating,
      isSuccess: isSuccessOnboarding,
      reset: activateReset
    }
  ] = useLaunchOnboardingMutation();

  useEffect(() => {
    dispatch(setTitle(`Quest - ${quest?.metadata?.name || ""}`));
  }, [dispatch, quest]);

  const editPath = useMemo(() => {
    return location.pathname.replaceAll(`/${quest?.questId}`, "/create");
  }, [location.pathname, quest]);

  const isLoading = useMemo(() => {
    return isLoadingPlugins || isLoadingTasks;
  }, [isLoadingTasks, isLoadingPlugins]);

  const questStatus = useMemo(() => getQuestStatus(quest), [quest]);

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
      <ErrorDialog
        handleClose={() => activateReset()}
        open={activateIsError}
        message={activateError}
      />
      <LoadingDialog
        open={isActivating}
        message={
          isActivating ? "Launching quest..." : "Deactivating onboarding..."
        }
      />
      <SuccessDialog
        open={isSuccessOnboarding}
        message="Success!"
        titleVariant="h2"
        subtitle="Whoop! You launched your Quest. Now it's time to share and check the submissions!"
        subtitleVariant="subtitle1"
        handleClose={() => activateReset()}
        twitterProps={twitterProps}
      ></SuccessDialog>
      <LoadingProgressBar isLoading={isFetching} />
      {isLoading ? (
        <AutLoading width="130px" height="130px" />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative"
          }}
        >
          <Stack alignItems="center" justifyContent="center">
            <Button
              startIcon={<ArrowBackIcon />}
              color="offWhite"
              sx={{
                position: {
                  sm: "absolute"
                },
                left: {
                  sm: "0"
                }
              }}
              to="/aut-dashboard/modules/OnboardingStrategy/QuestOnboardingPlugin"
              component={Link}
            >
              All Quests
            </Button>
            <Stack position="relative" direction="row" alignItems="center">
              <Typography textAlign="center" color="white" variant="h3">
                {quest?.metadata?.name} Quest
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center"
                }}
              >
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
                {/* <Tooltip title="Edit quest">
                  <IconButton
                    size="medium"
                    color="offWhite"
                    sx={{
                      ml: 1
                    }}
                    to={editPath}
                    disabled={quest?.tasksCount >= 5}
                    preserveParams
                    queryParams={{
                      onboardingQuestAddress: plugin.pluginAddress,
                      returnUrlLinkName: "Back to quest",
                      returnUrl: location.pathname,
                      questId: quest?.questId?.toString()
                    }}
                    component={LinkWithQuery}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip> */}
              </Box>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center"
            }}
          >
            <Tooltip title={questStatus?.description}>
              <Chip
                sx={{
                  mt: 1
                }}
                label={questStatus?.label}
                color={questStatus?.color as any}
                size="small"
              />
            </Tooltip>

            {/* <OverflowTooltip
              typography={{
                maxWidth: "400px"
              }}
              text={quest?.metadata?.description}
            /> */}
          </Box>

          {/* {isAdmin && !quest?.active && quest?.tasksCount > 0 && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                mt: 2,
                alignItems: "center",
                justifyContent: "flex-end"
              }}
            >
              <Badge
                invisible={tasks?.length < 5}
                badgeContent={
                  <Tooltip title="During beta there is a maximum of 5 tasks per quest">
                    <ErrorOutlineIcon color="error" />
                  </Tooltip>
                }
              >
                <Button
                  startIcon={<AddIcon />}
                  variant="outlined"
                  disabled={tasks?.length >= 5}
                  size="medium"
                  color="primary"
                  to="/aut-dashboard/modules/Task"
                  preserveParams
                  queryParams={{
                    onboardingQuestAddress: plugin?.pluginAddress,
                    returnUrlLinkName: "Back to quest",
                    returnUrl: location.pathname,
                    questId: params?.questId.toString()
                  }}
                  component={LinkWithQuery}
                >
                  Add task
                </Button>
              </Badge>
            </Box>
          )} */}
        </Box>
      )}

      {!!quest && (
        <Box
          sx={{
            display: "flex",
            mt: 4,
            alignItems: "center",
            justifyContent: "flex-end"
          }}
        >
          <Stack
            width="100%"
            direction={{
              sm: "row"
            }}
            justifyContent="flex-end"
            alignItems={{
              xs: "center"
            }}
            gap={2}
          >
            {isAdmin && (
              <Box>
                <Badge
                  invisible={quest?.tasksCount > 0}
                  badgeContent={
                    <Tooltip title="You need 3 active quests to launch.">
                      <InfoIcon
                        sx={{
                          color: "offWhite.main"
                        }}
                      />
                    </Tooltip>
                  }
                >
                  <ButtonWithPulse
                    disabled={quest?.tasksCount === 0}
                    variant="outlined"
                    size="medium"
                    color="offWhite"
                    onClick={() =>
                      launchOnboarding({
                        quests: [],
                        userAddress: userAddress,
                        pluginAddress: plugin.pluginAddress
                      })
                    }
                  >
                    Launch quest
                  </ButtonWithPulse>
                </Badge>
              </Box>
            )}
          </Stack>
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
            No tasks yet...
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            size="large"
            color="offWhite"
            to="/aut-dashboard/modules/Task"
            preserveParams
            queryParams={{
              onboardingQuestAddress: plugin.pluginAddress,
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

      {!isLoading && !!tasks?.length && (
        <>
          {isAdmin && (
            <QuestTasks
              isLoading={isLoading}
              tasks={tasks}
              isAdmin={isAdmin}
              canAdd={!quest?.active}
              canDelete={!quest?.active}
              onboardingQuestAddress={plugin.pluginAddress}
              questId={+params.questId}
              isSubmission={false}
            />
          )}

          {!isAdmin && (
            <Tasks
              canAdd={!quest?.active}
              questId={quest?.questId}
              canDelete={!quest?.active}
              onboardingQuestAddress={plugin.pluginAddress}
              isAdmin={isAdmin}
              isLoading={isLoading}
              tasks={tasks}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default memo(Quest);
