/* eslint-disable max-len */
import {
  useLaunchOnboardingMutation,
  useDeactivateOnboardingMutation,
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
  Chip,
  styled,
  ButtonProps
} from "@mui/material";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { memo, useEffect, useMemo, useState } from "react";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import LoadingProgressBar from "@components/LoadingProgressBar";
import RefreshIcon from "@mui/icons-material/Refresh";
import { QuestListItem, QuestStyledTableCell } from "./QuestShared";
import { useSelector } from "react-redux";
import { CommunityData, IsAdmin } from "@store/Community/community.reducer";
import { setTitle } from "@store/ui-reducer";
import { useAppDispatch } from "@store/store.model";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import AutLoading from "@components/AutLoading";
import { useEthers } from "@usedapp/core";
import { useConfirmDialog } from "react-mui-confirm";
import InfoIcon from "@mui/icons-material/Info";
import SuccessDialog from "@components/Dialog/SuccessPopup";

interface PluginParams {
  plugin: PluginDefinition;
}

const ButtonWithPulse = styled<ButtonProps<any, any>>(Button)`
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

const Quests = ({ plugin }: PluginParams) => {
  const dispatch = useAppDispatch();
  const isAdmin = useSelector(IsAdmin);
  const [search, setSearchState] = useState(null);
  const { account } = useEthers();
  const communityData = useSelector(CommunityData);
  const confirm = useConfirmDialog();

  const roles = communityData?.properties?.rolesSets[0].roles
    .map(function (role) {
      return role.roleName;
    })
    .join(", ");

  const twitterProps = {
    title: `${communityData?.name} has just launched on Āut Labs and joined the Coordination Renaissance🎉

We are now onboarding ${roles} - take a quest, prove yourself, & join us as we bring human Coordination to the next level⚖️`,
    // hashtags: ["Āut", "DAO", "Blockchain"]
    url: communityData?.properties?.address
      ? //TODO: Replace url with valid showcase/#dao-address when available,
        //also keep this bizarre formatting otherwise the tweet won't have the correct new lines and alignment
        // ? `https://nova-internal-test.aut.id/?${communityData?.properties?.address}`
        `
https://Aut.id/`
      : `
https://Aut.id/`
  };

  const {
    data: quests,
    isLoading,
    isFetching,
    refetch
  } = useGetAllOnboardingQuestsQuery(plugin.pluginAddress, {
    refetchOnMountOrArgChange: true,
    skip: false
  });

  const [
    launchOnboarding,
    {
      error: activateError,
      isError: activateIsError,
      isLoading: isActivating,
      isSuccess: isSuccessOnboarding,
      reset: activateReset
    }
  ] = useLaunchOnboardingMutation();

  const [
    deactivateOnboarding,
    {
      error: deactivateError,
      isError: deactivateIsError,
      isLoading: isDeactivating,
      reset: deactivateReset
    }
  ] = useDeactivateOnboardingMutation();

  const confimDeactivate = () =>
    confirm({
      title: "Are you sure you want to deactivate onboarding?",
      confirmButtonText: "Deactivate",
      onConfirm: () => {
        deactivateOnboarding({
          quests,
          userAddress: account,
          pluginAddress: plugin.pluginAddress
        });
      }
    });

  const isOnboardingActive = useMemo(() => {
    if (!quests) return false;
    const atLeastThreeQuests = quests.length >= 3;
    return atLeastThreeQuests && quests?.every((q) => q.active);
  }, [quests]);

  const doEachQuestHaveAtLeastOneTask = useMemo(() => {
    if (!quests) return false;
    return quests?.every((q) => q.tasksCount > 0);
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
      <ErrorDialog
        handleClose={() => activateReset()}
        open={activateIsError}
        message={activateError}
      />
      <ErrorDialog
        handleClose={() => deactivateReset()}
        open={deactivateIsError}
        message={deactivateError}
      />
      <LoadingDialog
        open={isActivating || isDeactivating}
        message={
          isActivating
            ? "Launching onboarding..."
            : "Deactivating onboarding..."
        }
      />
      <SuccessDialog
        open={isSuccessOnboarding}
        message="Success!"
        titleVariant="h2"
        subtitle="Whoop! You launched your Onboarding Quests. Now it's time to share and check the submissions!"
        subtitleVariant="subtitle1"
        handleClose={() => activateReset()}
        twitterProps={twitterProps}
      ></SuccessDialog>
      <Box>
        <Typography textAlign="center" color="white" variant="h3">
          Onboarding Quests
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
        {isOnboardingActive && (
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
            <Stack
              width="100%"
              direction={{
                sm: "row"
              }}
              justifyContent="flex-end"
              alignItems={{
                xs: "center"
              }}
              gap={2}
            >
              {isAdmin && (
                <>
                  {!isOnboardingActive ? (
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
                            color="offWhite"
                            to="create"
                            component={Link}
                          >
                            Create an Onboarding Quest
                          </Button>
                        </Badge>
                      </Box>

                      <Box>
                        <Badge
                          invisible={quests?.length >= 3}
                          badgeContent={
                            <Tooltip title="You need 3 active quests to launch.">
                              <InfoIcon
                                sx={{
                                  color: "offWhite.main"
                                }}
                              />
                            </Tooltip>
                          }
                        >
                          <ButtonWithPulse
                            startIcon={<AddIcon />}
                            disabled={
                              quests?.length < 3 ||
                              !doEachQuestHaveAtLeastOneTask
                            }
                            variant="outlined"
                            size="medium"
                            color="offWhite"
                            onClick={() =>
                              launchOnboarding({
                                quests,
                                userAddress: account,
                                pluginAddress: plugin.pluginAddress
                              })
                            }
                          >
                            Launch quest onboarding
                          </ButtonWithPulse>
                        </Badge>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        size="medium"
                        color="offWhite"
                        to="/quest-submissions"
                        component={Link}
                      >
                        View all submissions
                      </Button>
                      <Button
                        startIcon={<AddIcon />}
                        disabled={quests?.length < 3}
                        variant="outlined"
                        size="medium"
                        color="error"
                        onClick={() => confimDeactivate()}
                      >
                        Deactivate onboarding
                      </Button>
                    </>
                  )}
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
            You have not created any onboarding quests...
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            size="large"
            color="offWhite"
            to={`create`}
            component={Link}
          >
            Create your first quest
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
                    {isAdmin && !isOnboardingActive && (
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
                      daoAddress={communityData?.properties?.address}
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
