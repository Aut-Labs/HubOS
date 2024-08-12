/* eslint-disable max-len */
import { Quest, Task } from "@aut-labs/sdk";
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
  Badge,
  IconButton,
  ButtonProps
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { memo, useMemo, useState } from "react";
import { CommunityData, allRoles } from "@store/Community/community.reducer";
import { useSelector } from "react-redux";
import { AutSelectField } from "@theme/field-select-styles";
import { AutTextField } from "@theme/field-text-styles";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Tasks from "../../Task/Shared/Tasks";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import LinkWithQuery from "@components/LinkWithQuery";
import { autUrls } from "@api/environment";
import { addDays, format, isAfter } from "date-fns";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover
  },
  "&:last-child td, &:last-child th": {
    border: 0
  }
}));

export const ButtonWithPulse = styled<ButtonProps<any, any>>(Button)`
  width: 100%;
  &:not(.Mui-disabled) {
    box-shadow: 0 0 0 0 rgba(37, 107, 176, 1);
    animation: pulse 1.5s infinite;
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(37, 107, 176, 0.7);
      }

      70% {
        box-shadow: 0 0 0 15px rgba(37, 107, 176, 0);
      }

      100% {
        box-shadow: 0 0 0 0 rgba(37, 107, 176, 0);
      }
    }
  }
`;

export const getQuestStatus = (quest: Quest) => {
  if (!quest?.startDate) {
    return {
      color: "error",
      label: "Inactive",
      description: "The quest has started, but no tasks have been added."
    };
  }
  const currentDate = new Date();

  const hasStarted = isAfter(currentDate, new Date(quest.startDate));
  const hasEnded = isAfter(
    currentDate,
    addDays(new Date(quest.startDate), quest.durationInDays)
  );
  const hasTasks = quest.tasksCount > 0;
  const isOngoing = hasStarted && !hasEnded;

  if (isOngoing) {
    if (!hasTasks || !quest?.active) {
      return {
        color: "error",
        label: "Inactive",
        description: "The quest has started, but no tasks have been added."
      };
    }
    return {
      color: "success",
      label: "Ongoing",
      description: "The quest is ongoing and has tasks."
    };
  } else if (hasEnded) {
    return {
      color: "error",
      label: "Ended",
      description: "The quest has ended."
    };
  } else if (hasTasks && !hasStarted) {
    if (quest?.active) {
      return {
        color: "success",
        label: "Active",
        description: `The quest is active. Your quest is now available in ${
          autUrls().showcase
        }, and contributors can apply.`
      };
    }
    return {
      color: "info",
      label: "Ready",
      description: `The quest is ready to start. At least one task have been added.`
    };
  }
  return {
    color: "warning",
    label: "Pending",
    description:
      "The quest is pending. Add at least one task to mark it as Ready."
  };
};

