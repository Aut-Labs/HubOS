import {
  onboardingApi,
  useGetAllTasksPerQuestQuery
} from "@api/onboarding.api";
import { PluginDefinition, Task } from "@aut-labs-private/sdk";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link as BtnLink,
  styled,
  tableCellClasses,
  Tooltip,
  Stack,
  CircularProgress,
  MenuItem,
  debounce,
  Badge,
  Chip
} from "@mui/material";
import {
  Link,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams
} from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { memo, useMemo, useState } from "react";
import { allRoles } from "@store/Community/community.reducer";
import { AutSelectField } from "@theme/field-select-styles";
import { AutTextField } from "@theme/field-text-styles";
import { useSelector } from "react-redux";
import { Role } from "@aut-labs-private/sdk/dist/models/dao";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { pluginRegistryApi } from "@api/plugin-registry.api";
import { PluginDefinitionType } from "@aut-labs-private/sdk/dist/models/plugin";
import LinkWithQuery from "@components/LinkWithQuery";

interface PluginParams {
  plugin: PluginDefinition;
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0
  }
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}, &.${tableCellClasses.body}`]: {
    color: theme.palette.common.white,
    borderColor: theme.palette.divider
  }
}));

const QuestListItem = memo(({ row, roles }: { row: Task; roles: Role[] }) => {
  const navigate = useNavigate();

  const roleName = useMemo(() => {
    return roles.find((r) => r.id === row.role)?.roleName;
  }, [roles]);

  return (
    <StyledTableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
      <StyledTableCell component="th" scope="row">
        <span
          style={{
            display: "flex",
            flexDirection: "column",
            gridGap: "8px"
          }}
        >
          <Box>
            <Badge
              // invisible={!!row.metadata?.name}
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
                  onClick={() => navigate(`${row.role}`)}
                >
                  {/* {row.metadata?.name || "n/a"} */}
                </BtnLink>
              </Tooltip>
            </Badge>
          </Box>
          <Typography variant="body" className="text-secondary">
            {row.endDate}
          </Typography>
        </span>
      </StyledTableCell>
      <StyledTableCell align="right">{roleName}</StyledTableCell>
      <StyledTableCell align="right">{row.creator}</StyledTableCell>
      <StyledTableCell align="right">
        {/* {row.durationInDays || 0} days */}
      </StyledTableCell>
      <StyledTableCell align="right">
        {/* <Chip
          label={row.active ? "Active" : "Inactive"}
          color={row.active ? "success" : "error"}
          size="small"
        /> */}
      </StyledTableCell>
      <StyledTableCell align="right">
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
      </StyledTableCell>
    </StyledTableRow>
  );
});

interface PluginParams {
  plugin: PluginDefinition;
}

const Quest = ({ plugin }: PluginParams) => {
  const location = useLocation();
  const params = useParams<{ questId: string }>();
  const [searchState, setSearchState] = useState({
    title: "",
    role: null
  });
  const [roles] = useState(useSelector(allRoles));

  const {
    data: tasks,
    error: tasksError,
    isLoading,
    isFetching
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

  const { quest } = onboardingApi.useGetAllOnboardingQuestsQuery(
    plugin.pluginAddress,
    {
      selectFromResult: ({ data }) => ({
        quest: (data || []).find((q) => q.questId === +params?.questId)
      })
    }
  );

  const rootPath = useMemo(() => {
    const stackType = plugin.metadata?.properties?.stack?.type;
    const [rootPath] = location.pathname.split(stackType);
    return `${rootPath}`;
  }, []);

  const tasksPluginPath = useMemo(() => {
    return `${rootPath}Task`;
  }, [rootPath]);

  console.log("tasksPluginPath", tasksPluginPath);

  const filteredTasks = useMemo(() => {
    return tasks;
    // return tasks?.filter(
    //   (q) =>
    //     q.metadata?.name
    //       ?.toLowerCase()
    //       ?.includes(searchState?.title?.toLowerCase()) &&
    //     (!searchState.role || q.role === searchState.role)
    // );
  }, [tasks, searchState]);

  const changeRoleHandler = (event: any) => {
    setSearchState({
      ...searchState,
      role: event.target.value
    });
  };

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
    <Container maxWidth="lg" sx={{ py: "20px" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          position: "relative"
        }}
      >
        <Typography textAlign="center" color="white" variant="h3">
          {quest?.metadata?.name}
        </Typography>

        <Stack my={2} gap={2} direction="row" justifyContent="center">
          <Chip label={`Tasks - ${quest?.tasksCount}`} size="small" />
          <Chip
            label={`Tasks - ${quest?.tasksCount}`}
            sx={{
              color: "white",
              background: "rgba(255, 255, 255, 0.16)"
            }}
            size="small"
          />
        </Stack>

        {!!tasks?.length && (
          <Box
            sx={{
              display: "flex",
              mt: 4,
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
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              size="medium"
              color="primary"
              to={tasksPluginPath}
              component={Link}
            >
              Add tasks
            </Button>
          </Box>
        )}
      </Box>

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
            to={tasksPluginPath}
            preserveParams
            queryParams={{
              questPluginAddress: plugin.pluginAddress,
              returnUrlLinkName: "See Quest",
              returnUrl: location.pathname,
              questId: params.questId
            }}
            component={LinkWithQuery}
          >
            Start adding tasks
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
            No quests found!
          </Typography>
        </Box>
      )}

      {isLoading ? (
        <CircularProgress className="spinner-center" size="60px" />
      ) : (
        <>
          {!!filteredTasks?.length && (
            <TableContainer
              sx={{
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
                    <StyledTableCell>Name</StyledTableCell>
                    <StyledTableCell align="right">Role</StyledTableCell>
                    <StyledTableCell align="right">Submissions</StyledTableCell>
                    <StyledTableCell align="right">Duration</StyledTableCell>
                    <StyledTableCell align="right">Status</StyledTableCell>
                    <StyledTableCell align="right">Action</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTasks?.map((row, index) => (
                    <QuestListItem
                      key={`table-row-${index}`}
                      roles={roles}
                      row={row}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Container>
  );
};

export default memo(Quest);
