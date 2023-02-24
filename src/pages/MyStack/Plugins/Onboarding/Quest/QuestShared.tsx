import { Quest } from "@aut-labs-private/sdk";
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
import { useNavigate } from "react-router-dom";
import { memo, useMemo, useState } from "react";
import { allRoles } from "@store/Community/community.reducer";
import { useSelector } from "react-redux";
import { AutSelectField } from "@theme/field-select-styles";
import { AutTextField } from "@theme/field-text-styles";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { addDays } from "date-fns";

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

export const QuestListItem = memo(({ row }: { row: Quest }) => {
  const navigate = useNavigate();
  const [roles] = useState(useSelector(allRoles));

  const roleName = useMemo(() => {
    return roles.find((r) => r.id === row.role)?.roleName;
  }, [roles]);

  const endsIn = useMemo(() => {
    const startDate = new Date(+row.start * 1000);
    const endDate = addDays(startDate, row?.durationInDays);
    return endDate?.toDateString();
  }, [row?.durationInDays, row?.start]);

  return (
    <StyledTableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
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
          <Typography variant="body" className="text-secondary">
            {row.metadata?.description}
          </Typography>
        </span>
      </QuestStyledTableCell>
      <QuestStyledTableCell align="right">{roleName}</QuestStyledTableCell>
      <QuestStyledTableCell align="right">
        {row.tasksCount}
      </QuestStyledTableCell>
      <QuestStyledTableCell align="right">
        <Stack direction="column">
          {new Date(+row.start * 1000).toDateString()} - {endsIn}
          <Typography>{row.durationInDays || 0} days</Typography>
        </Stack>
      </QuestStyledTableCell>
      <QuestStyledTableCell align="right">
        <Chip
          label={row.active ? "Active" : "Inactive"}
          color={row.active ? "success" : "error"}
          size="small"
        />
      </QuestStyledTableCell>
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
          >
            Add tasks
          </Button>
        </Stack>
      </QuestStyledTableCell>
    </StyledTableRow>
  );
});

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
    );
  }
);
