import { Quest, Task } from "@aut-labs-private/sdk";
import {
  Box,
  Typography,
  Button,
  TableCell,
  TableRow,
  Link as BtnLink,
  styled,
  tableCellClasses,
  Tooltip,
  Chip,
  Stack,
  MenuItem,
  debounce,
  Badge
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { memo, useMemo, useState } from "react";
import { allRoles } from "@store/Community/community.reducer";
import { useSelector } from "react-redux";
import { AutSelectField } from "@theme/field-select-styles";
import { AutTextField } from "@theme/field-text-styles";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { addDays } from "date-fns";
import Tasks from "../../Task/Shared/Tasks";
import AddIcon from "@mui/icons-material/Add";
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

export const QuestStyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}, &.${tableCellClasses.body}`]: {
    color: theme.palette.common.white,
    borderColor: theme.palette.divider
  }
}));

const dateTypes = (date: number, durationInDays: number) => {
  const startDate = new Date(date);
  const endDate = addDays(startDate, durationInDays);

  return (
    <Stack alignItems="flex-end">
      <Typography color="white" variant="body">
        {durationInDays} {durationInDays === 1 ? "day" : "days"}
      </Typography>
      <Stack direction="row" flexWrap="wrap">
        <Stack direction="row">
          <Typography color="success.main" variant="caption">
            {startDate.toDateString()}
          </Typography>
          <Typography mx={0.5} color="white" variant="caption">
            -
          </Typography>
        </Stack>
        <Typography color="error" variant="caption">
          {endDate.toDateString()}
        </Typography>
      </Stack>
    </Stack>
  );
};

export const QuestListItem = memo(
  ({
    row,
    pluginAddress,
    isAdmin
  }: {
    row: Quest;
    pluginAddress: string;
    isAdmin: boolean;
  }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [roles] = useState(useSelector(allRoles));

    const roleName = useMemo(() => {
      return roles.find((r) => r.id === row.role)?.roleName;
    }, [roles]);

    return (
      <StyledTableRow
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
      >
        <QuestStyledTableCell component="th" scope="row">
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
                <Tooltip title="View quest and submissions">
                  <BtnLink
                    component="button"
                    color="primary"
                    variant="subtitle2"
                    onClick={() => navigate(`${row.questId}`)}
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
        </QuestStyledTableCell>
        <QuestStyledTableCell align="right">{roleName}</QuestStyledTableCell>
        {isAdmin && (
          <QuestStyledTableCell align="right">
            {row.tasksCount}
          </QuestStyledTableCell>
        )}
        <QuestStyledTableCell align="right">
          {dateTypes(row.startDate, row.durationInDays)}
        </QuestStyledTableCell>
        <QuestStyledTableCell align="right">
          <Chip
            label={row.active ? "Active" : "Inactive"}
            color={row.active ? "success" : "error"}
            size="small"
          />
        </QuestStyledTableCell>

        {isAdmin && (
          <QuestStyledTableCell align="right">
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
                to="/aut-dashboard/modules/Task"
                preserveParams
                queryParams={{
                  questPluginAddress: pluginAddress,
                  returnUrlLinkName: "See Quest",
                  returnUrl: location.pathname,
                  questId: row.questId.toString()
                }}
                component={LinkWithQuery}
              >
                Add tasks
              </Button>
            </Stack>
          </QuestStyledTableCell>
        )}
      </StyledTableRow>
    );
  }
);

interface SearchState {
  title: string;
  role: string;
}

export const QuestFilters = memo(
  ({ searchCallback }: { searchCallback: (state: SearchState) => void }) => {
    const [searchState, setSearchState] = useState<SearchState>({
      title: "",
      role: null
    });
    const [roles] = useState(useSelector(allRoles));

    const changeRoleHandler = (event: any) => {
      const state = {
        ...searchState,
        role: event.target.value
      };
      setSearchState(state);
      searchCallback(state);
    };

    const debouncedChangeHandler = useMemo(() => {
      const changeHandler = (event) => {
        const state = {
          ...searchState,
          title: event.target.value
        };
        setSearchState(state);
        searchCallback(state);
      };
      return debounce(changeHandler, 200);
    }, [searchState]);

    return (
      <Stack direction="row" alignItems="center" spacing={2}>
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
        <AutSelectField
          variant="standard"
          color="offWhite"
          sx={{
            width: {
              sm: "200px"
            }
          }}
          value={searchState?.role || ""}
          renderValue={(selected) => {
            if (!selected) {
              return "Role" as any;
            }
            const role = roles.find((t) => t.id === selected);
            return role?.roleName || selected;
          }}
          displayEmpty
          onChange={changeRoleHandler}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {roles.map((type) => (
            <MenuItem key={`role-${type.id}`} value={type.id}>
              {type.roleName}
            </MenuItem>
          ))}
        </AutSelectField>
      </Stack>
    );
  }
);

interface QuestTasksParams {
  isLoading: boolean;
  questPluginAddress: string;
  isAdmin: boolean;
  questId: number;
  tasks: Task[];
}

export const QuestTasks = memo(
  ({
    isLoading,
    tasks,
    questPluginAddress,
    questId,
    isAdmin
  }: QuestTasksParams) => {
    const [searchState, setSearchState] = useState({
      title: ""
    });

    const filteredTasks = useMemo(() => {
      return tasks?.filter((q) =>
        (q?.metadata?.name || "")
          ?.toLowerCase()
          ?.includes(searchState?.title?.toLowerCase())
      );
    }, [tasks, searchState]);

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
              to="/aut-dashboard/modules/Task"
              preserveParams
              queryParams={{
                questPluginAddress,
                returnUrlLinkName: "See Quest",
                returnUrl: location.pathname,
                questId: questId.toString()
              }}
              component={LinkWithQuery}
            >
              Add task
            </Button>
          </Box>
        )}

        {!isLoading && !!tasks?.length && !filteredTasks?.length && (
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
              No tasks found!
            </Typography>
          </Box>
        )}

        <Tasks isAdmin={isAdmin} isLoading={isLoading} tasks={filteredTasks} />
      </Box>
    );
  }
);
