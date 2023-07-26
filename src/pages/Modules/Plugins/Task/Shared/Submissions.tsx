import { Task } from "@aut-labs-private/sdk";
import {
  Box,
  Stack,
  Typography,
  styled,
  CardHeader,
  CardContent,
  Card,
  Button,
  Container,
  Chip,
  useTheme
} from "@mui/material";
import { memo, useMemo } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";

import { TaskStatus } from "@store/model";
import { useGetAllPluginDefinitionsByDAOQuery } from "@api/plugin-registry.api";
import {
  PluginDefinition,
  PluginDefinitionType
} from "@aut-labs-private/sdk/dist/models/plugin";
import { TaskType } from "@aut-labs-private/sdk/dist/models/task";
import OverflowTooltip from "@components/OverflowTooltip";
import AutLoading from "@components/AutLoading";
import { useGetAllTasksPerQuestQuery } from "@api/onboarding.api";
import { useEthers } from "@usedapp/core";
import { RequiredQueryParams } from "@api/RequiredQueryParams";
import { useSelector } from "react-redux";
import { CommunityData, IsAdmin } from "@store/Community/community.reducer";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CopyAddress from "@components/CopyAddress";
import differenceInDays from "date-fns/differenceInDays";

export const taskStatuses: any = {
  [TaskStatus.Created]: {
    label: "To Do",
    color: "info"
  },
  [TaskStatus.Finished]: {
    label: "Completed",
    color: "success"
  },
  [TaskStatus.Submitted]: {
    label: "Pending",
    color: "warning"
  },
  [TaskStatus.Taken]: {
    label: "Taken",
    color: "info"
  }
};

export const taskTypes = {
  [TaskType.Open]: {
    pluginType: PluginDefinitionType.OnboardingOpenTaskPlugin,
    label: "Open Task",
    labelColor: "#FFC1A9"
  },
  [TaskType.ContractInteraction]: {
    pluginType: PluginDefinitionType.OnboardingTransactionTaskPlugin,
    label: "Contract Interaction",
    labelColor: "#FFECB3"
  },
  [TaskType.Quiz]: {
    pluginType: PluginDefinitionType.OnboardingQuizTaskPlugin,
    label: "Multiple-Choice Quiz",
    labelColor: "#C1FFC1 "
  },
  [TaskType.JoinDiscord]: {
    pluginType: PluginDefinitionType.OnboardingJoinDiscordTaskPlugin,
    label: "Join Discord",
    labelColor: "#A5AAFF"
  }
};

