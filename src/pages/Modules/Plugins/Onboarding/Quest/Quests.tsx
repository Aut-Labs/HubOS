/* eslint-disable max-len */
import {
  useActivateOnboardingMutation,
  useGetAllOnboardingQuestsQuery
} from "@api/onboarding.api";
import { PluginDefinition } from "@aut-labs-private/sdk";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  IconButton,
  Tooltip,
  Badge,
  Chip
} from "@mui/material";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { memo, useEffect, useMemo, useState } from "react";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import LoadingProgressBar from "@components/LoadingProgressBar";
import RefreshIcon from "@mui/icons-material/Refresh";
import { QuestListItem, QuestStyledTableCell } from "./QuestShared";
import { useSelector } from "react-redux";
import { IsAdmin } from "@store/Community/community.reducer";
import { setTitle } from "@store/ui-reducer";
import { useAppDispatch } from "@store/store.model";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import AutLoading from "@components/AutLoading";
import { useEthers } from "@usedapp/core";

interface PluginParams {
  plugin: PluginDefinition;
}

const Quests = ({ plugin }: PluginParams) => {
  const dispatch = useAppDispatch();
  const isAdmin = useSelector(IsAdmin);
  const [search, setSearchState] = useState(null);
  const { account } = useEthers();

  const {
    data: quests,
    isLoading,
    isFetching,
    refetch
  } = useGetAllOnboardingQuestsQuery(plugin.pluginAddress, {
    refetchOnMountOrArgChange: false,
    skip: false
  });

  const [
    activateOnboarding,
    { error, isError, isLoading: isActivating, reset }
  ] = useActivateOnboardingMutation();

  const isOnboardingActivate = useMemo(() => {
    return quests?.every((q) => q.active);
  }, [quests]);

  useEffect(() => {
    dispatch(setTitle(`Onboarding quest`));
  }, [dispatch]);

  const filteredQuests = useMemo(() => {
    if (!search) return quests;
    return quests?.filter(
      (q) =>
        (q?.metadata?.name || "")
          ?.toLowerCase()
          ?.includes(search?.title?.toLowerCase()) &&
        (!search.role || q.role === search.role)
    );
  }, [quests, search]);

  return (
    <Container maxWidth="lg" sx={{ py: "20px" }}>
      <LoadingProgressBar isLoading={isFetching} />
      <ErrorDialog handleClose={() => reset()} open={isError} message={error} />
      <LoadingDialog open={isActivating} message="Activating onboarding..." />
      <Box
        sx={{
          boxShadow: 1,
          border: "2px solid",
          borderColor: "divider",
          borderRadius: "16px",
          p: 3,
          backgroundColor: "nightBlack.main"
        }}
      >
        <Typography textAlign="center" color="white" variant="h3">
          Onboarding quests
          <Tooltip title="Refresh quests">
            <IconButton
              size="medium"
              component="span"
              color="offWhite"
              sx={{
                ml: 1
              }}
              disabled={isLoading || isFetching}
              onClick={refetch}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Typography>
        {isOnboardingActivate && (
          <Box
            sx={{
              mt: 1,
              display: "flex",
              justifyContent: "center"
            }}
          >
            <Chip color="success" label="ACTIVATED"></Chip>
          </Box>
        )}
        {!!quests?.length && (
          <Box
            sx={{
              display: "flex",
              mt: 4,
              alignItems: "center",
              justifyContent: "flex-end"
            }}
          >
            {/* <QuestFilters searchCallback={setSearchState} /> */}
            <Stack direction="row" gap={2}>
              {isAdmin && (
                <>
                  <Box>
                    <Badge
                      invisible={quests?.length < 3}
                      badgeContent={
                        <Tooltip title="During beta there is a maximum of 3 quests, one for each role.">
                          <ErrorOutlineIcon color="error" />
                        </Tooltip>
                      }
                    >
                      <Button
                        startIcon={<AddIcon />}
                        disabled={quests?.length >= 3}
                        variant="outlined"
                        size="medium"
                        color="primary"
                        to={`create`}
                        component={Link}
                      >
                        Create quest
                      </Button>
                    </Badge>
                  </Box>

                  <Button
                    startIcon={<AddIcon />}
                    disabled={quests?.length < 3 || isOnboardingActivate}
                    variant="outlined"
                    size="medium"
                    color="primary"
                    onClick={() =>
                      activateOnboarding({
                        quests,
                        userAddress: account,
                        pluginAddress: plugin.pluginAddress
                      })
                    }
                  >
                    Activate Quest onboarding
                  </Button>
                </>
              )}
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
            to={`create`}
            component={Link}
          >
            Create you first quest
          </Button>
        </Box>
      )}

      {!isLoading && !!quests?.length && !filteredQuests?.length && (
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
        <AutLoading width="130px" height="130px" />
      ) : (
        <>
          {!!filteredQuests?.length && (
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
                    <QuestStyledTableCell>Name</QuestStyledTableCell>
                    {/* <QuestStyledTableCell align="right">
                      Role
                    </QuestStyledTableCell> */}
                    {isAdmin && (
                      <QuestStyledTableCell align="right">
                        Tasks
                      </QuestStyledTableCell>
                    )}
                    <QuestStyledTableCell align="right">
                      Duration
                    </QuestStyledTableCell>
                    <QuestStyledTableCell align="right">
                      Status
                    </QuestStyledTableCell>
                    {isAdmin && !isOnboardingActivate && (
                      <QuestStyledTableCell align="right">
                        Action
                      </QuestStyledTableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredQuests?.map((row, index) => (
                    <QuestListItem
                      isAdmin={isAdmin}
                      pluginAddress={plugin?.pluginAddress}
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
    </Container>
  );
};

export default memo(Quests);
