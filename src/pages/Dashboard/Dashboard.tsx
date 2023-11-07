/* eslint-disable max-len */
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Typography,
  Stack,
  Grid,
  IconButton,
  SvgIcon,
  Badge,
  Tooltip,
  Button
} from "@mui/material";
import { allRoles, CommunityData } from "@store/Community/community.reducer";
import { useDispatch, useSelector } from "react-redux";
import { setTitle } from "@store/ui-reducer";
import { memo, useEffect } from "react";
import { UserInfo } from "@auth/auth.reducer";
import CopyAddress from "@components/CopyAddress";
import { ipfsCIDToHttpUrl } from "@api/storage.api";
import {
  useGetAllMembersQuery,
  useGetArchetypeAndStatsQuery
} from "@api/community.api";
import LoadingProgressBar from "@components/LoadingProgressBar";
import { ReactComponent as EditIcon } from "@assets/actions/edit.svg";
import { Link } from "react-router-dom";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ArchetypePieChart from "./ArchetypePieChart";
import { NovaArchetype } from "@aut-labs/sdk/dist/models/nova";

const getGreeting = () => {
  const hour = new Date().getHours();
  const welcomeTypes = ["Good morning", "Good afternoon", "Good evening"];
  let welcomeText = "";
  if (hour < 12) welcomeText = welcomeTypes[0];
  else if (hour < 18) welcomeText = welcomeTypes[1];
  else welcomeText = welcomeTypes[2];
  return welcomeText;
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector(UserInfo);
  const community = useSelector(CommunityData);
  const roles = useSelector(allRoles);

  const { data, isLoading, isFetching } = useGetAllMembersQuery(null, {
    refetchOnMountOrArgChange: true,
    skip: false
  });

  const {
    archetype,
    isLoading: isLoadingArchetype,
    isFetching: isFetchingArchetype
  } = useGetArchetypeAndStatsQuery(null, {
    selectFromResult: ({ data, isLoading, isFetching }) => ({
      isLoading,
      isFetching,
      archetype: data?.archetype
    })
  });

  const membersTableData = {
    totalMembers: 0
  };

  let averageCommitment = 0;

  if (data && roles && data?.length) {
    membersTableData.totalMembers = data.length;
    roles.forEach((role) => {
      const membersByRole = data.reduce(function (n, member) {
        return n + +(member?.properties?.role.id == role.id);
      }, 0);

      membersTableData[role.id] = membersByRole;
    });

    const commitmentSum = data.reduce(
      (prev, curr) => prev + +curr.properties.commitment,
      0
    );

    averageCommitment = Math.round(commitmentSum / data.length);
  }

  useEffect(() => {
    dispatch(
      setTitle(
        userInfo?.name
          ? `${getGreeting()}, ${userInfo?.name}`
          : `${getGreeting()}`
      )
    );
  }, [dispatch, userInfo]);

  return (
    <Container
      sx={{
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        maxWidth: {
          xs: "sm",
          sm: "100%"
        }
      }}
    >
      <LoadingProgressBar isLoading={isFetching} />

      <Grid container spacing={4} mt={0}>
        <Grid item sm={12} md={6}>
          <Card
            sx={{
              borderColor: "divider",
              borderRadius: "16px",
              boxShadow: 7,
              width: "100%",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              background: "transparent",
              maxWidth: {
                xs: "100%",
                sm: "90%",
                md: "80%",
                xxl: "65%"
              }
            }}
          >
            <CardHeader
              avatar={
                <Avatar
                  sx={{
                    width: {
                      xs: "120px",
                      xxl: "300px"
                    },
                    height: "100%"
                  }}
                  variant="square"
                  srcSet={ipfsCIDToHttpUrl(community?.image as string)}
                />
              }
              sx={{
                px: 4,
                pt: 4,
                alignItems: "flex-start",
                flexDirection: {
                  xs: "column",
                  md: "row"
                },
                maxWidth: {
                  xs: "100%",
                  sm: "400px",
                  md: "600px",
                  xxl: "800px"
                },

                ".MuiCardContent-root": {
                  width: "100%",
                  padding: "0px 16px"
                },

                width: "100%",
                ".MuiAvatar-root": {
                  backgroundColor: "transparent"
                }
              }}
              title={
                <>
                  <Box
                    sx={{
                      display: "flex",
                      gridGap: "4px"
                    }}
                  >
                    <Typography variant="subtitle1" color="white">
                      {community.name}
                    </Typography>
                    <IconButton component={Link} to={`edit-community`}>
                      <SvgIcon component={EditIcon} />
                    </IconButton>
                  </Box>
                  <CopyAddress address={community.properties.address} />
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography
                      color="white"
                      variant="body"
                      sx={{ mb: "20px" }}
                    >
                      {community.properties.market}
                    </Typography>
                  </Box>
                </>
              }
            />
            <CardContent
              sx={{
                pt: 0,
                flex: 1,
                px: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <Typography color="white" variant="body">
                {community.description}
              </Typography>

              <Stack mt={4} gap={2}>
                <Box display="flex" gap={2}>
                  <Typography color="primary" variant="subtitle2">
                    Market:
                  </Typography>
                  <Typography color="primary" variant="subtitle2">
                    {community.properties.market}
                  </Typography>
                </Box>
                <Box display="flex" gap={2}>
                  <Typography color="primary" variant="subtitle2">
                    Your AV:
                  </Typography>
                  <Typography color="primary" variant="subtitle2">
                    1.0
                  </Typography>
                </Box>
                <Box display="flex" gap={2} flexDirection="column">
                  <Typography color="primary" variant="subtitle2">
                    Your Roles:
                  </Typography>
                  <Stack ml={4} gap={2}>
                    <Box display="flex" gap={2}>
                      <Typography color="white" variant="subtitle2">
                        Role 1:
                      </Typography>
                      <Typography color="white" variant="subtitle2">
                        60%
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                      <Typography color="white" variant="subtitle2">
                        Role 2:
                      </Typography>
                      <Typography color="white" variant="subtitle2">
                        30%
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                      <Typography color="white" variant="subtitle2">
                        Role 3:
                      </Typography>
                      <Typography color="white" variant="subtitle2">
                        10%
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                <Box display="flex" gap={2}>
                  <Typography color="primary" variant="subtitle2">
                    Health balance:
                  </Typography>
                  <Typography color="primary" variant="subtitle2">
                    30%
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item sm={12} md={6}>
          <Box
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              margin: "0 auto"
            }}
          >
            <Box mb={4} textAlign="center">
              <Badge
                badgeContent={
                  <Tooltip title="During beta there is a maximum of 3 quests, one for each role.">
                    <HelpOutlineIcon
                      sx={{ width: "16px", ml: 1, color: "white" }}
                    />
                  </Tooltip>
                }
              >
                <Typography variant="subtitle1" color="white">
                  Your Archetype:
                </Typography>
              </Badge>
            </Box>
            <Box
              sx={{
                width: "100%",
                position: "relative",
                height: "400px"
              }}
            >
              <ArchetypePieChart archetype={archetype} />
              {/* @ts-ignore */}
              {archetype?.archetype === NovaArchetype.NONE && (
                <>
                  <Button
                    sx={{
                      zIndex: 1,
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "200px",
                      height: "80px",
                      textAlign: "center"
                    }}
                    component={Link}
                    to={`your-archetype`}
                    type="button"
                    color="secondary"
                    variant="contained"
                    size="medium"
                  >
                    Set your <br /> archetype
                  </Button>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "transparent",
                      backdropFilter: "blur(25px)"
                    }}
                  />
                </>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};
export default memo(Dashboard);
