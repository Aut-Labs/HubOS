import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  tableCellClasses,
  Toolbar,
  Typography,
  styled,
  useMediaQuery,
  useTheme
} from "@mui/material";
import LoadingDialog from "@components/Dialog/LoadingPopup";
// import "./Contracts.scss";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  CommunityData,
  DiscordServerId,
  IsDiscordVerified
} from "@store/Community/community.reducer";
import { useEffect, useMemo, useRef, useState } from "react";
import AutTabs from "@components/AutTabs/AutTabs";
import { AutButton } from "@components/buttons";
import DiscordServerVerificationPopup from "@components/Dialog/DiscordServerVerificationPopup";
import { AppBar } from "@components/Sidebar/Sidebar";
import {
  useActivateDiscordBotMutation,
  useActivateDiscordBotPluginMutation,
  useCheckBotActiveQuery,
  useGetGatheringsQuery,
  useGetGuildIdQuery,
  useGetPollsQuery
} from "@api/discord.api";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { updateDiscordSocials } from "@api/community.api";
import { useDispatch } from "react-redux";
import { useAppDispatch } from "@store/store.model";
import { environment } from "@api/environment";
import BotErrorPage from "./BotErrorPage";

const GatheringStyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}, &.${tableCellClasses.body}`]: {
    color: theme.palette.offWhite.main,
    borderColor: theme.palette.offWhite.main
  }
}));

const GatheringsList = ({ gatheringsList }) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      {gatheringsList && gatheringsList.length === 0 ? (
        <>
          <Typography
            className="text-secondary"
            mx="auto"
            my={2}
            textAlign="center"
            color="white"
            variant="body1"
          >
            No gatherings created yet.
          </Typography>
        </>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: "transparent",
            boxShadow: "none",
            borderStyle: "none"
          }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <GatheringStyledTableCell>Name</GatheringStyledTableCell>
                <GatheringStyledTableCell align="right">
                  Duration
                </GatheringStyledTableCell>
                <GatheringStyledTableCell align="right">
                  Role
                </GatheringStyledTableCell>
                <GatheringStyledTableCell align="right"></GatheringStyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gatheringsList &&
                gatheringsList.map((row) => (
                  <TableRow
                    key={row.title}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <GatheringStyledTableCell component="th" scope="row">
                      <Stack
                        sx={{
                          margin: "0 auto",
                          width: "100%"
                        }}
                      >
                        <Typography variant="h6">{row.title}</Typography>
                        <Typography variant="caption">
                          {row.description}
                        </Typography>
                      </Stack>
                    </GatheringStyledTableCell>
                    <GatheringStyledTableCell align="right">
                      {row.duration}
                    </GatheringStyledTableCell>
                    <GatheringStyledTableCell align="right">
                      {row.roles}
                    </GatheringStyledTableCell>
                    <GatheringStyledTableCell align="right">
                      SHARE
                    </GatheringStyledTableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

const CreateEvent = () => {
  const communityData = useSelector(CommunityData);
  const navigate = useNavigate();
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "flexEnd",
        flexDirection: "column"
      }}
    >
      <Stack alignItems="flexStart" justifyContent="center">
        <Typography mt={2} textAlign="center" color="white" variant="h4">
          New Event
        </Typography>
        <Typography mt={3} textAlign="center" color="white" variant="body">
          Create a new Event for your Community, you can assign it to a Role and
          give it a Starting Date. After that, just share it on Discord. Your
          DAO Members will be automagically rewarded for their Participation ✨
        </Typography>
      </Stack>
      <Stack
        mt={4}
        alignItems="center"
        justifyContent="center"
        flexDirection="row"
      >
        <AutButton
          variant="outlined"
          color="offWhite"
          onClick={() => {
            navigate(`/${communityData.name}/bot/gathering`);
          }}
        >
          Create Gathering
        </AutButton>
      </Stack>
    </Box>
  );
};

const BotGatherings = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isDiscordVerified = useSelector(IsDiscordVerified);
  const discordServerId = useSelector(DiscordServerId);
  const communityData = useSelector(CommunityData);
  const isExtraLarge = useMediaQuery(theme.breakpoints.up("xxl"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(!isMobile);
  const [discordDialogOpen, setDiscordDialogOpen] = useState(false);
  const dispatch = useAppDispatch();

  const [
    activateDiscordBot,
    {
      data: activatingData,
      isLoading: isActivatingBot,
      isSuccess,
      isError: activateIsError,
      error: activateErrorData,
      reset
    }
  ] = useActivateDiscordBotMutation();

  const {
    data: botActive,
    refetch,
    isError: checkIsError,
    error: checkErrorData
  } = useCheckBotActiveQuery(discordServerId, { skip: false });

  const {
    data: gatherings,
    isLoading: gatheringsLoading,
    isSuccess: gatheringsSuccess
  } = useGetGatheringsQuery(discordServerId, {
    refetchOnMountOrArgChange: false,
    skip: discordServerId === undefined || !botActive
  });

  const gatheringsList = useMemo(() => {
    if (gatheringsSuccess) return gatherings;
    return null;
  }, [gatheringsSuccess]);

  const handleRetry = () => {
    reset();
    refetch();
  };

  useEffect(() => {
    if (activateErrorData || checkErrorData) {
      setOpen(true);
    }
  }, [activateErrorData, checkErrorData]);

  return (
    <Container maxWidth="md">
      {/* <LoadingDialog open={false} message="Updating admins..." />
      <ErrorDialog
        open={open}
        handleClose={null}
        message=" No new addresses were added!"
      />
      <ErrorDialog open={false} handleClose={null} message={null} /> */}
      <DiscordServerVerificationPopup
        open={discordDialogOpen}
        handleClose={() => setDiscordDialogOpen(false)}
      ></DiscordServerVerificationPopup>

      <Stack alignItems="center" justifyContent="center">
        <Button
          startIcon={<ArrowBackIcon />}
          color="offWhite"
          onClick={() => navigate(-1)}
          sx={{
            position: {
              sm: "absolute"
            },
            left: {
              sm: "0"
            }
          }}
        >
          Back
        </Button>

        <Typography mt={7} textAlign="center" color="white" variant="h3">
          Āut Bot Gatherings
        </Typography>
      </Stack>
      {activateErrorData || checkErrorData ? (
        <BotErrorPage
          refetch={() => handleRetry()}
          errorMessage={
            activateErrorData
              ? activateErrorData.message
              : checkErrorData.message
          }
        />
      ) : (
        <>
          {gatheringsLoading || isActivatingBot || botActive === undefined ? (
            <>
              <CircularProgress
                className="spinner-center"
                size="60px"
                style={{ top: "calc(50% - 30px)" }}
              />
            </>
          ) : (
            <>
              {!isDiscordVerified ? (
                <Stack
                  sx={{
                    margin: "0 auto",
                    width: {
                      xs: "100%",
                      sm: "400px",
                      xxl: "500px"
                    }
                  }}
                >
                  <Typography
                    className="text-secondary"
                    mx="auto"
                    my={2}
                    textAlign="center"
                    color="white"
                    variant="body1"
                  >
                    Please verify the discord account for your community to
                    unlock Āut Bot features.
                  </Typography>
                  <Button
                    sx={{
                      textTransform: "uppercase"
                    }}
                    onClick={() => setDiscordDialogOpen(true)}
                    type="button"
                    variant="outlined"
                    size="medium"
                    color="offWhite"
                  >
                    Connect your discord
                  </Button>
                </Stack>
              ) : botActive ? (
                <>
                  {(() => {
                    {
                      console.log(botActive);
                      debugger;
                    }
                  })()}
                  <AutTabs
                    // tabStyles={{
                    //   border: "2px solid #439EDD"
                    // }}
                    tabs={[
                      {
                        label: "Gatherings",
                        component: GatheringsList,
                        props: { gatheringsList }
                      }
                    ]}
                    staticTab={{
                      label: "Create Gathering",
                      component: CreateEvent,
                      props: {
                        onClick: () => {
                          navigate(`/${communityData.name}/bot/gathering`);
                        }
                      }
                    }}
                  />
                </>
              ) : (
                <>
                  {(() => {
                    {
                      console.log(botActive);
                      debugger;
                    }
                  })()}
                  <Stack alignItems="center" justifyContent="center">
                    <Typography
                      mt={7}
                      textAlign="center"
                      color="white"
                      variant="body"
                      maxWidth={400}
                    >
                      Connect your Discord Members to your DAO Roles - directly
                      on-chain. Create Group Gatherings and Voting Routines to
                      turn your community into a healthy collaboration engine!
                    </Typography>
                    <Button
                      sx={{
                        my: "40px"
                      }}
                      variant="outlined"
                      onClick={() => activateDiscordBot(null)}
                      // to={
                      //   "https://discord.com/api/oauth2/authorize?client_id=1129037421615529984&permissions=8&scope=bot%20applications.commands"
                      // }
                      size="small"
                      color="offWhite"
                    >
                      Add bot
                    </Button>
                  </Stack>
                </>
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default BotGatherings;
