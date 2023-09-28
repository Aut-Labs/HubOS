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
  IsDiscordVerified
} from "@store/Community/community.reducer";
import { useEffect, useMemo, useRef, useState } from "react";
import AutTabs from "@components/AutTabs/AutTabs";
import { AutButton } from "@components/buttons";
import DiscordServerVerificationPopup from "@components/Dialog/DiscordServerVerificationPopup";
import { AppBar } from "@components/Sidebar/Sidebar";
import { useGetGatheringsQuery, useGetGuildIdQuery } from "@api/discord.api";

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
    </Box>
  );
};

const Bot = () => {
  const theme = useTheme();
  const [botActive, setBotActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isDiscordVerified = useSelector(IsDiscordVerified);
  const communityData = useSelector(CommunityData);
  const isExtraLarge = useMediaQuery(theme.breakpoints.up("xxl"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(!isMobile);
  const [discordDialogOpen, setDiscordDialogOpen] = useState(false);
  const { data, isLoading, isFetching, refetch } = useGetGuildIdQuery();

  const {
    data: gatherings,
    isLoading: gatheringsLoading,
    isSuccess
  } = useGetGatheringsQuery(data, {
    // refetchOnMountOrArgChange: false,
    skip: data === undefined || botActive === false
  });

  const drawerWidth = useMemo(() => {
    return isExtraLarge ? 350 : 300;
  }, [isExtraLarge]);

  const toolbarHeight = useMemo(() => {
    return isExtraLarge ? 92 : 72;
  }, [isExtraLarge]);

  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const handleAddBot = async () => {
    const apiUrl = "http://localhost:4006/guild"; // Replace with your API endpoint URL
    console.log("communityData", communityData);
    const roles = communityData?.properties.rolesSets[0].roles.map((role) => {
      return { name: role.roleName, id: role.id };
    });
    const discordLink = communityData?.properties.socials.find(
      (l) => l.type === "discord"
    ).link;
    const serverCode = discordLink.match(/discord\.gg\/(.+)/i)[1];
    const serverIdResponse = await axios.get(
      `https://discord.com/api/invites/${serverCode}`
    );
    const guildId = serverIdResponse.data.guild.id;
    // const guildId = "1133407677091942480";
    const requestObject = {
      daoAddress: communityData?.properties.address,
      roles: roles,
      guildId
    };
    try {
      const result = await axios.post(apiUrl, requestObject);

      const discordBotLink =
        "https://discord.com/api/oauth2/authorize?client_id=1129037421615529984&permissions=8&scope=bot%20applications.commands";
      window.open(discordBotLink, "_blank");
      setLoading(true);
      intervalRef.current = setInterval(async () => {
        const botActiveRequest = await axios.get(
          `http://localhost:4006/check/${guildId}`
        );
        const botActive = botActiveRequest.data.active;
        // if (botActive) {
        //   navigate(`/${communityData.name}/bot/gathering`);
        // }
        if (botActive) {
          setLoading(false);
          setBotActive(botActive);
          clearInterval(intervalRef.current);
        }
      }, 2000);
    } catch (e) {
      console.log(e);
    }
  };

  const gatheringsList = useMemo(() => {
    if (isSuccess) return gatherings;
    return null;
  }, [isSuccess]);

  useEffect(() => {
    const fetch = async () => {
      if (data) {
        const botActiveRequest = await axios.get(
          `http://localhost:4006/check/${data}`
        );
        const botActive = botActiveRequest.data.active;
        setLoading(false);
        setBotActive(botActive);
      }
    };

    fetch();
  }, [data]);

  // useEffect(() => {

  // }, [botActive]);

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
      <Typography mt={7} textAlign="center" color="white" variant="h3">
        Āut Bot
      </Typography>

      {loading ? (
        <>
          {" "}
          <CircularProgress
            className="spinner-center"
            size="60px"
            style={{ top: "calc(50% - 30px)" }}
          />{" "}
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
                Please verify the discord account for your community to unlock
                Āut Bot features.
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
              />
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "flexEnd"
                }}
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
                <AutButton
                  variant="outlined"
                  color="offWhite"
                  onClick={() => {
                    navigate(`/${communityData.name}/bot/poll/info`);
                  }}
                >
                  Create Poll
                </AutButton>
              </Box>
            </>
          ) : (
            <>
              <Stack alignItems="center" justifyContent="center">
                <Typography
                  mt={7}
                  textAlign="center"
                  color="white"
                  variant="body"
                  maxWidth={400}
                >
                  Connect your Discord Members to your DAO Roles - directly
                  on-chain. Create Group Gatherings and Voting Routines to turn
                  your community into a healthy collaboration engine!
                </Typography>
                <Button
                  sx={{
                    my: "40px"
                  }}
                  variant="outlined"
                  onClick={handleAddBot}
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
    </Container>
  );
};

export default Bot;