export const SubmissionCard = ({
  row,
  questId,
  daoAddress,
  onboardingQuestAddress
}: {
  row: Task;
  questId: string;
  daoAddress: string;
  onboardingQuestAddress: string;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const communityData = useSelector(CommunityData);
  const theme = useTheme();

  const { plugin } = useGetAllPluginDefinitionsByDAOQuery(null, {
    selectFromResult: ({ data }) => ({
      questOnboarding: (data || []).find(
        (p) =>
          PluginDefinitionType.QuestOnboardingPlugin === p.pluginDefinitionId
      ),
      plugin: (data || []).find(
        (p) => taskTypes[row.taskType].pluginType === p.pluginDefinitionId
      )
    })
  });

  const path = useMemo(() => {
    if (!plugin) return;
    const stackType = plugin.metadata.properties.module.type;
    const stack = `modules/${stackType}`;
    return `${stack}/${PluginDefinitionType[plugin.pluginDefinitionId]}`;
  }, [plugin]);

  return (
    <>
      <GridCard
        sx={{
          bgcolor: "nightBlack.main",
          borderColor: "divider",
          borderRadius: "16px",
          minHeight: "385px",
          boxShadow: 7,
          display: "flex",
          flexDirection: "column"
        }}
        variant="outlined"
      >
        <CardHeader
          sx={{
            alignItems: "flex-start",
            ".MuiCardHeader-action": {
              mt: "3px"
            }
          }}
          titleTypographyProps={{
            fontFamily: "FractulAltBold",
            mb: 2,
            fontWeight: 900,
            color: "white",
            variant: "subtitle1"
          }}
          subheaderTypographyProps={{
            color: "white"
          }}
          title={row?.metadata?.name}
        />
        <CardContent
          sx={{
            pt: 0,
            flex: 1,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Stack flex={1} direction="column" gap={2}>
            <Typography variant="body" color="white">
              Status:{" "}
              <Chip
                sx={{
                  ml: 1
                }}
                label={taskStatuses[row.status].label}
                color={taskStatuses[row.status].color}
                size="small"
              />
            </Typography>
            <Typography
              sx={{
                display: "flex",
                gridGap: 4
              }}
              variant="body"
              color="white"
            >
              Submitter:{" "}
              <CopyAddress
                color={theme.palette.primary.main}
                address={row.submitter}
              />
            </Typography>
            <Typography variant="body" color="white">
              Task type:{" "}
              <span
                style={{
                  // backgroundColor: taskTypes[row.taskType]?.labelColor,
                  // color: "#000",
                  padding: "4px 6px",
                  borderRadius: "4px"
                }}
              >
                {taskTypes[row.taskType]?.label}
              </span>
            </Typography>
            <Typography variant="body" color="white">
              Duration:{" "}
              {differenceInDays(new Date(row.endDate), new Date(row.startDate))}{" "}
              days
            </Typography>

            <OverflowTooltip maxLine={4} text={row.metadata?.description} />
          </Stack>

          <Box
            sx={{
              width: "100%",
              display: "flex"
            }}
          >
            <Button
              sx={{
                width: "80%",
                mt: 6,
                mb: 4,
                mx: "auto"
              }}
              onClick={() => {
                navigate({
                  pathname: `/${communityData?.name}/${path}/${row.taskId}`,
                  search: new URLSearchParams({
                    submitter: row.submitter,
                    questId: questId.toString(),
                    onboardingQuestAddress: onboardingQuestAddress,
                    daoAddress: daoAddress,
                    returnUrlLinkName: "Back to quest",
                    returnUrl: `${location?.pathname}`
                  }).toString()
                });
              }}
              size="large"
              variant="outlined"
              color="offWhite"
            >
              Go to Submission
            </Button>
          </Box>
        </CardContent>
      </GridCard>
    </>
  );
};

const GridCard = styled(Card)(({ theme }) => {
  return {
    minHeight: "365px",
    width: "100%",
    transition: theme.transitions.create(["transform"]),
    "&:hover": {
      transform: "scale(1.019)"
    }
  };
});

export const SubmissionsGridBox = styled(Box)(({ theme }) => {
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

interface TasksParams {
  isLoading: boolean;
  tasks: Task[];
  canDelete?: boolean;
  isAdmin: boolean;
  onboardingQuestAddress: string;
  questId: number;
}

interface PluginParams {
  plugin: PluginDefinition;
}

const Submissions = ({ plugin }: PluginParams) => {
  const [searchParams] = useSearchParams();
  const { account: userAddress } = useEthers();
  const params = useParams<{ taskId: string }>();
  const isAdmin = useSelector(IsAdmin);
  const communityData = useSelector(CommunityData);

  const { task, submissions, isLoading } = useGetAllTasksPerQuestQuery(
    {
      userAddress,
      isAdmin,
      pluginAddress: searchParams.get(
        RequiredQueryParams.OnboardingQuestAddress
      ),
      questId: +searchParams.get(RequiredQueryParams.QuestId)
    },
    {
      selectFromResult: ({ data, isLoading, isFetching }) => {
        return {
          isLoading: isLoading || isFetching,
          ...(data?.tasks || []).reduce(
            (prev, curr) => {
              const isCurrentTask =
                curr.taskId === +params?.taskId &&
                PluginDefinitionType.OnboardingOpenTaskPlugin ===
                  taskTypes[curr.taskType].pluginType;

              if (isCurrentTask) {
                prev.task = curr;
                prev.submissions = data.submissions.filter(
                  (r) => r.taskId === curr.taskId
                );
              }
              return prev;
            },
            { task: null, submissions: [] }
          )
        };
      }
    }
  );

  const taskParams = useMemo(() => {
    return {
      questId: searchParams.get(RequiredQueryParams.QuestId),
      onboardingQuestAddress: searchParams.get(
        RequiredQueryParams.OnboardingQuestAddress
      ),
      daoAddress: searchParams.get(RequiredQueryParams.DaoAddress)
    };
  }, [searchParams]);

  return (
    <Container
      sx={{
        py: "20px",
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}
      maxWidth="lg"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mb: 4,
          mx: "auto",
          position: "relative",
          width: "100%"
        }}
      >
        {isLoading ? (
          <AutLoading width="130px" height="130px" />
        ) : (
          <>
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
                to={{
                  pathname: `/${
                    communityData?.name
                  }/modules/OnboardingStrategy/QuestOnboardingPlugin/${+searchParams.get(
                    RequiredQueryParams.QuestId
                  )}`,
                  search: searchParams.toString()
                }}
                component={Link}
              >
                {searchParams.get("returnUrlLinkName") || "Back"}
              </Button>
              <Typography textAlign="center" color="white" variant="h3">
                {task?.metadata?.name}
              </Typography>
            </Stack>
            {!!submissions?.length && (
              <SubmissionsGridBox sx={{ flexGrow: 1, mt: 4 }}>
                {submissions.map((row, index) => (
                  <SubmissionCard
                    key={`table-row-${index}`}
                    row={row}
                    questId={taskParams.questId}
                    onboardingQuestAddress={taskParams.onboardingQuestAddress}
                    daoAddress={taskParams.daoAddress}
                    {...taskParams}
                  />
                ))}
              </SubmissionsGridBox>
            )}

            {!isLoading && !submissions?.length && (
              <Box
                sx={{
                  display: "flex",
                  gap: "20px",
                  pt: 12,
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Typography className="text-secondary" variant="subtitle2">
                  No submissions yet...
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default memo(Submissions);
