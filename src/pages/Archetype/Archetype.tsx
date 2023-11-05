import * as React from "react";
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
  Tooltip
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArchetypePieChart, {
  archetypeChartValues
} from "../Dashboard/ArchetypePieChart";
import { ReactComponent as EditIcon } from "@assets/actions/edit.svg";
import CloseIcon from "@mui/icons-material/Close";
import {
  useGetArchetypeAndStatsQuery,
  useSetArchetypeMutation
} from "@api/community.api";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import { NovaArchetypeParameters } from "@aut-labs/sdk/dist/models/dao";

const GridCard = styled(Card)(({ theme }) => {
  return {
    minHeight: "365px",
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
  bottom: isHovered ? "110px" : "80px",
  textAlign: "center",
  textTransform: "uppercase",
  zIndex: 1,
  transition: theme.transitions.create("bottom")
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

const ArchetypeCard = ({ title, description, logo, type, onSelect }) => {
  const [isHovered, setIsHovered] = React.useState(false);
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
        bgcolor: "nightBlack.main",
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
          Choose Archetype
        </ChooseArchetypeBtn>
      </CardContent>
    </GridCard>
  );
};

const ChooseYourArchetype = ({ setSelected, archetype }) => {
  const [state, setState] = React.useState(archetypeChartValues(archetype));
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
          The archetype represents the KPI, the driver of your community. Set up
          your community values, deliver, and thrive. The better you perform,
          the more your community credibility will grow. Read more about
          Archetypes
        </Typography>
      </Box>
      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* Row 1 */}
        <Grid item xs={12} sm={6} md={4}>
          <ArchetypeCard onSelect={setSelected} {...state.size} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ArchetypeCard onSelect={setSelected} {...state.growth} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ArchetypeCard onSelect={setSelected} {...state.performance} />
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
          <ArchetypeCard onSelect={setSelected} {...state.reputation} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ArchetypeCard onSelect={setSelected} {...state.conviction} />
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

const YourArchetype = ({ selectedArchetype, unselect, archetype }) => {
  const [editMode, setEditMode] = React.useState(
    selectedArchetype?.type != archetype?.archetype
  );
  const [state, setState] = React.useState(archetypeChartValues(archetype));

  const handleChange = (slider) => (_, newValue) => {
    const diff = state[slider].value - newValue;

    const numOtherSliders = Object.keys(state).length - 1;
    const changeForOtherSliders = Math.floor(diff / numOtherSliders);

    const newState = { ...state };
    newState[slider].value = newValue;

    let extraDistribution = 0;

    const otherSliders = Object.keys(state).filter((key) => key !== slider);

    otherSliders.forEach((key) => {
      const adjustedValue = newState[key].value + changeForOtherSliders;
      if (adjustedValue < 0) {
        extraDistribution += newState[key].value;
        newState[key].value = 0;
      } else if (adjustedValue > 100) {
        extraDistribution -= 100 - newState[key].value;
        newState[key].value = 100;
      } else {
        newState[key].value = Math.floor(adjustedValue);
      }
    });

    // Re-distribute the extra value
    if (extraDistribution !== 0) {
      const extraChangeForOthers = Math.floor(
        extraDistribution / numOtherSliders
      );
      otherSliders.forEach((key) => {
        const adjustedValue = newState[key].value + extraChangeForOthers;
        newState[key].value =
          adjustedValue < 0
            ? 0
            : adjustedValue > 100
            ? 100
            : Math.floor(adjustedValue);
      });
    }

    // Check total slider value and adjust if it's less than 100
    const totalSliderValue = Object.keys(newState).reduce(
      (sum, key) => sum + newState[key].value,
      0
    );

    if (totalSliderValue < 100) {
      const sliderWithSmallestValue = otherSliders.reduce((a, b) =>
        newState[a].value < newState[b].value ? a : b
      );
      newState[sliderWithSmallestValue].value += 100 - totalSliderValue;
    }

    setState(newState);
  };

  const [setArchetype, { error, isError, isLoading, reset }] =
    useSetArchetypeMutation();

  const updateArchetype = () => {
    const updatedArchetype: NovaArchetypeParameters = {
      archetype: selectedArchetype?.type,
      size: state.size.value,
      growth: state.growth.value,
      conviction: state.conviction.value,
      performance: state.performance.value,
      reputation: state.reputation.value
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

            <Typography textAlign="center" color="white" variant="h3">
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
          The archetype represents the KPI, the driver of your community.
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

              <Stack mt={4} gap={2}>
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
                        1.0
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                      <Typography color="white" variant="subtitle2">
                        Period no.
                      </Typography>
                      <Typography color="white" variant="subtitle2">
                        #1
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

              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 4,
                  mt: 4
                }}
              >
                <Button color="offWhite" variant="outlined" size="medium">
                  Change
                </Button>
                {/* <Button color="offWhite" variant="outlined" size="medium">
                  Edit
                </Button> */}
              </Box>
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
                            width: "100%",
                            height: "20px",
                            ".MuiSlider-thumb": {
                              display: "none"
                            }
                          }}
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
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      gap: 4,
                      mt: 4
                    }}
                  >
                    <Button
                      onClick={() => updateArchetype()}
                      color="offWhite"
                      variant="outlined"
                      size="medium"
                    >
                      Confirm selection
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
    isLoading: isLoadingArchetype,
    isFetching: isFetchingArchetype
  } = useGetArchetypeAndStatsQuery(null, {
    selectFromResult: ({ data, isLoading, isFetching }) => ({
      isLoading,
      isFetching,
      archetype: data
    })
  });
  const [selected, setSelected] = React.useState(null);
  return (
    <Container maxWidth="lg" sx={{ py: "20px" }}>
      {selected && (
        <YourArchetype
          archetype={archetype}
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
