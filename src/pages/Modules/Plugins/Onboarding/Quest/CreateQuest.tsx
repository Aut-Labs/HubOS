/* eslint-disable max-len */
import {
  useCreateQuestMutation,
  useGetAllOnboardingQuestsQuery,
  useUpdateQuestMutation
} from "@api/onboarding.api";
import { PluginDefinition } from "@aut-labs/sdk";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import { FormHelperText } from "@components/Fields";
import { StepperButton } from "@components/Stepper";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Stack,
  Link as BtnLink,
  Typography,
  styled,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery
} from "@mui/material";
import { CommunityData, allRoles } from "@store/Community/community.reducer";
import { AutSelectField } from "@theme/field-select-styles";
import { memo, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams
} from "react-router-dom";
import { RequiredQueryParams } from "@api/RequiredQueryParams";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { autUrls } from "@api/environment";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { getMemberPhases } from "@utils/beta-phases";
import "./ScrollbarStyles.scss";

import {
  usePickerLayout,
  PickersLayoutRoot,
  pickersLayoutClasses,
  PickersLayoutContentWrapper
} from "@mui/x-date-pickers/PickersLayout";
import { PickersActionBarProps } from "@mui/x-date-pickers";
import theme from "@theme/theme";
import addMinutes from "date-fns/addMinutes";
import addDays from "date-fns/addDays";
import format from "date-fns/format";

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

const Strong = styled("strong")(({ theme }) => ({
  // color: theme.palette.primary.main
}));

interface PluginParams {
  plugin: PluginDefinition;
}

function getQuestDates(startDate: Date) {
  const { phaseOneStartDate, phaseTwoEndDate } = getMemberPhases(startDate);

  const questStartDateOffset = 10 * 60 * 1000; // 10 hours in milliseconds

  const questStartDate = new Date(phaseOneStartDate.getTime());
  const questEndDate = phaseTwoEndDate;

  return {
    questStartDate,
    questEndDate
  };
}

function questDurationInDays(startDate: Date, endDate: Date) {
  const durationInMilliseconds: number =
    endDate.getTime() - startDate.getTime();
  const durationInDays: number = durationInMilliseconds / (24 * 60 * 60 * 1000);

  return Number(durationInDays.toFixed(2));
}

function questDurationInHours(startDate: Date, endDate: Date) {
  const durationInMilliseconds: number =
    endDate.getTime() - startDate.getTime();
  const durationInHours: number = durationInMilliseconds / (60 * 60 * 1000);

  return Math.floor(durationInHours);
}

