import { Task } from "@aut-labs-private/sdk";
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
  debounce,
  MenuItem,
  Chip
} from "@mui/material";
import { allRoles } from "@store/Community/community.reducer";
import { memo, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { AutTextField } from "@theme/field-text-styles";
import { AutSelectField } from "@theme/field-select-styles";
import AddIcon from "@mui/icons-material/Add";
import CopyAddress from "@components/CopyAddress";
import { TaskStatus } from "@store/model";
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
    label: "Open Task"
  },
  [TaskType.ContractInteraction]: {
    label: "Contract Interaction"
  },
  [TaskType.Quiz]: {
    label: "Multiple-Choice Quiz"
  },
  [TaskType.Quiz]: {
    label: "Join Discord"
  }
};

const TaskListItem = memo(({ row }: { row: Task }) => {
  const navigate = useNavigate();

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
                  component="button"
                  color="primary"
                  variant="subtitle2"
                  onClick={() => navigate(`${row.taskId}`)}
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
      <TaskStyledTableCell align="right">
        <Stack direction="column" spacing={1}>
          <Button
            sx={{
              minWidth: "120px"
            }}
            color="offWhite"
            size="small"
            variant="outlined"
          >
            Activate
          </Button>
          <Button
            sx={{
              minWidth: "120px"
            }}
            color="offWhite"
            size="small"
            variant="outlined"
          >
            Add tasks
          </Button>
        </Stack>
      </TaskStyledTableCell>
    </StyledTableRow>
  );
});

interface TasksParams {
  isLoading: boolean;
  tasks: Task[];
}

const Tasks = ({ isLoading, tasks }: TasksParams) => {
  const [searchState, setSearchState] = useState({
    title: ""
  });
  const debouncedChangeHandler = useMemo(() => {
    const changeHandler = (event) => {
      setSearchState({
        ...searchState,
        title: event.target.value
      });
    };
    return debounce(changeHandler, 200);
  }, [searchState]);

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
            <Box
              sx={{
                display: "flex",
                mt: 2,
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography color="white" variant="subtitle2">
                  Filter
                </Typography>
                <AutTextField
                  variant="standard"
                  color="offWhite"
                  onChange={debouncedChangeHandler}
                  placeholder="Name"
                  sx={{
                    width: {
                      sm: "200px"
                    }
                  }}
                />
              </Stack>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                size="medium"
                color="primary"
                to="/aut-dashboard/my-stack/Task"
                component={Link}
              >
                Add tasks
              </Button>
            </Box>
          )}
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
                    <TaskListItem key={`table-row-${index}`} row={row} />
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
