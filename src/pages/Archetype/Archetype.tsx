import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import {
  Box,
  Button,
  CardHeader,
  CardMedia,
  Avatar,
  Container,
  styled,
  Stack,
  Slider,
  IconButton,
  SvgIcon,
  Tooltip,
  alpha,
  useTheme
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArchetypePieChart, { archetypeChartValues } from "./ArchetypePieChart";
import EditIcon from "@assets/actions/edit.svg?react";
import CloseIcon from "@mui/icons-material/Close";
import {
  useGetArchetypeAndStatsQuery,
  useSetArchetypeMutation
} from "@api/hub.api";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import { calculateAV } from "@utils/av-calculator";
import { HubArchetype, HubArchetypeParameters } from "@aut-labs/sdk";
import { useState, useEffect, useMemo } from "react";

const GridCard = styled(Card)(({ theme }) => {
  return {
    height: "310px",
    margin: "0 auto",
    transition: theme.transitions.create(["transform"]),
    "&:hover": {
      transform: "scale(1.019)"
    }
  };
});

const ChooseArchetypeBtn = styled(Button, {
  shouldForwardProp: (prop) => prop !== "isHovered"
})<{
  isHovered?: boolean;
}>(({ theme, isHovered }) => ({
  position: "absolute",
  bottom: "40px",
  left: "50%",
  transform: "translateX(-50%)",
  opacity: isHovered ? 1 : 0,
  transition: "opacity 0.35s ease"
}));

const Title = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "isHovered"
})<{
  isHovered?: boolean;
}>(({ theme, isHovered }) => ({
  position: "absolute",
  width: "100%",
  left: "0",
  top: isHovered ? "100px" : "50px",
  textAlign: "center",
  textTransform: "uppercase",
  zIndex: 1,
  transition: theme.transitions.create("top")
}));

const Description = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "isHovered"
})<{
  isHovered?: boolean;
}>(({ theme, isHovered }) => ({
  opacity: isHovered ? 0 : 1,
  textAlign: "center",
  transition: theme.transitions.create("opacity")
}));

const Overlay = styled("div", {
  shouldForwardProp: (prop) => prop !== "isHovered"
})<{
  isHovered?: boolean;
}>(({ theme, isHovered }) => ({
  position: "absolute",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  background: isHovered ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0)",
  transition: theme.transitions.create("background")
}));