export const QuestStyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}, &.${tableCellClasses.body}`]: {
    color: theme.palette.common.white,
    borderColor: theme.palette.divider
  }
}));

export const QuestListItem = memo(
  ({
    row,
    pluginAddress,
    novaAddress,
    isAdmin
  }: {
    row: Quest;
    novaAddress: string;
    pluginAddress: string;
    isAdmin: boolean;
  }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const communityData = useSelector(CommunityData);
    const [roles] = useState(useSelector(allRoles));

    const roleName = useMemo(() => {
      return roles.find((r) => r.id === row.role)?.roleName;
    }, [roles]);

    const questStatus = useMemo(() => getQuestStatus(row), [row]);

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
                <Tooltip title="View quest">
                  {/* @ts-ignore */}
                  <BtnLink
                    component="button"
                    color="primary"
                    variant="subtitle2"
                    onClick={() =>
                      navigate({
                        pathname: `${row.questId}`,
                        search: new URLSearchParams({
                          questId: `${row.questId}`,
                          novaAddress: novaAddress,
                          onboardingQuestAddress: pluginAddress
                        }).toString()
                      })
                    }
                  >
                    {row.metadata?.name || "n/a"}
                  </BtnLink>
                </Tooltip>
                <IconButton
                  sx={{
                    ml: 2
                  }}
                  color="offWhite"
                  size="small"
                  disabled={row.tasksCount >= 5}
                  onClick={() =>
                    navigate({
                      pathname: `${row.questId}`,
                      search: new URLSearchParams({
                        questId: `${row.questId}`,
                        novaAddress: novaAddress,
                        onboardingQuestAddress: pluginAddress
                      }).toString()
                    })
                  }
                  // to="create"
                  // preserveParams
                  // queryParams={{
                  //   onboardingQuestAddress: pluginAddress,
                  //   returnUrlLinkName: "Back to quest",
                  //   returnUrl: `${location.pathname}/${row.questId.toString()}`,
                  //   questId: row.questId.toString()
                  // }}
                  // component={LinkWithQuery}
                >
                  <EditIcon />
                </IconButton>
                {/* <CopyLink
                  link={`${window?.location.origin}/quest/?questId=${row.questId}&onboardingQuestAddress=${pluginAddress}&novaAddress=${novaAddress}`}
                /> */}
              </Badge>
            </Box>
            {/* <OverflowTooltip
              typography={{
                maxWidth: "300px"
              }}
              text={row.metadata?.description}
            /> */}
          </span>
        </QuestStyledTableCell>
        {/* <QuestStyledTableCell align="right">{roleName}</QuestStyledTableCell> */}
        {isAdmin && (
          <QuestStyledTableCell align="right">
            <Tooltip title="View quest">
              {/* @ts-ignore */}
              <BtnLink
                component="button"
                color="primary"
                variant="body"
                onClick={() =>
                  navigate({
                    pathname: `${row.questId}`,
                    search: `onboardingQuestAddress=${pluginAddress}`
                  })
                }
              >
                {row.tasksCount}
              </BtnLink>
            </Tooltip>
          </QuestStyledTableCell>
        )}
        <QuestStyledTableCell align="right">
          <Tooltip title={questStatus?.description}>
            <Chip
              label={questStatus?.label}
              color={questStatus?.color as any}
              size="small"
            />
          </Tooltip>
        </QuestStyledTableCell>

        <QuestStyledTableCell align="right">
          {format(new Date(row.startDate), "EEE MMM dd yyyy 'at' h:mm a")}
        </QuestStyledTableCell>
        <QuestStyledTableCell align="right">
          {format(
            addDays(new Date(row.startDate), row.durationInDays),
            "EEE MMM dd yyyy 'at' h:mm a"
          )}
        </QuestStyledTableCell>
        {/* <QuestStyledTableCell align="right">
          {row.durationInDays} days
        </QuestStyledTableCell> */}

        <QuestStyledTableCell align="right">
          {isAdmin && !row.active && (
            <Stack gap={2}>
              <Button
                sx={{
                  minWidth: "130px"
                }}
                color="offWhite"
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                disabled={row.tasksCount >= 5}
                to={`/${communityData?.name}/modules/Task`}
                preserveParams
                queryParams={{
                  onboardingQuestAddress: pluginAddress,
                  returnUrlLinkName: "Back to quest",
                  returnUrl: `${location.pathname}/${row.questId.toString()}`,
                  questId: row.questId.toString()
                }}
                component={LinkWithQuery}
              >
                Add task
              </Button>
              {/* <Badge
                invisible={row?.tasksCount > 0}
                badgeContent={
                  <Tooltip title="You need at least 1 task to launch the quest.">
                    <InfoIcon
                      sx={{
                        color: "offWhite.main"
                      }}
                    />
                  </Tooltip>
                }
              >
                <ButtonWithPulse
                  variant="outlined"
                  disabled={row?.tasksCount === 0}
                  size="small"
                  color="offWhite"
                  // onClick={() =>
                  //   launchOnboarding({
                  //     quests,
                  //     userAddress: account,
                  //     pluginAddress: plugin.pluginAddress
                  //   })
                  // }
                >
                  Launch quest
                </ButtonWithPulse>
              </Badge> */}
            </Stack>
          )}
        </QuestStyledTableCell>
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
  onboardingQuestAddress: string;
  isAdmin: boolean;
  isSubmission: boolean;
  questId: number;
  tasks: Task[];
  canDelete: boolean;
  canAdd: boolean;
}

export const QuestTasks = memo(
  ({
    isLoading,
    tasks,
    onboardingQuestAddress,
    isSubmission,
    canAdd,
    canDelete,
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
        {!isLoading && !!tasks?.length && !filteredTasks?.length && (
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
            <Typography color="rgb(107, 114, 128)" variant="subtitle2">
              No tasks found!
            </Typography>
          </Box>
        )}

        {/* <Tasks
          onboardingQuestAddress={onboardingQuestAddress}
          questId={questId}
          isAdmin={isAdmin}
          canAdd={canAdd}
          canDelete={canDelete}
          isLoading={isLoading}
          tasks={filteredTasks}
        /> */}
      </Box>
    );
  }
);
