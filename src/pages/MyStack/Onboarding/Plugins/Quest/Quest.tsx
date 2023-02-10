import { useGetAllOnboardingQuestsQuery } from "@api/onboarding-quest.api";
import { PluginDefinition } from "@aut-labs-private/sdk";
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
  Chip,
  Stack,
  CircularProgress,
  MenuItem,
  debounce
} from "@mui/material";
import { pxToRem } from "@utils/text-size";
import { Link, useNavigate, useParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { memo, useMemo, useState } from "react";
import { allRoles } from "@store/Community/community.reducer";
import { AutSelectField } from "@theme/field-select-styles";
import { AutTextField } from "@theme/field-text-styles";
import { useSelector } from "react-redux";

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

interface PluginParams {
  plugin: PluginDefinition;
}

const Quest = ({ plugin }: PluginParams) => {
  const navigate = useNavigate();
  const params = useParams<{ questId: string }>();
  const [searchState, setSearchState] = useState({
    title: "",
    role: null
  });
  const [roles] = useState(useSelector(allRoles));

  const {
    data: quests,
    error: questsError,
    isLoading,
    isFetching
  } = useGetAllOnboardingQuestsQuery(plugin.pluginAddress, {
    // pollingInterval: 4000,
    refetchOnMountOrArgChange: false,
    skip: false
  });

  const quest = useMemo(() => {
    return quests.find((q) => q.questId === Number(params?.questId));
  }, [params?.questId]);

  const filteredQuests = useMemo(() => {
    return quests?.filter(
      (q) =>
        q.metadata?.name
          ?.toLowerCase()
          ?.includes(searchState?.title?.toLowerCase()) &&
        (!searchState.role || q.role === searchState.role)
    );
  }, [quests, searchState]);

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
    <Container maxWidth="lg" sx={{ mt: pxToRem(20) }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          position: "relative"
        }}
      >
        <Typography textAlign="center" color="white" variant="h3">
          Onboarding quests
        </Typography>
        {!!quests?.length && (
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
            <Stack direction="row" alignItems="center" spacing={2}>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                size="medium"
                color="primary"
                to={`new/create`}
                component={Link}
              >
                Add tasks
              </Button>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                size="medium"
                color="primary"
                to={`new/create`}
                component={Link}
              >
                Activate
              </Button>
            </Stack>
          </Box>
        )}
      </Box>

      {!isLoading && !quests?.length && (
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
            You have not created any onboarding quest...
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            size="medium"
            color="offWhite"
            to={`new/create`}
            component={Link}
          >
            Create you first quest
          </Button>
        </Box>
      )}

      {isLoading ? (
        <CircularProgress className="spinner-center" size="60px" />
      ) : (
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
              {filteredQuests?.map((row, index) => (
                <StyledTableRow
                  key={`table-row-${index}`}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <StyledTableCell component="th" scope="row">
                    <span
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gridGap: "8px"
                      }}
                    >
                      <span>
                        <Tooltip title="View quest and submissions">
                          <BtnLink
                            component="button"
                            color="primary"
                            variant="subtitle2"
                            onClick={() => navigate(`${row.questId}`)}
                          >
                            {row.metadata?.name}
                          </BtnLink>
                        </Tooltip>
                      </span>
                      <Typography variant="body" className="text-secondary">
                        {row.metadata?.description}
                      </Typography>
                    </span>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {roles.find((r) => r.id === row.role)?.roleName}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {row.tasksCount}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {row.durationInDays || 0} days
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Chip
                      label={row.active ? "Active" : "Inactive"}
                      color={row.active ? "success" : "error"}
                      size="small"
                    />
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default memo(Quest);
