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
  Button,
  styled,
  useTheme
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { allRoles, CommunityData } from "@store/Community/community.reducer";
import { useDispatch, useSelector } from "react-redux";
import { setTitle } from "@store/ui-reducer";
import { memo, useEffect, useMemo } from "react";
import { UserInfo } from "@auth/auth.reducer";
import CopyAddress from "@components/CopyAddress";
import { ipfsCIDToHttpUrl } from "@api/storage.api";
import {
  ArchetypeTypes,
  useGetAllMembersQuery,
  useGetArchetypeAndStatsQuery
} from "@api/community.api";
import LoadingProgressBar from "@components/LoadingProgressBar";
import { ReactComponent as EditIcon } from "@assets/actions/edit.svg";
import { Link } from "react-router-dom";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { NovaArchetype } from "@aut-labs/sdk/dist/models/nova";
import { SubtitleWithInfo } from "@components/SubtitleWithInfoIcon";
import AutIconLabel from "@components/AutIconLabel";
import { MarketTemplates } from "@api/community.model";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HubRoleTabs from "../Roles/HubRolesTabs";
import { ArchetypePieChartDesign } from "../Archetype/ArchetypePieChart";
import ArchetypeTabs from "../Archetype/ArchetypeTabs";

const getGreeting = () => {
  const hour = new Date().getHours();
  const welcomeTypes = ["Good morning", "Good afternoon", "Good evening"];
  let welcomeText = "";
  if (hour < 12) welcomeText = welcomeTypes[0];
  else if (hour < 18) welcomeText = welcomeTypes[1];
  else welcomeText = welcomeTypes[2];
  return welcomeText;
};

const FollowWrapper = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  width: "150px",
  justifyContent: "center"
}));

const AutContainer = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100%",
  paddingTop: "32px",
  gap: "30px",
  flexDirection: "row",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    width: "100%"
  }

  // backgroundImage: `url(${backgroundImage})`,
  // backgroundBlendMode: "hard-light",
  // backgroundSize: "cover",
  // backgroundRepeat: "repeat-y"
}));

const LeftWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "fit-content",
  width: "100%",
  maxWidth: "480px",
  backdropFilter: "blur(12px)",
  backgroundColor: "rgba(128, 128, 128, 0.06)",
  boxShadow: "0px 3px 6px #00000029",
  borderRadius: "24px",
  padding: "32px 16px",
  marginLeft: "24px",
  [theme.breakpoints.down("md")]: {
    width: "90%",
    maxWidth: "unset",
    marginLeft: 0,
    marginRight: 0
  }
}));