const CreateQuest = ({ plugin }: PluginParams) => {
  const [roles] = useState(useSelector(allRoles));
  const [searchParams] = useSearchParams();
  const [initialized, setInitialized] = useState(false);
  const location = useLocation();
  const communityData = useSelector(CommunityData);
  const navigate = useNavigate();
  const urls = autUrls();

  const {
    control,
    handleSubmit,
    reset: resetForm,
    formState,
    watch
  } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      // description: "",
      // durationInDays: questDurationInDays(),
      // startDate: addMinutes(new Date(), 40), // @TO-USE for testing - 30 minutes
      startDate: addMinutes(new Date(), 5),
      role: null
    }
  });

  const values = watch();

  const { quests, quest } = useGetAllOnboardingQuestsQuery(
    plugin.pluginAddress,
    {
      selectFromResult: ({ data }) => ({
        quests: data || [],
        quest: (data || []).find(
          (q) => q.questId === +searchParams.get(RequiredQueryParams.QuestId)
        )
      })
    }
  );

  const questDates = useMemo(() => {
    // const { questEndDate, questStartDate } = getQuestDates(values?.startDate);
    const startDate = values?.startDate ? values?.startDate : new Date();
    const endDate = addDays(startDate, 3);
    return {
      startDate,
      endDate,
      durationInHours: questDurationInHours(startDate, endDate),
      durationInDays: questDurationInDays(startDate, endDate)
    };
  }, [values?.startDate]);

  const [
    createQuest,
    {
      error: createError,
      isError: createIsError,
      data: newQuest,
      isSuccess: createIsSuccess,
      isLoading: createIsLoading,
      reset: createReset
    }
  ] = useCreateQuestMutation();

  const [
    updateQuest,
    {
      error: updateError,
      isError: updateIsError,
      data: updatedQuest,
      isSuccess: updateIsSuccess,
      isLoading: updateIsLoading,
      reset: updateReset
    }
  ] = useUpdateQuestMutation();

  const onSubmit = async () => {
    const numberOfDaysToAdd = 2;
    const startDate = Math.floor(
      addDays(values.startDate, numberOfDaysToAdd).getTime() / 1000
    );
    if (quest?.questId) {
      updateQuest({
        ...quest,
        pluginAddress: plugin.pluginAddress,
        role: values.role,
        // durationInDays: 2,
        durationInDays: questDates.durationInHours,
        startDate,
        metadata: {
          name:
            values.title || roles.find((r) => r.id === values.role)?.roleName,
          description: "",
          properties: {}
        }
      });
    } else {
      createQuest({
        pluginAddress: plugin.pluginAddress,
        role: values.role,
        // durationInDays: 2,
        durationInDays: questDates.durationInHours,
        startDate,
        metadata: {
          name:
            values.title || roles.find((r) => r.id === values.role)?.roleName,
          description: "",
          properties: {}
        }
      });
    }
  };

  useEffect(() => {
    if (!initialized && quest) {
      resetForm({
        title: quest.metadata.name,
        startDate: new Date(quest.startDate),
        role: quest.role
      });
      setInitialized(true);
    }
  }, [initialized, quest]);

  const path = useMemo(() => {
    if (updateIsSuccess) {
      return location.pathname.replaceAll(
        "/create",
        `/${updatedQuest.questId}`
      );
    }
    return location.pathname.replaceAll("/create", `/${newQuest?.questId}`);
  }, [location.pathname, updateIsSuccess, createIsSuccess]);

  useEffect(() => {
    if (createIsSuccess) {
      navigate({
        pathname: `/${communityData?.name}/modules/Task`,
        search: new URLSearchParams({
          onboardingQuestAddress: plugin.pluginAddress,
          returnUrlLinkName: "Back to quest",
          returnUrl: path,
          questId: (newQuest?.questId || quest.questId).toString()
        }).toString()
      });
    }
    if (updateIsSuccess) {
      navigate(path);
    }
  }, [createIsSuccess, updateIsSuccess, communityData]);

  const isDisabled = useMemo(() => {
    return !formState.isValid || Object.keys(formState.dirtyFields).length == 0;
  }, [formState]);

  return (
    <Container
      sx={{ py: "20px", display: "flex", flexDirection: "column" }}
      maxWidth="lg"
      component="form"
      autoComplete="off"
      onSubmit={handleSubmit(onSubmit)}
    >
      <ErrorDialog
        handleClose={() => createReset()}
        open={createIsError}
        message={createError}
      />
      <ErrorDialog
        handleClose={() => updateReset()}
        open={updateIsError}
        message={updateError}
      />
      <LoadingDialog open={createIsLoading} message="Creating quest..." />
      <LoadingDialog open={updateIsLoading} message="Updating quest..." />

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
          {quest?.questId && (
            <Button
              startIcon={<ArrowBackIcon />}
              color="offWhite"
              sx={{
                position: {
                  sm: "absolute"
                },
                left: {
                  sm: "0"
                }
              }}
              to={{
                pathname: searchParams.get("returnUrl"),
                search: searchParams.toString()
              }}
              component={Link}
            >
              {searchParams.get("returnUrlLinkName") || "Back"}
            </Button>
          )}

          <Typography textAlign="center" color="white" variant="h3">
            {quest?.questId
              ? "Editing onboarding quest"
              : "Create a new Onboarding Quest"}
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
          name="role"
          control={control}
          rules={{
            validate: {
              selected: (v) => !!v
            }
          }}
          render={({ field: { name, value, onChange } }) => {
            return (
              <AutSelectField
                variant="standard"
                color="offWhite"
                renderValue={(selected) => {
                  if (!selected) {
                    return "Role" as any;
                  }
                  const role = roles.find((t) => t.id === selected);
                  return role?.roleName || selected;
                }}
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
                    Select the Role you want to onboard with this Quest
                  </FormHelperText>
                }
              >
                {roles.map((type) => {
                  const questByRole = quests.some((q) => q.role === type.id);
                  return (
                    <MenuItem
                      disabled={!!questByRole}
                      key={`role-${type.id}`}
                      value={type.id}
                    >
                      {type.roleName}
                      {!!questByRole && <> (Quest already created) </>}
                    </MenuItem>
                  );
                })}
              </AutSelectField>
            );
          }}
        />

        {/* @ts-ignore */}
        {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="sw-form-field">
            <div className="sw-form-field-content">
              <CalendarPicker
                control={control}
                name="startDate"
                minDate={new Date()}
              />
            </div>
          </div>
        </LocalizationProvider> */}

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

        {/* <Controller
              name="durationInDays"
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { name, value, onChange } }) => {
                return (
                  <AutTextField
                    name={name}
                    disabled
                    value={value || ""}
                    type="number"
                    onChange={onChange}
                    variant="standard"
                    color="offWhite"
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment
                          sx={{
                            ".MuiTypography-root": {
                              color: "white"
                            }
                          }}
                          position="end"
                        >
                          days
                        </InputAdornment>
                      )
                    }}
                    placeholder="Duration"
                    helperText={
                      <FormHelperText
                        errorTypes={errorTypes}
                        value={value}
                        name={name}
                        errors={formState.errors}
                      >
                        <Tooltip title="During the closed beta, the duration of each onboarding quest will be Xdays and begin on the Xth, until then you can invite your community to allowlist for quests you have activated. During the onboarding period, every community will be listed on the Nova Leaderboard where the number of successful onboardings will correspond to their ranking. Happy Onboarding!">
                          <HelpOutlineIcon
                            // color="white"
                            sx={{
                              color: "white",
                              width: {
                                sm: "16px"
                              }
                            }}
                          />
                        </Tooltip>
                      </FormHelperText>
                    }
                  />
                );
              }}
            /> */}

        {/* <Controller
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
                placeholder="Describe the onboarding quest to your community"
                helperText={
                  <FormHelperText
                    errorTypes={errorTypes}
                    value={value}
                    name={name}
                    errors={formState.errors}
                  />
                }
              />
            );
          }}
        /> */}

        <Typography color="white" variant="body">
          During the closed beta, the duration of each onboarding quest will be
          <Strong> {questDates.durationInDays} days</Strong>, starting on{" "}
          <Strong>
            {format(questDates.startDate, "EEE MMM dd yyyy 'at' h:mm a")}
          </Strong>
          , until then you can invite new community members to take the quests
          you launched.
          <br />
          During the onboarding period, every community will be listed on the{" "}
          <BtnLink
            component="a"
            type="button"
            color="primary"
            variant="body"
            href={urls.leaderboard}
            target="_blank"
          >
            Nova Leaderboard
          </BtnLink>{" "}
          - their ranking will be determined by the amount of members onboarded.
          Have fun, and Onboard (ir)responsibly 😎
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end"
          }}
        >
          <StepperButton
            label={
              quest?.questId
                ? "Edit Onboarding Quest"
                : "Create Onboarding Quest"
            }
            disabled={isDisabled}
          />
        </Box>
      </Stack>
    </Container>
  );
};

export default memo(CreateQuest);
