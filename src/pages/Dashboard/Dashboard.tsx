import {
  Avatar,
  Box,
  Container,
  Typography,
  Stack,
  SvgIcon,
  styled,
  useTheme
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setTitle } from "@store/ui-reducer";
import { memo, useEffect, useMemo } from "react";
import CopyAddress from "@components/CopyAddress";
import { ipfsCIDToHttpUrl } from "@api/storage.api";
import { ArchetypeTypes } from "@api/hub.api";
import AutIconLabel from "@components/AutIconLabel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { AutIDData, HubData } from "@store/Hub/hub.reducer";
import { ArchetypePie } from "../Archetype/ArchetypePie";
import { AutIDProperties, HubArchetype } from "@aut-labs/sdk";
import { ArchetypeCard } from "../Archetype/Archetype";
import { archetypeChartValues } from "../Archetype/ArchetypePieChart";
import { HubOSAutID } from "@api/aut.model";

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
  height: "80%",
  width: "100%",
  maxWidth: "480px",
  backdropFilter: "blur(6px)",
  // backgroundColor: "rgba(255, 255, 255, 0.12)",
  backgroundColor: "rgba(128, 128, 128, 0.2)",
  boxShadow: "0px 3px 6px #00000029",
  borderRadius: "24px",
  // padding: "32px 16px",
  marginLeft: "24px",
  marginTop: "auto",
  marginBottom: "auto",
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
  // width: "80%",
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

function getScoreColor(prestige: number): string {
  if (prestige <= 75) {
    return "#BF1A2F"; // Red - Really Bad
  } else if (prestige <= 99) {
    return "#88498F"; // Purple - Bad
  } else if (prestige <= 120) {
    return "#2E90FA"; // Blue - OK
  } else if (prestige <= 149) {
    return "#20A4B2"; // Blue-Green - Good
  } else {
    return "#12B76A"; // Green - Excellent
  }
}

const Dashboard = ({ members }: { members: HubOSAutID<AutIDProperties>[] }) => {
  const dispatch = useDispatch();
  const autIDData = useSelector(AutIDData);
  const theme = useTheme();
  const hubData = useSelector(HubData);

  const selectedArchetype = useMemo(() => {
    if (!hubData?.properties?.archetype?.default) {
      return null;
    }
    return ArchetypeTypes[HubArchetype.SIZE];
  }, [hubData]);

  const archetypeState = useMemo(() => {
    const states = archetypeChartValues(
      hubData.properties.archetype.parameters
    );
    return states[hubData.properties.archetype.default];
  }, [hubData]);

  const prestige = useMemo(() => {
    return (hubData?.properties as any)?.prestige ?? 100;
  }, [hubData]);

  const period = useMemo(() => {
    return (hubData?.properties as any)?.period ?? 1;
  }, [hubData]);

  useEffect(() => {
    dispatch(
      setTitle(
        autIDData?.name
          ? `${getGreeting()}, ${autIDData?.name}`
          : `${getGreeting()}`
      )
    );
  }, [dispatch, autIDData]);

  return (
    <Container
      sx={{
        flexGrow: 1,
        display: "flex",
        gap: "30px",
        maxWidth: "md"
      }}
    >
      <LeftWrapper>
        <Stack
          sx={{
            width: "100%",
            maxWidth: "400px",
            px: "24px",
            height: "100%"
          }}
        >
          <Typography
            variant="h3"
            color="offWhite.main"
            textAlign="center"
            mt={2}
          >
            Your Hub
          </Typography>

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
                  justifyContent: "flex-start"
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
                      width: "unset",
                      height: "100%",
                      borderRadius: "0",
                      background: "transparent"
                    }}
                    aria-label="avatar"
                    src={ipfsCIDToHttpUrl(hubData?.image as string)}
                  >
                    {/* <img
                      src={ipfsCIDToHttpUrl(hubData?.image as string)}
                      style={{
                        objectFit: "contain",
                        width: "100%",
                        height: "100%"
                      }}
                    /> */}
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
                    fontSize={calculateFontSize(hubData?.name as string)}
                  >
                    {hubData?.name}
                    {hubData.properties.domain && (
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
                  <CopyAddress address={hubData?.properties.address} />
                  {/* Add domain information here */}
                  <Typography
                    color="offWhite.main"
                    textAlign="center"
                    variant="body2"
                    marginTop={1}
                  >
                    {hubData.properties.domain
                      ? hubData.properties.domain
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
                      {members?.length}
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
                        color: getScoreColor(prestige)
                      }}
                    >
                      {prestige}
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
                        component={hubData.marketTemplate?.icon}
                      ></SvgIcon>
                    }
                    label={hubData.marketTemplate?.title}
                  ></AutIconLabel>
                  <AutIconLabel
                    textColor="#FFF"
                    sx={{
                      border: "1px solid #707070",
                      minHeight: "42px",
                      minWidth: "165px",
                      ...(!selectedArchetype && {
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
                    {hubData?.description || "No description yet..."}
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
      <LeftWrapper>
        {/* <ArchetypePie archetype={hubData?.properties?.archetype} /> */}
        {/* <ArchetypeCard {...archetypeState} /> */}
        <Stack
          sx={{
            width: "100%",
            maxWidth: "400px",
            px: "24px",
            height: "100%"
          }}
        >
          <Typography
            variant="h3"
            color="offWhite.main"
            textAlign="center"
            mt={2}
          >
            Your Archetype
          </Typography>
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
                  justifyContent: "flex-start"
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
                      width: "unset",
                      height: "100px",
                      borderRadius: "0",
                      background: "transparent"
                    }}
                    aria-label="avatar"
                    component={archetypeState.logo}
                  />
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
                    fontSize={calculateFontSize(archetypeState.title as string)}
                  >
                    {archetypeState.title}
                  </Typography>
                </div>
              </Box>

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
                    {hubData?.description || "No description yet..."}
                  </Typography>
                </Box>
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
                      1
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
                      Your Av:
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
                      {`#${period}`}
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
                      Period no.
                    </Typography>
                  </Box>
                </Stack>
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
                      n+1
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
                      exp. AV in period:
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
                      0%
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
                      how you’re doing:
                    </Typography>
                  </Box>
                </Stack>
              </Stack>

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
    </Container>
  );
};
export default memo(Dashboard);
