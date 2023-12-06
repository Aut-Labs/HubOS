import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Stack,
  styled,
  Typography,
  useMediaQuery
} from "@mui/material";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useAppDispatch } from "@store/store.model";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import AdapterDateFns from "@mui/lab/AdapterDateFns";
// import LocalizationProvider from "@mui/lab/LocalizationProvider";

import { AutTextField } from "@theme/field-text-styles";
import { FormHelperText, SwCalendarPicker } from "@components/Fields";
import { pxToRem } from "@utils/text-size";
import { countWords, generateTimeSlots } from "@utils/helpers";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  ActivityGroupCallData,
  activityUpdateGroupCallData
} from "@store/Activity/call.reducer";
import { AutHeader } from "@components/AutHeader";
import { AutButton } from "@components/buttons";
import { StepperButton } from "@components/Stepper";
import { updateGatheringData } from "@store/Bot/gathering.reducer";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { AutSelectField } from "@theme/field-select-styles";

import {
  usePickerLayout,
  PickersLayoutRoot,
  pickersLayoutClasses,
  PickersLayoutContentWrapper
} from "@mui/x-date-pickers/PickersLayout";
import { PickersActionBarProps } from "@mui/x-date-pickers";
import theme from "@theme/theme";
import { CommunityData } from "@store/Community/community.reducer";
import {
  useCreateGatheringMutation,
  useGetVoiceChannelsQuery
} from "@api/discord.api";
import axios from "axios";
import AutLoading from "@components/AutLoading";
import LoadingProgressBar from "@components/LoadingProgressBar";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import ErrorDialog from "@components/Dialog/ErrorPopup";

function CustomLayout(props) {
  const { toolbar, tabs, content, actionBar } = usePickerLayout(props);
  return (
    <PickersLayoutRoot className={pickersLayoutClasses.root} ownerState={props}>
      {toolbar}
      <PickersLayoutContentWrapper
        className={pickersLayoutClasses.contentWrapper}
        sx={{
          padding: {
            sm: "10px",
            xl: "20px"
          }
        }}
      >
        {tabs}
        {content}
      </PickersLayoutContentWrapper>
      {actionBar}
    </PickersLayoutRoot>
  );
}

function ActionList(props: PickersActionBarProps) {
  const { onAccept, className } = props;
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  return isDesktop ? (
    <Box sx={{ display: "flex", width: "100%", marginBottom: "10px" }}>
      <StepperButton
        label="Confirm"
        onClick={(event) => {
          event.stopPropagation();
          onAccept();
        }}
        sx={{ width: "250px", margin: "0 auto" }}
      />
    </Box>
  ) : (
    <List className={className}>
      <ListItem key={"Confirm"} disablePadding>
        <ListItemButton
          onClick={onAccept}
          sx={{ textAlign: "center", textTransform: "uppercase" }}
        >
          <ListItemText primary={"Confirm"} />
        </ListItemButton>
      </ListItem>
    </List>
  );
}