const RightWrapper = styled(Box)(({ theme }) => ({
  alignSelf: "flex-start",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  px: "30px",
  marginRight: "25px",
  marginLeft: "25px",
  height: "100%",
  position: "relative",
  // width: "70%",
  flex: 1,
  [theme.breakpoints.down("md")]: {
    width: "100%",
    marginLeft: 0,
    marginRight: 0
  }
}));
const calculateFontSize = (name: string) => {
  const words = name.split(" ");
  const longestWordLength = Math.max(...words.map((word) => word.length));
  if (longestWordLength >= 22) {
    return "0.85rem !important";
  } else if (longestWordLength >= 20) {
    return "0.95rem !important";
  } else if (longestWordLength >= 18) {
    return "1.05rem !important";
  } else if (longestWordLength >= 16) {
    return "1.15rem !important";
  } else if (longestWordLength >= 14) {
    return "1.25rem !important";
  } else if (longestWordLength >= 12) {
    return "1.35rem !important";
  } else if (longestWordLength >= 10) {
    return "1.45rem !important";
  } else {
    return "";
  }
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector(UserInfo);
  console.log("userInfo", userInfo);
  const community = useSelector(CommunityData);
  const roles = useSelector(allRoles);

  const { data, isLoading, isFetching } = useGetAllMembersQuery(null, {
    refetchOnMountOrArgChange: true,
    skip: false
  });

  console.log(data, isLoading, isFetching);

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

  //TODO: Remove this when the data is available
  // community.properties.market = "Social, Art & Gaming";
  // community.properties.prestige = 100;
  // community.properties.members = 1;

  const marketTemplate = useMemo(() => {
    const marketName = community?.properties?.market;
    return MarketTemplates.find(
      (v) => v.title === marketName || v.market === +marketName
    );
  }, [community]);
  const selectedArchetype = useMemo(() => {
    if (!community?.properties?.archetype?.default) {
      return null;
    }
    return ArchetypeTypes[community?.properties?.archetype?.default];
  }, [community]);

  const membersTableData = {
    totalMembers: 0
  };

  const averageCommitment = 0;
  const blockExplorer = "https://etherscan.io";
  const theme = useTheme();

  if (data && roles && data?.length) {
    membersTableData.totalMembers = data.length;
    roles.forEach((role) => {
      // const membersByRole = data.reduce(function (n, member) {
      //   return n + +(member?.properties?.role.id == role.id);
      // }, 0);
      // membersTableData[role.id] = membersByRole;
    });

    // const commitmentSum = data.reduce(
    //   (prev, curr) => prev + +curr.properties.commitment,
    //   0
    // );

    // averageCommitment = Math.round(commitmentSum / data.length);
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

  console.log("rolSets", community.properties.rolesSets[0]);

  return (
    <Container
      sx={{
        flexGrow: 1,
        display: "flex",
        gap: "30px",
        maxWidth: {
          xs: "sm",
          sm: "100%"
        }
      }}
    >
      <LoadingProgressBar isLoading={isFetching} />

      <LeftWrapper>
        <Stack
          sx={{
            width: "100%",
            maxWidth: "400px",
            px: "24px"
          }}
        >
          <AutContainer>
            <Stack
              sx={{
                width: "100%",
                maxWidth: "400px"
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "12px",
                  justifyContent: "center"
                }}
              >
                <Box
                  sx={{
                    flex: "1",
                    height: {
                      xs: "120px",
                      sm: "120px",
                      md: "120px",
                      xxl: "130px"
                    },
                    width: {
                      xs: "120px",
                      sm: "120px",
                      md: "120px",
                      xxl: "130px"
                    },
                    "@media (max-width: 370px)": {
                      height: "100px",
                      width: "100px"
                    },
                    minWidth: "120px",
                    position: "relative"
                  }}
                >
                  <Avatar
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "0",
                      background: "transparent"
                    }}
                    aria-label="avatar"
                  >
                    <img
                      src={ipfsCIDToHttpUrl(community?.image as string)}
                      style={{
                        objectFit: "contain",
                        width: "100%",
                        height: "100%"
                      }}
                    />
                  </Avatar>
                </Box>

                <div
                  style={{
                    flex: "1",
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    justifyContent: "center"
                  }}
                >
                  <Typography
                    color="offWhite.main"
                    textAlign="center"
                    lineHeight={1}
                    variant="h3"
                    marginBottom={2}
                    fontSize={calculateFontSize(community?.name as string)}
                  >
                    {community?.name}
                    {community.properties.domain && (
                      <SvgIcon
                        component={CheckCircleIcon}
                        sx={{
                          fontSize: "0.8em",
                          marginLeft: "4px",
                          verticalAlign: "middle",
                          color: theme.palette.success.main
                        }}
                      />
                    )}
                  </Typography>
                  <CopyAddress address={community?.properties.address} />
                  {/* Add domain information here */}
                  <Typography
                    color="offWhite.main"
                    textAlign="center"
                    variant="body2"
                    marginTop={1}
                  >
                    {community.properties.domain
                      ? community.properties.domain
                      : "Domain not registered"}
                  </Typography>
                </div>
              </Box>
              <Stack
                direction="row"
                sx={{
                  marginTop: 3
                }}
              >
                <Stack
                  width="100%"
                  direction="column"
                  justifyContent="space-around"
                  sx={{
                    marginTop: theme.spacing(2)
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      marginRight: "16px",
                      mb: "8px",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    <Typography
                      fontWeight="bold"
                      fontFamily="FractulAltBold"
                      variant="subtitle1"
                      sx={{
                        mb: "0px",
                        color: "#FFF"
                      }}
                    >
                      {/* {community?.properties.members} */}
                    </Typography>
                    <Typography
                      fontWeight="bold"
                      fontFamily="FractulRegular"
                      variant="caption"
                      sx={{
                        mb: "0px",
                        color: "#A7B1C4"
                      }}
                    >
                      members
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      marginRight: "16px",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    <Typography
                      fontWeight="bold"
                      fontFamily="FractulAltBold"
                      variant="subtitle1"
                      sx={{
                        mb: "0px",
                        color: "#FFF"
                      }}
                    >
                      {/* {community?.properties.prestige} */}
                    </Typography>
                    <Typography
                      fontWeight="bold"
                      fontFamily="FractulRegular"
                      variant="caption"
                      sx={{
                        mb: "0px",
                        color: "#A7B1C4"
                      }}
                    >
                      prestige
                    </Typography>
                  </Box>
                </Stack>

                <Stack
                  width="100%"
                  justifyContent="space-around"
                  sx={{
                    marginTop: theme.spacing(2),
                    gap: 2
                  }}
                >
                  <AutIconLabel
                    textColor="#FFF"
                    sx={{
                      border: "1px solid #707070",
                      minHeight: "42px",
                      minWidth: "165px"
                    }}
                    icon={
                      <SvgIcon
                        sx={{
                          width: "16px"
                        }}
                        inheritViewBox
                        component={marketTemplate?.icon}
                      ></SvgIcon>
                    }
                    label={marketTemplate?.title}
                  ></AutIconLabel>
                  <AutIconLabel
                    textColor="#FFF"
                    sx={{
                      border: "1px solid #707070",
                      minHeight: "42px",
                      minWidth: "165px",
                      ...(!selectedArchetype?.archetype && {
                        ".MuiSvgIcon-root": {
                          display: "none"
                        }
                      })
                      // flex: "1"
                      // marginTop: theme.spacing(2)
                    }}
                    icon={
                      <SvgIcon
                        sx={{
                          width: "16px"
                        }}
                        inheritViewBox
                        component={selectedArchetype?.logo}
                      ></SvgIcon>
                    }
                    label={selectedArchetype?.title ?? "N/A"}
                  ></AutIconLabel>
                </Stack>
              </Stack>
              <Box
                sx={{
                  marginTop: theme.spacing(2)
                }}
              >
                <Box sx={{ padding: "8px 0px" }}>
                  <Typography
                    sx={{ flex: "1" }}
                    color="offWhite.main"
                    textAlign="left"
                    variant="body"
                  >
                    {community?.description || "No description yet..."}
                  </Typography>
                </Box>
              </Box>
              <Box
                marginTop={theme.spacing(2)}
                sx={{
                  display: "flex",
                  marginTop: theme.spacing(2),
                  flexDirection: "row",
                  gap: "12px",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              ></Box>
            </Stack>
          </AutContainer>
        </Stack>
      </LeftWrapper>
      <RightWrapper>
        <HubRoleTabs roles={community?.properties?.rolesSets[0]?.roles} />
        {/* <ArchetypeTabs archetype={archetype} /> */}
      </RightWrapper>
    </Container>
  );
};
export default memo(Dashboard);
