/* eslint-disable max-len */
import {
  useCreateQuestMutation,
  useGetAllOnboardingQuestsQuery
} from "@api/onboarding.api";
import { PluginDefinition } from "@aut-labs-private/sdk";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import { FormHelperText } from "@components/Fields";
import { StepperButton } from "@components/Stepper";
import {
  Box,
  Button,
  Container,
  InputAdornment,
  MenuItem,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import { allRoles } from "@store/Community/community.reducer";
import { AutSelectField } from "@theme/field-select-styles";
import { AutTextField } from "@theme/field-text-styles";
import { pxToRem } from "@utils/text-size";
import { memo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { addDays, addMinutes, getUnixTime } from "date-fns";

import * as React from "react";
import TextField from "@mui/material/TextField";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

const errorTypes = {
  maxWords: `Words cannot be more than 3`,
  maxNameChars: `Characters cannot be more than 24`,
  maxLength: `Characters cannot be more than 280`
};

interface PluginParams {
  plugin: PluginDefinition;
}

const QuestSuccess = ({ pluginId }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="sm"
      sx={{ mt: pxToRem(20), flexGrow: 1, display: "flex" }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          my: "auto"
        }}
      >
        <Typography align="center" color="white" variant="h2" component="div">
          Success! Your Quest call has been created and deployed on the
          Blockchain 🎉
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gridGap: "20px"
          }}
        >
          <Button
            sx={{
              my: pxToRem(50)
            }}
            disabled
            type="submit"
            variant="outlined"
            size="medium"
            color="offWhite"
          >
            Add Tasks
          </Button>

          <Button
            sx={{
              my: pxToRem(50)
            }}
            onClick={() =>
              navigate(
                `${location.pathname.replaceAll("/create", "")}/${pluginId}`
              )
            }
            type="submit"
            variant="outlined"
            size="medium"
            color="offWhite"
          >
            See Quest
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

const CreateQuest = ({ plugin }: PluginParams) => {
  const [roles] = useState(useSelector(allRoles));
  const { control, handleSubmit, getValues, formState } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      durationInDays: 3,
      startDate: addMinutes(new Date(), 60),
      role: null
    }
  });

  const { quests } = useGetAllOnboardingQuestsQuery(plugin.pluginAddress, {
    selectFromResult: ({ data }) => ({
      quests: data || []
    })
  });

  const [
    createQuest,
    { error, isError, isSuccess, data: quest, isLoading, reset }
  ] = useCreateQuestMutation();

  const onSubmit = async () => {
    const values = getValues();
    createQuest({
      pluginAddress: plugin.pluginAddress,
      role: values.role,
      durationInDays: values.durationInDays,
      startDate: getUnixTime(new Date(values.startDate)) * 1000,
      metadata: {
        name: values.title || roles.find((r) => r.id === values.role)?.roleName,
        description: values.description,
        properties: {}
      }
    });
  };

  return (
    <>
      {isSuccess ? (
        <QuestSuccess pluginId={quest?.questId} />
      ) : (
        <Container
          sx={{ py: "20px", display: "flex", flexDirection: "column" }}
          maxWidth="lg"
          component="form"
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
        >
          <ErrorDialog
            handleClose={() => reset()}
            open={isError}
            message={error}
          />
          <LoadingDialog open={isLoading} message="Creating quest..." />

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
              Creating onboarding quest
            </Typography>
          </Box>
          <Stack
            direction="column"
            gap={4}
            sx={{
              margin: "0 auto",
              width: {
                xs: "100%",
                sm: "400px",
                xxl: "800px"
              }
            }}
          >
            {/* <Controller
              name="title"
              control={control}
              rules={{
                required: true,
                validate: {
                  maxNameChars: (v) => v.length <= 24
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
                        errorTypes={errorTypes}
                        value={value}
                        name={name}
                        errors={formState.errors}
                      >
                        <span>
                          {24 - (value?.length || 0)}/24 characters left
                        </span>
                      </FormHelperText>
                    }
                  />
                );
              }}
            /> */}
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
                        Select a role with which members can join
                      </FormHelperText>
                    }
                  >
                    {roles.map((type) => {
                      const questByRole = quests.some(
                        (q) => q.role === type.id
                      );
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

            <Controller
              name="startDate"
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { name, value, onChange } }) => {
                return (
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      // @ts-ignore
                      name={name}
                      value={value}
                      label="Time"
                      variant="standard"
                      onChange={onChange}
                      // @ts-ignore
                      color="offWhite"
                      // @ts-ignore
                      renderInput={(params) => (
                        <TextField
                          variant="standard"
                          color="offWhite"
                          {...params}
                        />
                      )}
                    />
                  </LocalizationProvider>
                );
              }}
            />

            <Controller
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
            />

            <Controller
              name="description"
              control={control}
              rules={{
                required: true,
                maxLength: 280
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
                      >
                        <span>
                          {280 - (value?.length || 0)}/280 characters left
                        </span>
                      </FormHelperText>
                    }
                  />
                );
              }}
            />

            <StepperButton label="Create Quest" disabled={!formState.isValid} />
          </Stack>
        </Container>
      )}
    </>
  );
};

export default memo(CreateQuest);