const GatheringInitialStep = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { startDate, startTime } = useSelector(ActivityGroupCallData);
  const communityData = useSelector(CommunityData);
  const [guildId, setGuildId] = useState<string | null>(null);

  const [
    createGathering,
    { error, isLoading: creatingGatheirng, isError, reset, isSuccess }
  ] = useCreateGatheringMutation();

  useEffect(() => {
    const fetchGuild = async () => {
      const discordLink = communityData?.properties.socials.find(
        (l) => l.type === "discord"
      ).link;
      const serverCode = discordLink.match(/discord\.gg\/(.+)/i)[1];
      const serverIdResponse = await axios.get(
        `https://discord.com/api/invites/${serverCode}`
      );
      const guildId = serverIdResponse.data.guild.id;
      // const guild = "1133407677091942480";
      setTimeout(() => {
        setGuildId(guildId);
      }, 1000);
    };
    fetchGuild();
  }, [communityData]);

  const {
    data: voiceChannels,
    isLoading,
    isFetching,
    refetch
  } = useGetVoiceChannelsQuery(
    { guildId },
    {
      // refetchOnMountOrArgChange: true,
      skip: guildId === null
    }
  );

  const { control, handleSubmit, watch, formState } = useForm({
    mode: "onChange",
    defaultValues: {
      title: null,
      description: null,
      startDate: null,
      duration: null,
      role: null,
      allCanAttend: false,
      channelId: null,
      weight: null
    }
  });
  const values = watch();

  const onSubmit = async () => {
    await createGathering({ guildId, ...values });
  };

  useEffect(() => {
    if (isSuccess) {
      navigate(`/${communityData.name}/bot/gathering/success`);
    }
  }, [isSuccess]);

  return (
    <Container
      sx={{ py: "20px", display: "flex", flexDirection: "column" }}
      component="form"
      // maxWidth="lg"
      // autoComplete="off"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* <ErrorDialog
        handleClose={() => createReset()}
        open={createIsError}
        message={createError}
      />
      <ErrorDialog
        handleClose={() => updateReset()}
        open={updateIsError}
        message={updateError}
      />
      <LoadingDialog open={updateIsLoading} message="Updating quest..." /> */}
      <ErrorDialog
        handleClose={() => reset()}
        open={isError}
        message={"Failed to create gathering"}
      />
      <LoadingDialog open={creatingGatheirng} message="Creating gathering..." />

      <LoadingProgressBar isLoading={isFetching} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          mb: 4,
          position: "relative",
          mx: "auto",
          width: "100%"
        }}
      >
        <Stack alignItems="center" justifyContent="center">
          <Typography textAlign="center" color="white" variant="h3">
            Create a Gathering
          </Typography>
        </Stack>
      </Box>

      <Stack
        direction="column"
        gap={4}
        sx={{
          margin: "0 auto",
          width: {
            xs: "100%",
            sm: "600px",
            xxl: "800px"
          }
        }}
      >
        <Controller
          name="title"
          control={control}
          rules={{
            required: true,
            validate: {
              maxWords: (v: string) => countWords(v) <= 6
            }
          }}
          render={({ field: { name, value, onChange } }) => {
            return (
              <AutTextField
                variant="standard"
                color="offWhite"
                required
                autoFocus
                name={name}
                value={value || ""}
                onChange={onChange}
                placeholder="Title"
                helperText={
                  <FormHelperText
                    // errorTypes={errorTypes}
                    value={value}
                    name={name}
                    errors={formState.errors}
                  >
                    <Typography color="white" variant="caption">
                      {6 - countWords(value)} Words left
                    </Typography>
                  </FormHelperText>
                }
              />
            );
          }}
        />

        <Controller
          name="description"
          control={control}
          rules={{
            required: true,
            maxLength: 257
          }}
          render={({ field: { name, value, onChange } }) => {
            return (
              <AutTextField
                name={name}
                value={value || ""}
                onChange={onChange}
                variant="outlined"
                color="offWhite"
                required
                multiline
                rows={5}
                placeholder="Describe the gathering."
                helperText={
                  <FormHelperText
                    // errorTypes={errorTypes}
                    value={value}
                    name={name}
                    errors={formState.errors}
                  >
                    <Typography color="white" variant="caption">
                      {257 - (value?.length || 0)} of 257 characters left
                    </Typography>
                  </FormHelperText>
                }
              />
            );
          }}
        />
        <Controller
          name="startDate"
          control={control}
          rules={{
            required: true
          }}
          render={({ field: { name, value, onChange } }) => {
            return (
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DemoContainer components={["DateTimePicker"]}>
                  <DateTimePicker
                    value={value || ""}
                    disablePast
                    closeOnSelect={false}
                    desktopModeMediaQuery={theme.breakpoints.up("sm")}
                    onAccept={(newValue) => onChange(newValue)}
                    label="Start Date"
                    slots={{
                      layout: CustomLayout,
                      actionBar: ActionList
                    }}
                    slotProps={{
                      popper: {
                        sx: {
                          ".MuiDateCalendar-root": {
                            borderRight: "1px white solid",
                            paddingRight: "10px"
                          },
                          ".MuiDivider-root": {
                            width: 0
                          },
                          ".MuiMultiSectionDigitalClock-root": {
                            ul: {
                              borderLeft: 0
                            }
                          },
                          "div.MuiMultiSectionDigitalClock-root": {
                            marginLeft: "30px",
                            ul: {
                              borderLeft: 0,
                              "&:last-of-type": {
                                display: "flex",
                                flexDirection: "column"
                              }
                            }
                          },
                          "MuiPickersCalendarHeader-label": {
                            fontSize: "18px"
                          }
                        }
                      },
                      desktopPaper: {
                        sx: {
                          svg: { color: theme.palette.offWhite.main },
                          span: { color: theme.palette.offWhite.main },
                          backgroundColor: theme.palette.background.default,
                          color: theme.palette.offWhite.main,
                          ".MuiPickersLayout-root": {
                            display: "flex",
                            flexDirection: "column"
                          },
                          ".MuiPickersCalendarHeader-label": {
                            fontSize: "18px"
                          }
                        }
                      },
                      mobilePaper: {
                        sx: {
                          svg: { color: theme.palette.offWhite.main },
                          span: { color: theme.palette.offWhite.main },
                          backgroundColor: theme.palette.background.default,
                          color: theme.palette.offWhite.main,
                          ".MuiPickersToolbarText-root.Mui-selected": {
                            color: theme.palette.primary.main
                          }
                        }
                      },
                      textField: {
                        sx: {
                          ".MuiFormLabel-root": {
                            color: theme.palette.offWhite.main
                          }
                        }
                      },
                      openPickerButton: {
                        sx: {
                          color: theme.palette.offWhite.main
                        }
                      },
                      day: {
                        sx: {
                          color: theme.palette.offWhite.main,
                          "&.MuiPickersDay-today": {
                            borderColor: theme.palette.offWhite.main
                          }
                        }
                      },
                      layout: {
                        sx: {
                          display: "flex",
                          flexDirection: "column"
                        }
                      }
                    }}
                  />
                </DemoContainer>
              </LocalizationProvider>
            );
          }}
        />
        <Controller
          name="duration"
          control={control}
          rules={{
            required: true,
            validate: {
              selected: (v) => !!v
            }
          }}
          render={({ field: { name, value, onChange } }) => {
            return (
              <AutSelectField
                variant="standard"
                color="offWhite"
                // renderValue={(selected) => {
                //   if (!selected) {
                //     return "Role" as any;
                //   }
                //   const role = roles.find((t) => t.id === selected);
                //   return role?.roleName || selected;
                // }}
                name={name}
                value={value || ""}
                displayEmpty
                required
                onChange={onChange}
                helperText={
                  <FormHelperText
                    value={value}
                    name={name}
                    errors={formState.errors}
                  >
                    Select the gathering duration
                  </FormHelperText>
                }
              >
                <MenuItem key={`duration-2`} value={2}>
                  2
                </MenuItem>
                <MenuItem key={`duration-15`} value={15}>
                  15
                </MenuItem>
                <MenuItem key={`duration-30`} value={30}>
                  30
                </MenuItem>
                <MenuItem key={`duration-45`} value={45}>
                  45
                </MenuItem>
                <MenuItem key={`duration-60`} value={60}>
                  60
                </MenuItem>
              </AutSelectField>
            );
          }}
        />

        <Controller
          name="role"
          control={control}
          rules={{
            required: !values.allCanAttend,
            validate: {
              selected: (v) => !!v
            }
          }}
          render={({ field: { name, value, onChange } }) => {
            return (
              <AutSelectField
                variant="standard"
                color="offWhite"
                // renderValue={(selected) => {
                //   if (!selected) {
                //     return "Role" as any;
                //   }
                //   const role = roles.find((t) => t.id === selected);
                //   return role?.roleName || selected;
                // }}
                name={name}
                value={value || ""}
                displayEmpty
                required
                onChange={onChange}
                helperText={
                  <FormHelperText
                    value={value}
                    name={name}
                    errors={formState.errors}
                  >
                    Select role
                  </FormHelperText>
                }
              >
                {communityData.properties.rolesSets[0].roles.map((role) => {
                  return (
                    <MenuItem
                      key={`duration-${role.roleName}`}
                      value={role.roleName}
                    >
                      {role.roleName}
                    </MenuItem>
                  );
                })}
              </AutSelectField>
            );
          }}
        />
        <Controller
          name="allCanAttend"
          rules={{
            required: !values.role
          }}
          control={control}
          render={({ field: { name, value, onChange } }) => {
            return (
              <FormControlLabel
                label="All can attend"
                sx={{
                  color: "white"
                }}
                control={
                  <Checkbox
                    name={name}
                    value={value}
                    checked={!!value}
                    onChange={onChange}
                    sx={{
                      ".MuiSvgIcon-root": {
                        color: !value ? "offWhite.main" : "primary.main"
                      }
                    }}
                  />
                }
              />
            );
          }}
        />

        <Controller
          name="channelId"
          control={control}
          rules={{
            required: true,
            validate: {
              selected: (v) => !!v
            }
          }}
          render={({ field: { name, value, onChange } }) => {
            return (
              <AutSelectField
                variant="standard"
                color="offWhite"
                // renderValue={(selected) => {
                //   if (!selected) {
                //     return "Role" as any;
                //   }
                //   const role = roles.find((t) => t.id === selected);
                //   return role?.roleName || selected;
                // }}
                name={name}
                value={value || ""}
                displayEmpty
                required
                onChange={onChange}
                helperText={
                  <FormHelperText
                    value={value}
                    name={name}
                    errors={formState.errors}
                  >
                    Select voice channel
                  </FormHelperText>
                }
              >
                {voiceChannels &&
                  !isLoading &&
                  voiceChannels.map((channel) => {
                    return (
                      <MenuItem
                        key={`channel-${channel.id}`}
                        value={channel.id}
                      >
                        {channel.name}
                      </MenuItem>
                    );
                  })}
              </AutSelectField>
            );
          }}
        />

        <Controller
          name="weight"
          control={control}
          rules={{
            required: true,
            validate: {
              selected: (v) => !!v
            }
          }}
          render={({ field: { name, value, onChange } }) => {
            return (
              <AutSelectField
                variant="standard"
                color="offWhite"
                // renderValue={(selected) => {
                //   if (!selected) {
                //     return "Role" as any;
                //   }
                //   const role = roles.find((t) => t.id === selected);
                //   return role?.roleName || selected;
                // }}
                name={name}
                value={value || ""}
                displayEmpty
                required
                onChange={onChange}
                helperText={
                  <FormHelperText
                    value={value}
                    name={name}
                    errors={formState.errors}
                  >
                    Select the gathering weight
                  </FormHelperText>
                }
              >
                <MenuItem key={`weight-1`} value={2}>
                  1
                </MenuItem>
                <MenuItem key={`weight-2`} value={15}>
                  2
                </MenuItem>
                <MenuItem key={`weight-3`} value={30}>
                  3
                </MenuItem>
              </AutSelectField>
            );
          }}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end"
          }}
        >
          <StepperButton label={"Create "} disabled={!formState.isValid} />
        </Box>
      </Stack>
    </Container>
  );
};

export default GatheringInitialStep;