const ArchetypeCard = ({
  title,
  description,
  logo,
  type,
  onSelect,
  activeArchetype
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  return (
    <GridCard
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() =>
        onSelect({
          title,
          description,
          logo,
          type
        })
      }
      sx={{
        ...(!activeArchetype
          ? {
              bgcolor: "nightBlack.main"
            }
          : {
              bgcolor: alpha(theme.palette.primary.main, 0.3)
            }),
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderColor: "divider",
        borderRadius: "16px",
        minHeight: "300px",
        position: "relative",
        boxShadow: 7,
        width: {
          xs: "100%",
          md: "250px",
          lg: "300px",
          xxl: "350px"
        }
      }}
      variant="outlined"
    >
      <Overlay isHovered={isHovered} />
      <CardMedia
        sx={{ height: "140px", width: "140px", margin: "0 auto", mt: 2, mb: 0 }}
        image={logo}
        title={title}
      />
      <CardContent
        sx={{
          pt: 0,
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Title
          fontFamily={"FractulAltBold"}
          fontWeight={900}
          color="white"
          variant="subtitle1"
          isHovered={isHovered}
        >
          {title}
        </Title>
        <Description
          isHovered={isHovered}
          textAlign="center"
          color="white"
          variant="body"
        >
          {description}
        </Description>
        <ChooseArchetypeBtn
          onClick={() => onSelect(type)}
          color="offWhite"
          variant="outlined"
          sx={{
            width: "80%"
          }}
          size="large"
          isHovered={isHovered}
        >
          {activeArchetype ? "Change archetype" : "Choose Archetype"}
        </ChooseArchetypeBtn>
      </CardContent>
    </GridCard>
  );
};

const ChooseYourArchetype = ({ setSelected, archetype }) => {
  const [state, setState] = useState(archetypeChartValues(archetype));
  console.log("state: ", state);
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          mb: 4,
          position: "relative"
        }}
      >
        <Typography textAlign="center" color="white" variant="h3">
          Choose your Archetype
        </Typography>
        <Typography
          mt={2}
          mx="auto"
          textAlign="center"
          color="white"
          sx={{
            width: {
              xs: "100%",
              sm: "700px",
              xxl: "1000px"
            }
          }}
          variant="body"
        >
          The archetype represents the KPI, the driver of your hub. Set up
          your hub values, deliver, and thrive. The better you perform,
          the more your hub credibility will grow. Read more about
          Archetypes
        </Typography>
      </Box>
      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* Row 1 */}
        <Grid item xs={12} sm={6} md={4}>
          <ArchetypeCard
            activeArchetype={archetype?.archetype === HubArchetype.SIZE}
            onSelect={setSelected}
            {...state[HubArchetype.SIZE]}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ArchetypeCard
            activeArchetype={archetype?.archetype === HubArchetype.REPUTATION}
            onSelect={setSelected}
            {...state[HubArchetype.REPUTATION]}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ArchetypeCard
            activeArchetype={archetype?.archetype === HubArchetype.CONVICTION}
            onSelect={setSelected}
            {...state[HubArchetype.CONVICTION]}
          />
        </Grid>

        {/* Row 2 */}
        <Grid
          display={{
            xs: "none",
            md: "inherit"
          }}
          item
          xs={false}
          sm={false}
          md={2}
        />
        <Grid item xs={12} sm={6} md={4}>
          <ArchetypeCard
            activeArchetype={archetype?.archetype === HubArchetype.PERFORMANCE}
            onSelect={setSelected}
            {...state[HubArchetype.PERFORMANCE]}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ArchetypeCard
            activeArchetype={archetype?.archetype === HubArchetype.GROWTH}
            onSelect={setSelected}
            {...state[HubArchetype.GROWTH]}
          />
        </Grid>
        <Grid
          display={{
            xs: "none",
            md: "inherit"
          }}
          item
          xs={false}
          sm={false}
          md={2}
        />
      </Grid>
    </>
  );
};

