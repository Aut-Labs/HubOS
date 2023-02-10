import { useCreateQuestMutation } from "@api/onboarding-quest.api";
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
  Typography,
  styled
} from "@mui/material";
import { allRoles } from "@store/Community/community.reducer";
import { AutSelectField } from "@theme/field-select-styles";
import { AutTextField } from "@theme/field-text-styles";
import { pxToRem } from "@utils/text-size";
import { memo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const errorTypes = {
  maxWords: `Words cannot be more than 3`,
  maxNameChars: `Characters cannot be more than 24`,
  maxLength: `Characters cannot be more than 280`
};

const StepWrapper = styled("form")({
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  height: "100%"
});

interface PluginParams {
  plugin: PluginDefinition;
}

const QuestSuccess = ({ pluginId }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: pxToRem(20), flexGrow: 1 }}>
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
                `${location.pathname.replaceAll("/new/create", "")}/${pluginId}`
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
      durationInDays: null,
      role: null
    }
  });

  const [createQuest, { error, isError, isSuccess, data: quest, isLoading }] =
    useCreateQuestMutation();

  const onSubmit = async () => {
    const values = getValues();
    createQuest({
      pluginAddress: plugin.pluginAddress,
      role: values.role,
      durationInDays: values.durationInDays,
      metadata: {
        name: values.title,
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
        <StepWrapper autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <ErrorDialog open={isError} message={error} />
          <LoadingDialog open={isLoading} message="" />
          <Typography
            sx={{
              my: 8
            }}
            textAlign="center"
            color="white"
            variant="h3"
          >
            Creating onboarding quest
          </Typography>
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
                  autoFocus
                  sx={{
                    width: {
                      xs: "100%",
                      sm: "400px",
                      xxl: "800px"
                    },
                    mb: pxToRem(45)
                  }}
                  renderValue={(selected) => {
                    if (!selected) {
                      return "Select role" as any;
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
                  {roles.map((type) => (
                    <MenuItem key={`role-${type.id}`} value={type.id}>
                      {type.roleName}
                    </MenuItem>
                  ))}
                </AutSelectField>
              );
            }}
          />
          <Controller
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
                  sx={{
                    width: {
                      xs: "100%",
                      sm: "400px",
                      xxl: "800px"
                    },
                    mb: pxToRem(45)
                  }}
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
                  sx={{
                    width: {
                      xs: "100%",
                      sm: "400px",
                      xxl: "800px"
                    },
                    mb: pxToRem(45)
                  }}
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
                  sx={{
                    width: {
                      xs: "100%",
                      sm: "400px",
                      xxl: "800px"
                    }
                  }}
                  placeholder="Duration"
                />
              );
            }}
          />

          <StepperButton label="Create Quest" disabled={!formState.isValid} />
        </StepWrapper>
      )}
    </>
  );
};

export default memo(CreateQuest);
