/* eslint-disable max-len */
import {
  Box,
  Container,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  styled,
  tableCellClasses,
  Stack,
  MenuItem,
  debounce
} from "@mui/material";
import { allRoles } from "@store/Community/community.reducer";
import { useSelector } from "react-redux";
import { memo, useMemo, useState } from "react";
import { useGetOnboardingProgressQuery } from "@api/onboarding.api";
import { PluginDefinitionType } from "@aut-labs/sdk/dist/models/plugin";
import { useGetAllPluginDefinitionsByDAOQuery } from "@api/plugin-registry.api";
import AutLoading from "@components/AutLoading";
import { AutSelectField } from "@theme/field-select-styles";
import { Task } from "@aut-labs/sdk";
import {
  SubmissionCard,
  SubmissionsGridBox
} from "../Modules/Plugins/Task/Shared/Submissions";

const StyledTableTitle = styled("div")(({ theme }) => ({
  alignItems: "flex-start",
  display: "flex",
  marginBottom: "10px"
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  width: "100%",
  // "&:nth-of-type(odd)": {
  //   backgroundColor: theme.palette.action.hover
  // },
  "&:first-child td, &:first-child th": {
    borderTop: `2px solid ${theme.palette.divider}`
  },
  "&:last-child td, &:last-child th": {
    border: 0
  }
}));

interface SearchState {
  title: string;
  role: string;
}

export const SubmissionsFilters = memo(
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
        {/* <AutTextField
          variant="standard"
          color="offWhite"
          onChange={debouncedChangeHandler}
          placeholder="Name"
          sx={{
            width: {
              sm: "200px"
            }
          }}
        /> */}
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
              return "Filter by quest" as any;
            }
            const role = roles.find((t) => t.id === selected);
            return role?.roleName || selected;
          }}
          displayEmpty
          onChange={changeRoleHandler}
        >
          <MenuItem value="">
            <em>All quests</em>
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

const TaskStyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}, &.${tableCellClasses.body}`]: {
    color: theme.palette.common.white,
    borderColor: theme.palette.divider
  }
}));

const Dashboard = () => {
  const roles = useSelector(allRoles);
  const [search, setSearchState] = useState(null);

  const { questOnboarding } = useGetAllPluginDefinitionsByDAOQuery(null, {
    selectFromResult: ({ data }) => ({
      questOnboarding: (data || []).find(
        (p) =>
          PluginDefinitionType.QuestOnboardingPlugin === p.pluginDefinitionId
      )
    })
  });

  const { onboardingProgress, isLoading } = useGetOnboardingProgressQuery(
    questOnboarding?.pluginAddress,
    {
      selectFromResult: ({ data, isLoading }) => ({
        onboardingProgress: data,
        isLoading
      })
    }
  );

  const filteredSubmissions: Task[] = useMemo(() => {
    if (!onboardingProgress?.quests?.length) return [];
    if (!search?.role) {
      return [
        ...onboardingProgress.quests[0].tasksAndSubmissions.submissions,
        ...onboardingProgress.quests[1].tasksAndSubmissions.submissions,
        ...onboardingProgress.quests[2].tasksAndSubmissions.submissions
      ];
    }

    const quest = onboardingProgress?.quests[search?.role - 1];
    return quest.tasksAndSubmissions.submissions;
  }, [search, onboardingProgress?.quests]);

  const {
    totalApplications,
    totalApplicationsPerRoleOne,
    totalApplicationsPerRoleTwo,
    totalApplicationsPerRoleThree,
    totalCompletedPhaseOne,
    totalCompletedPhaseTwo,
    totalCompletedPhasesThree
  } = useMemo(() => {
    return (onboardingProgress?.daoProgress || []).reduce(
      (prev, curr) => {
        prev.totalApplications += 1;
        if (curr.questId === 1) {
          prev.totalApplicationsPerRoleOne += 1;
        } else if (curr.questId === 2) {
          prev.totalApplicationsPerRoleTwo += 1;
        } else if (curr.questId === 3) {
          prev.totalApplicationsPerRoleThree += 1;
        }

        const [phaseOne, phaseTwo, phaseThree] = curr.list;
        if (phaseOne?.status === 1) {
          prev.totalCompletedPhaseOne += 1;
        }
        if (phaseTwo?.status === 1) {
          prev.totalCompletedPhaseTwo += 1;
        }
        if (phaseThree?.status === 1) {
          prev.totalCompletedPhasesThree += 1;
        }

        return prev;
      },
      {
        totalApplications: 0,
        totalApplicationsPerRoleOne: 0,
        totalApplicationsPerRoleTwo: 0,
        totalApplicationsPerRoleThree: 0,
        totalCompletedPhaseOne: 0,
        totalCompletedPhaseTwo: 0,
        totalCompletedPhasesThree: 0
      }
    );
  }, [onboardingProgress]);

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        flex: 1,
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        position: "relative"
      }}
    >
      {/* <LoadingProgressBar isLoading={isFetching} /> */}

      {/* <Typography variant="h3" mb="4" color="white">
        Applications and Submissions
      </Typography> */}

      {isLoading ? (
        <AutLoading width="130px" height="130px" />
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              width: "100%",
              mt: 4,
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr"
              },
              gridGap: {
                xs: "30px",
                lg: "50px"
              }
            }}
          >
            <Stack
              sx={{
                marginBottom: {
                  xs: "30px",
                  md: "40px",
                  xxl: "50px"
                }
              }}
            >
              <StyledTableTitle>
                <Typography color="white" variant="subtitle1">
                  Applications per role
                </Typography>
              </StyledTableTitle>

              <TableBody
                sx={{
                  display: "table",
                  ".MuiTableBody-root > .MuiTableRow-root:hover": {
                    backgroundColor: "#ffffff0a"
                  },
                  position: "relative"
                }}
              >
                {roles.map((role, index) => (
                  <StyledTableRow>
                    <TaskStyledTableCell>
                      <Typography
                        variant="subtitle2"
                        fontWeight="normal"
                        color="white"
                      >
                        {role?.roleName}
                      </Typography>
                    </TaskStyledTableCell>

                    <TaskStyledTableCell
                      align="right"
                      style={{ position: "relative" }}
                    >
                      {index === 0 && totalApplicationsPerRoleOne}
                      {index === 1 && totalApplicationsPerRoleTwo}
                      {index === 2 && totalApplicationsPerRoleThree}
                    </TaskStyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Stack>

            <Stack>
              <StyledTableTitle>
                <Typography color="white" variant="subtitle1">
                  Onboarding progress
                </Typography>
              </StyledTableTitle>
              <TableBody
                sx={{
                  display: "table",
                  ".MuiTableBody-root > .MuiTableRow-root:hover": {
                    backgroundColor: "#ffffff0a"
                  }
                }}
              >
                <StyledTableRow>
                  <TaskStyledTableCell>
                    <Typography
                      variant="subtitle2"
                      fontWeight="normal"
                      color="white"
                    >
                      Phase 1
                    </Typography>
                  </TaskStyledTableCell>
                  <TaskStyledTableCell
                    align="right"
                    style={{ position: "relative" }}
                  >
                    {totalCompletedPhaseOne}
                  </TaskStyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <TaskStyledTableCell>
                    <Typography
                      variant="subtitle2"
                      fontWeight="normal"
                      color="white"
                    >
                      Phase 2
                    </Typography>
                  </TaskStyledTableCell>
                  <TaskStyledTableCell
                    align="right"
                    style={{ position: "relative" }}
                  >
                    {totalCompletedPhaseTwo}
                  </TaskStyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <TaskStyledTableCell>
                    <Typography
                      variant="subtitle2"
                      fontWeight="normal"
                      color="white"
                    >
                      Phase 3
                    </Typography>
                  </TaskStyledTableCell>
                  <TaskStyledTableCell
                    align="right"
                    style={{ position: "relative" }}
                  >
                    {totalCompletedPhasesThree}
                  </TaskStyledTableCell>
                </StyledTableRow>
              </TableBody>
            </Stack>
          </Box>

          <Box
            sx={{
              display: "flex",
              mt: 4,
              width: "100%",
              alignItems: "center",
              justifyContent: "flex-end"
            }}
          >
            <SubmissionsFilters searchCallback={setSearchState} />
          </Box>

          {!!filteredSubmissions?.length && (
            <Box
              sx={{
                display: "flex",
                width: "100%"
              }}
            >
              <SubmissionsGridBox sx={{ flexGrow: 1, mt: 4 }}>
                {filteredSubmissions.map((row, index) => (
                  <SubmissionCard
                    key={`table-row-${index}`}
                    row={row}
                    questId={row.role.toString()}
                    daoAddress={onboardingProgress.daoAddress}
                    onboardingQuestAddress={questOnboarding.pluginAddress}
                  />
                ))}
              </SubmissionsGridBox>
            </Box>
          )}

          {!isLoading && !filteredSubmissions?.length && (
            <Box
              sx={{
                display: "flex",
                gap: "20px",
                pt: 12,
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
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
    </Container>
  );
};

export default memo(Dashboard);
