import { Task } from "@aut-labs/sdk";
import {
  Box,
  Stack,
  Typography,
  styled,
  IconButton,
  CardHeader,
  CardContent,
  Card,
  Button,
  CardActionArea,
  CardActions
} from "@mui/material";
import { memo, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { TaskStatus } from "@store/model";
import { useGetAllPluginDefinitionsByDAOQuery } from "@api/plugin-registry.api";
import { PluginDefinitionType } from "@aut-labs/sdk/dist/models/plugin";
import { TaskType } from "@aut-labs/sdk/dist/models/task";
import DeleteIcon from "@mui/icons-material/Delete";
import { useConfirmDialog } from "react-mui-confirm";
import OverflowTooltip from "@components/OverflowTooltip";
import AutLoading from "@components/AutLoading";
import {
  useRemoveTaskFromQuestMutation,
  useRemoveTaskMutation
} from "@api/onboarding.api";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import AddIcon from "@mui/icons-material/Add";
import { RequiredQueryParams } from "@api/RequiredQueryParams";
import { CommunityData } from "@store/Community/community.reducer";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import { differenceInDays } from "date-fns";

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
    label: "Submitted",
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
  // [TaskType.ContractInteraction]: {
  //   pluginType: PluginDefinitionType.OnboardingTransactionTaskPlugin,
  //   label: "Contract Interaction",
  //   labelColor: "#FFECB3"
  // },
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

const TaskCard = ({
  row,
  isAdmin,
  canDelete
}: {
  row: Task;
  isAdmin: boolean;
  canDelete: boolean;
}) => {
  const params = useParams<{ questId: string }>();
  const navigate = useNavigate();
  const confirm = useConfirmDialog();
  const [searchParams] = useSearchParams();
  const communityData = useSelector(CommunityData);
  const { address: userAddress } = useAccount();
  const [removeTask, { error, isError, isLoading, reset }] =
    useRemoveTaskMutation();

  const { plugin } = useGetAllPluginDefinitionsByDAOQuery(null, {
    selectFromResult: ({ data }) => ({
      plugin: (data || []).find(
        (p) => taskTypes[row.taskType].pluginType === p.pluginDefinitionId
      )
    })
  });

  const confimDelete = () =>
    confirm({
      title: "Are you sure you want to delete this task?",
      onConfirm: () => {
        removeTask({
          userAddress,
          task: row,
          questId: +params.questId,
          pluginTokenId: plugin.tokenId,
          pluginAddress: plugin.pluginAddress,
          novaAddress: searchParams.get(RequiredQueryParams.NovaAddress)
        });
      }
    });

  const path = useMemo(() => {
    if (!plugin) return;
    const stackType = plugin.metadata.properties.module.type;
    const stack = `modules/${stackType}`;
    return `${stack}/${PluginDefinitionType[plugin.pluginDefinitionId]}`;
  }, [plugin]);

  return (
    <>
      <ErrorDialog handleClose={() => reset()} open={isError} message={error} />
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
          action={
            <IconButton
              disabled={isLoading || !canDelete}
              color="error"
              onClick={() => {
                confimDelete();
              }}
            >
              <DeleteIcon />
            </IconButton>
          }
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
              Task type:{" "}
              <span
                style={{
                  // backgroundColor: taskTypes[row.taskType]?.labelColor,
                  // color: "#333333",
                  padding: "2px 6px",
                  borderRadius: "2px"
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
            {plugin.pluginDefinitionId ===
              PluginDefinitionType.OnboardingOpenTaskPlugin && (
              <Button
                sx={{
                  width: "80%",
                  mt: 6,
                  mx: "auto"
                }}
                onClick={() => {
                  navigate({
                    pathname: `/${communityData?.name}/modules/Task/OnboardingOpenTaskPlugin/${row.taskId}/submissions`
                  });
                }}
                size="large"
                variant="outlined"
                color="offWhite"
              >
                Submissions
              </Button>
            )}
          </Box>
        </CardContent>
        <CardActions
          sx={{
            justifyContent: "flex-end"
          }}
        >
          <Button
            color="offWhite"
            variant="outlined"
            size="small"
            onClick={() => {
              navigate({
                pathname: `/${communityData?.name}/${path}/${row.taskId}`
              });
            }}
          >
            Go to task
          </Button>
        </CardActions>
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

export const EmptyTaskCard = () => {
  const navigate = useNavigate();
  const communityData = useSelector(CommunityData);

  return (
    <GridCard
      sx={{
        bgcolor: "nightBlack.main",
        borderColor: "divider",
        borderStyle: "dashed",
        borderRadius: "16px",
        boxShadow: 7,
        minHeight: "385px"
      }}
      variant="outlined"
    >
      <CardActionArea
        onClick={() => {
          navigate({
            pathname: `/${communityData?.name}/modules/Task`
          });
        }}
        sx={{
          height: "100%"
        }}
      >
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
            cursor: "pointer"
          }}
        >
          <Typography textAlign="center" color="white" variant="body">
            Add task
          </Typography>
          <AddIcon
            sx={{
              mt: 2,
              color: "white",
              fontSize: "80px"
            }}
          />
        </CardContent>
      </CardActionArea>
    </GridCard>
  );
};

interface TasksParams {
  isLoading: boolean;
  tasks: Task[];
  canDelete?: boolean;
  canAdd?: boolean;
  isAdmin: boolean;
}

const Tasks = ({
  isLoading,
  tasks,
  isAdmin,
  canDelete,
  canAdd
}: TasksParams) => {
  return (
    <Box>
      {isLoading ? (
        <AutLoading width="130px" height="130px" />
      ) : (
        <>
          {!!tasks?.length && (
            <GridBox sx={{ flexGrow: 1, mt: 4 }}>
              {tasks.map((row, index) => (
                <TaskCard
                  isAdmin={isAdmin}
                  canDelete={canDelete}
                  key={`table-row-${index}`}
                  row={row}
                />
              ))}
              {canAdd && <EmptyTaskCard />}
            </GridBox>
            // <TableContainer
            //   sx={{
            //     minWidth: {
            //       sm: "700px"
            //     },
            //     width: {
            //       xs: "360px",
            //       sm: "unset"
            //     },
            //     borderRadius: "16px",
            //     backgroundColor: "nightBlack.main",
            //     borderColor: "divider",
            //     my: 4
            //   }}
            //   component={Paper}
            // >
            //   <Table
            //     sx={{
            //       minWidth: {
            //         xs: "700px",
            //         sm: "unset"
            //       },
            //       ".MuiTableBody-root > .MuiTableRow-root:hover": {
            //         backgroundColor: "#ffffff0a"
            //       }
            //     }}
            //   >
            //     <TableHead>
            //       <TableRow>
            //         <TaskStyledTableCell>Name</TaskStyledTableCell>

            //         {!isAdmin && (
            //           <TaskStyledTableCell align="right">
            //             Creator
            //           </TaskStyledTableCell>
            //         )}

            //         <TaskStyledTableCell align="right">
            //           Status
            //         </TaskStyledTableCell>
            //         <TaskStyledTableCell align="right">
            //           Task type
            //         </TaskStyledTableCell>
            //         {isAdmin && canDelete && (
            //           <TaskStyledTableCell align="right">
            //             Action
            //           </TaskStyledTableCell>
            //         )}
            //       </TableRow>
            //     </TableHead>
            //     <TableBody>
            //       {tasks?.map((row, index) => (
            //         <TaskListItem
            //           isAdmin={isAdmin}
            //           canDelete={canDelete}
            //           key={`table-row-${index}`}
            //           row={row}
            //         />
            //       ))}
            //     </TableBody>
            //   </Table>
            // </TableContainer>
          )}

          {!isLoading && !tasks?.length && (
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
                No tasks yet...
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default memo(Tasks);