const YourArchetype = ({ selectedArchetype, unselect, archetype, stats }) => {
  const [editMode, setEditMode] = useState(
    selectedArchetype?.type != archetype?.archetype
  );

  const [initialValues, setInitialValues] = useState(true);

  const theme = useTheme();
  const [state, setState] = useState(archetypeChartValues(archetype));

  const TOTAL_VALUE = 100;

  // Calculate the total value of all sliders and the remaining value to allocate
  const totalValue = Object.keys(state).reduce(
    (total, key) => total + state[key].value,
    0
  );

  const remainingValue = TOTAL_VALUE - totalValue;
  const showNotification = totalValue !== TOTAL_VALUE;

  const handleChange = (sliderId) => (_, newValue) => {
    let min = 0;
    let max = 100;

    const activeState = state[selectedArchetype.type];
    if (+sliderId === selectedArchetype?.type) {
      min = activeState.min;
      max = activeState.max;
    } else {
      min = 0;
      max = activeState.min;
    }

    console.log(min, max, sliderId, selectedArchetype, activeState);

    if (newValue >= min && newValue <= max) {
      setState((prevState) => ({
        ...prevState,
        [sliderId]: {
          ...prevState[sliderId],
          value: newValue
        }
      }));
    }
  };

  useEffect(() => {
    if (!initialValues) return;

    const activeState = state[selectedArchetype.type];

    const currentValue = activeState.value;
    const minValue = activeState.min;

    if (minValue > currentValue && initialValues) {
      const newState = Object.keys(state).reduce((prev, key) => {
        prev[key] = {
          ...state[key],
          value: activeState.defaults[key]
        };
        return prev;
      }, {} as any);

      console.log(newState, "newState");
      setState(newState);
      setInitialValues(false);
    }
  }, [selectedArchetype, initialValues, state]);

  const av = useMemo(() => {
    const updatedArchetype = {
      size: state[HubArchetype.SIZE].value,
      reputation: state[HubArchetype.REPUTATION].value,
      conviction: state[HubArchetype.CONVICTION].value,
      performance: state[HubArchetype.PERFORMANCE].value,
      growth: state[HubArchetype.GROWTH].value
    };

    return calculateAV(updatedArchetype);
  }, [state]);

  const actionName = useMemo(() => {
    if (!archetype?.archetype) {
      return "Set Archetype";
    }

    if (selectedArchetype?.type === archetype?.archetype) {
      return "Confirm";
    }

    return "Change and Confirm";
  }, [selectedArchetype, archetype]);

  const [setArchetype, { error, isError, isLoading, reset }] =
    useSetArchetypeMutation();

  const updateArchetype = () => {
    const updatedArchetype: HubArchetypeParameters = {
      archetype: selectedArchetype?.type,
      size: state[HubArchetype.SIZE].value,
      growth: state[HubArchetype.GROWTH].value,
      conviction: state[HubArchetype.CONVICTION].value,
      performance: state[HubArchetype.PERFORMANCE].value,
      reputation: state[HubArchetype.REPUTATION].value
    };
    setArchetype(updatedArchetype);
  };

  return (
    <>
      <ErrorDialog handleClose={() => reset()} open={isError} message={error} />
      <LoadingDialog open={isLoading} message="Updating Archertype..." />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          mb: 2,
          position: "relative"
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            position: "relative",
            mx: "auto",
            width: "100%"
          }}
        >
          <Stack alignItems="center" justifyContent="center">
            <Button
              startIcon={<ArrowBackIcon />}
              color="offWhite"
              onClick={() => unselect()}
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

            <Typography variant="h3" color="offWhite.main" fontWeight="bold">
              Your Archetype
            </Typography>
          </Stack>
        </Box>
        <Typography
          mt={2}
          mx="auto"
          textAlign="center"
          color="white"
          sx={{
            width: {
              xs: "100%",
              sm: "700px",
              xxl: "1000px"
            }
          }}
          variant="body"
        >
          The archetype represents the KPI, the driver of your hub.
        </Typography>
      </Box>
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
                  srcSet={selectedArchetype?.logo}
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
                      {selectedArchetype.title}
                    </Typography>
                  </Box>
                </>
              }
            />
            <CardContent
              sx={{
                flex: 1,
                width: "100%",
                px: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <Typography color="white" variant="body">
                {selectedArchetype.description}
              </Typography>

              <Stack mt={4} mb={4} gap={2}>
                <Box display="flex" gap={2} flexDirection="column">
                  <Typography color="primary" variant="subtitle2">
                    Stats:
                  </Typography>
                  <Stack ml={4} gap={2}>
                    <Box display="flex" gap={2}>
                      <Typography color="white" variant="subtitle2">
                        Your Av:
                      </Typography>
                      <Typography color="white" variant="subtitle2">
                        {Number(av || 0).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                      <Typography color="white" variant="subtitle2">
                        Period no.
                      </Typography>
                      <Typography color="white" variant="subtitle2">
                        #{stats?.lastPeriod}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                      <Typography color="white" variant="subtitle2">
                        exp. AV in period:
                      </Typography>
                      <Typography color="white" variant="subtitle2">
                        n+1
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                      <Typography color="white" variant="subtitle2">
                        how you’re doing:
                      </Typography>
                      <Typography color="white" variant="subtitle2">
                        0%
                      </Typography>
                    </Box>
                  </Stack>
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
            <Box
              sx={{
                width: "100%",
                position: "relative",
                height: "350px"
              }}
            >
              {editMode && (
                <>
                  <Tooltip title="Close">
                    <IconButton
                      onClick={() => setEditMode(false)}
                      sx={{
                        zIndex: 1,
                        color: "white",
                        position: "absolute",
                        right: "0"
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                  <Box
                    sx={{
                      mt: "70px",
                      width: "100%"
                    }}
                  >
                    {Object.keys(state).map((slider) => (
                      <Box
                        mt={1.5}
                        gap={2}
                        display="flex"
                        key={state[slider]?.type}
                      >
                        <Box
                          sx={{
                            textAlign: "right",
                            minWidth: "120px"
                          }}
                        >
                          <Typography variant="subtitle2" color="white">
                            {state[slider]?.title}
                          </Typography>
                        </Box>
                        <Slider
                          step={2}
                          sx={{
                            "& > .MuiSlider-track": {
                              ...(slider == selectedArchetype?.type && {
                                background: `${alpha(
                                  theme.palette.primary.main,
                                  1
                                )} !important`
                              })
                            },

                            width: "100%",
                            height: "20px",
                            ".MuiSlider-thumb": {
                              display: "none"
                            }
                          }}
                          min={0}
                          max={100}
                          value={state[slider].value}
                          onChange={handleChange(slider)}
                        />
                        <Box
                          sx={{
                            textAlign: "left",
                            minWidth: "40px"
                          }}
                        >
                          <Typography variant="subtitle2" color="white">
                            {state[slider].value}%
                          </Typography>
                        </Box>
                      </Box>
                    ))}

                    {showNotification && (
                      <Box
                        sx={{
                          textAlign: "center",
                          minWidth: "120px",
                          mt: 2
                        }}
                      >
                        <Typography variant="subtitle2" color="error">
                          {`Remaining value to allocate: ${remainingValue}%`}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      gap: 4,
                      mt: 2
                    }}
                  >
                    <Button
                      onClick={() => updateArchetype()}
                      color="offWhite"
                      variant="outlined"
                      size="medium"
                    >
                      {actionName}
                    </Button>
                  </Box>
                </>
              )}
              {!editMode && (
                <>
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => setEditMode(true)}
                      sx={{
                        zIndex: 1,
                        color: "white",
                        position: "absolute",
                        right: "0"
                      }}
                    >
                      <SvgIcon component={EditIcon} />
                    </IconButton>
                  </Tooltip>

                  <ArchetypePieChart archetype={archetype} />
                </>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

const Archetypes = () => {
  const {
    archetype,
    stats,
    isLoading: isLoadingArchetype,
    isFetching: isFetchingArchetype
  } = useGetArchetypeAndStatsQuery(null, {
    selectFromResult: ({ data, isLoading, isFetching }) => ({
      isLoading,
      isFetching,
      archetype: data?.archetype,
      stats: data?.stats
    })
  });
  const [selected, setSelected] = useState(null);
  const archetypeData = useMemo(() => {
    if (archetype?.archetype === selected?.type) {
      return archetype;
    }
    return {
      archetype: HubArchetype.NONE,
      size: 0,
      reputation: 0,
      conviction: 0,
      performance: 0,
      growth: 0
    };
  }, [archetype, selected]);

  console.log("archetypeData: ", archetypeData, archetype, selected);

  return (
    <Container maxWidth="md" sx={{ py: "20px" }}>
      {selected && (
        <YourArchetype
          archetype={archetypeData}
          stats={stats}
          unselect={() => setSelected(null)}
          selectedArchetype={selected}
        ></YourArchetype>
      )}
      {!selected && (
        <ChooseYourArchetype
          archetype={archetype}
          setSelected={setSelected}
        ></ChooseYourArchetype>
      )}
    </Container>
  );
};

export default Archetypes;
