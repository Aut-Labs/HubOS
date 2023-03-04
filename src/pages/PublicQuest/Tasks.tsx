import { Task } from "@aut-labs-private/sdk";
import {
  Badge,
  Box,
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
import { useLocation, useParams } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { PluginDefinitionType } from "@aut-labs-private/sdk/dist/models/plugin";
import { TaskStatus, TaskType } from "@aut-labs-private/sdk/dist/models/task";
import { useGetAllPluginDefinitionsByDAOQuery } from "@api/plugin-registry.api";
import CopyAddress from "@components/CopyAddress";
import LinkWithQuery from "@components/LinkWithQuery";
import OverflowTooltip from "@components/OverflowTooltip";

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
    label: "Todo",
    color: "info"
  },
  [TaskStatus.Finished]: {
    label: "Complete",
    color: "success"
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
  [TaskType.JoinDiscord]: {
    pluginType: PluginDefinitionType.OnboardingJoinDiscordTaskPlugin,
    label: "Join Discord"
  }
};

const dateTypes = (start: number, end: number) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  return (
    <Stack alignItems="flex-end">
      <Stack direction="row" flexWrap="wrap">
        <Stack direction="row">
          <Typography color="success.main">
            {startDate.toDateString()}
          </Typography>
          <Typography mx={0.5} color="white">
            -
          </Typography>
        </Stack>
        <Typography color="error">{endDate.toDateString()}</Typography>
      </Stack>
    </Stack>
  );
};

const TaskListItem = memo(({ row }: { row: Task }) => {
  const location = useLocation();
  const params = useParams<{ questId: string }>();

  const { plugin } = useGetAllPluginDefinitionsByDAOQuery(null, {
    selectFromResult: ({ data }) => ({
      plugin: (data || []).find(
        (p) => taskTypes[row.taskType].pluginType === p.pluginDefinitionId
      )
    })
  });

  const path = useMemo(() => {
    if (!plugin) return;
    return `task/${plugin.pluginDefinitionId}`;
  }, [plugin]);

  console.log(path, "path");

  return (
    <StyledTableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
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
                  variant="subtitle2"
                  sx={{
                    color: "primary.light"
                  }}
                  to={`/quest/${path}/${row.taskId}`}
                  preserveParams
                  queryParams={{
                    questPluginAddress: plugin?.pluginAddress,
                    returnUrlLinkName: "Back to quest",
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
          <OverflowTooltip
            typography={{
              maxWidth: "300px"
            }}
            text={row.metadata?.description}
          />
        </span>
      </TaskStyledTableCell>
      <TaskStyledTableCell align="right">
        <CopyAddress address={row.creator} />
        <BtnLink
          color="primary.light"
          variant="caption"
          target="_blank"
          href={`https://my.aut.id/${row.creator}`}
        >
          View profile
        </BtnLink>
      </TaskStyledTableCell>
      <TaskStyledTableCell align="right">
        <Chip {...taskStatses[row.status]} size="small" />
      </TaskStyledTableCell>
      <TaskStyledTableCell align="right">
        {taskTypes[row.taskType]?.label}
      </TaskStyledTableCell>
    </StyledTableRow>
  );
});

interface TasksParams {
  isLoading: boolean;
  tasks: Task[];
}

const Tasks = ({ isLoading, tasks }: TasksParams) => {
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
                my: 4
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
                      Status
                    </TaskStyledTableCell>
                    <TaskStyledTableCell align="right">
                      Task type
                    </TaskStyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks?.map((row, index) => (
                    <TaskListItem key={`table-row-${index}`} row={row} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default memo(Tasks);
