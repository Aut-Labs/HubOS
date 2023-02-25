import { PluginDefinition, Task } from "@aut-labs-private/sdk";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Link as BtnLink,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  styled,
  tableCellClasses,
  Chip
} from "@mui/material";
import { memo, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import CopyAddress from "@components/CopyAddress";
import { TaskStatus } from "@store/model";
import { useGetAllPluginDefinitionsByDAOQuery } from "@api/plugin-registry.api";
import LinkWithQuery from "@components/LinkWithQuery";
import { PluginDefinitionType } from "@aut-labs-private/sdk/dist/models/plugin";
import { TaskType } from "@aut-labs-private/sdk/dist/models/task";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover
  },
  "&:last-child td, &:last-child th": {
    border: 0
  }
}));

const TaskStyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}, &.${tableCellClasses.body}`]: {
    color: theme.palette.common.white,
    borderColor: theme.palette.divider
  }
}));

const taskStatses = {
  [TaskStatus.Created]: {
    label: "Created",
    color: "info"
  }
};

const taskTypes = {
  [TaskType.Open]: {
    pluginType: PluginDefinitionType.OnboardingOpenTaskPlugin,
    label: "Open Task"
  },
  [TaskType.ContractInteraction]: {
    pluginType: PluginDefinitionType.OnboardingTransactionTaskPlugin,
    label: "Contract Interaction"
  },
  [TaskType.Quiz]: {
    pluginType: PluginDefinitionType.OnboardingQuizTaskPlugin,
    label: "Multiple-Choice Quiz"
  },
  [TaskType.TwitterFollow]: {
    pluginType: PluginDefinitionType.OnboardingJoinDiscordTaskPlugin,
    label: "Join Discord"
  }
};

const TaskListItem = memo(
  ({ row, isAdmin }: { row: Task; isAdmin: boolean }) => {
    const location = useLocation();
    const params = useParams<{ questId: string }>();

    const { plugin } = useGetAllPluginDefinitionsByDAOQuery(null, {
      // @ts-ignore
      selectFromResult: ({ data }) => ({
        plugin: (data || []).find(
          (p) => taskTypes[row.taskType].pluginType === p.pluginDefinitionId
        )
      })
    });

    const path = useMemo(() => {
      if (!plugin) return;
      const stackType = plugin.metadata.properties.stack.type;
      const stack = `modules/${stackType}`;
      return `${stack}/${PluginDefinitionType[plugin.pluginDefinitionId]}`;
    }, [plugin]);

    return (
      <StyledTableRow
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
      >
        <TaskStyledTableCell component="th" scope="row">
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              gridGap: "8px"
            }}
          >
            <Box>
              <Badge
                invisible={!!row.metadata?.name}
                badgeContent={
                  <Tooltip title="Something went wrong fetching ipfs metadata. This does not affect the contract interactions">
                    <ErrorOutlineIcon
                      color="error"
                      sx={{
                        width: {
                          sm: "16px"
                        }
                      }}
                    />
                  </Tooltip>
                }
              >
                <Tooltip title="View task details">
                  <BtnLink
                    color="primary"
                    variant="subtitle2"
                    to={`/aut-dashboard/${path}/${row.taskId}`}
                    preserveParams
                    queryParams={{
                      questPluginAddress: plugin?.pluginAddress,
                      returnUrlLinkName: "See Quest",
                      returnUrl: location?.pathname,
                      questId: params.questId
                    }}
                    component={LinkWithQuery}
                  >
                    {row.metadata?.name || "n/a"}
                  </BtnLink>
                </Tooltip>
              </Badge>
            </Box>
            <Typography variant="body" className="text-secondary">
              {row.metadata?.description}
            </Typography>
          </span>
        </TaskStyledTableCell>
        <TaskStyledTableCell align="right">
          <CopyAddress address={row.creator} />
        </TaskStyledTableCell>
        <TaskStyledTableCell align="right">
          {new Date(+row.startDate * 1000).toDateString()} -{" "}
          {new Date(+row.endDate * 1000).toDateString()}
        </TaskStyledTableCell>
        <TaskStyledTableCell align="right">
          <Chip {...taskStatses[row.status]} size="small" />
        </TaskStyledTableCell>
        <TaskStyledTableCell align="right">
          {taskTypes[row.taskType]?.label}
        </TaskStyledTableCell>
        {isAdmin && (
          <TaskStyledTableCell align="right">
            <Button
              sx={{
                minWidth: "120px"
              }}
              color="error"
              size="small"
              variant="outlined"
            >
              Remove
            </Button>
          </TaskStyledTableCell>
        )}
        {!isAdmin && (
          <TaskStyledTableCell align="right">
            <Button
              sx={{
                minWidth: "120px"
              }}
              color="offWhite"
              size="small"
              variant="outlined"
            >
              Take
            </Button>
          </TaskStyledTableCell>
        )}
      </StyledTableRow>
    );
  }
);

interface TasksParams {
  isLoading: boolean;
  tasks: Task[];
  isAdmin: boolean;
}

const Tasks = ({ isLoading, tasks, isAdmin }: TasksParams) => {
  console.log("isAdmin: ", isAdmin);
  return (
    <Box>
      {isLoading ? (
        <CircularProgress
          sx={{ mt: 12 }}
          className="spinner-center"
          size="60px"
        />
      ) : (
        <>
          {!!tasks?.length && (
            <TableContainer
              sx={{
                minWidth: "700px",
                borderRadius: "16px",
                backgroundColor: "nightBlack.main",
                borderColor: "divider",
                mt: 4
              }}
              component={Paper}
            >
              <Table
                sx={{
                  ".MuiTableBody-root > .MuiTableRow-root:hover": {
                    backgroundColor: "#ffffff0a"
                  }
                }}
              >
                <TableHead>
                  <TableRow>
                    <TaskStyledTableCell>Name</TaskStyledTableCell>
                    <TaskStyledTableCell align="right">
                      Creator
                    </TaskStyledTableCell>
                    <TaskStyledTableCell align="right">
                      Time
                    </TaskStyledTableCell>
                    <TaskStyledTableCell align="right">
                      Status
                    </TaskStyledTableCell>
                    <TaskStyledTableCell align="right">
                      Task type
                    </TaskStyledTableCell>
                    <TaskStyledTableCell align="right">
                      Action
                    </TaskStyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks?.map((row, index) => (
                    <TaskListItem
                      isAdmin={isAdmin}
                      key={`table-row-${index}`}
                      row={row}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Box>
  );
};

export default memo(Tasks);
