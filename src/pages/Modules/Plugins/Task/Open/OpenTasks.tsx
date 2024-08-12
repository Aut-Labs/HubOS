/* eslint-disable max-len */
import { useCreateTaskMutation } from "@api/onboarding.api";
import { PluginDefinition, Task } from "@aut-labs/sdk";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import { AutDatepicker, FormHelperText } from "@components/Fields";
import { StepperButton } from "@components/Stepper";
import {
  Box,
  Button,
  Checkbox,
  Grid,
  MenuItem,
  Slider,
  Stack,
  Typography
} from "@mui/material";
import { AutSelectField } from "@theme/field-select-styles";
import { AutTextField } from "@theme/field-text-styles";
import { memo, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { dateToUnix } from "@utils/date-format";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { RequiredQueryParams } from "@api/RequiredQueryParams";
import { countWords } from "@utils/helpers";
import { CommunityData, allRoles } from "@store/Community/community.reducer";
import { useSelector } from "react-redux";

import { FormContainer } from "../Shared/FormContainer";

const errorTypes = {
  maxWords: `Words cannot be more than 6`,
  maxNameChars: `Characters cannot be more than 24`,
  maxLength: `Characters cannot be more than 257`
};

const AttachmentTypes = [
  {
    value: "url",
    label: "URL"
  },
  {
    value: "text",
    label: "Document"
  },
  {
    value: "image",
    label: "Image"
  }
];
interface PluginParams {
  plugin: PluginDefinition;
}

const OpenTasks = ({ plugin }: PluginParams) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roles = useSelector(allRoles);
  const communityData = useSelector(CommunityData);
  const { control, handleSubmit, getValues, formState, watch } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      startDate: new Date(),
      endDate: null,
      description: "",
      attachmentType: "",
      attachmentRequired: false,
      textRequired: false,
      weight: 0
    }
  });

  const values = watch();

  const [createTask, { error, isError, isSuccess, data, isLoading, reset }] =
    useCreateTaskMutation();

  const onSubmit = async () => {
    const values = getValues();
    createTask({
      novaAddress: communityData.properties.address,
      pluginTokenId: plugin.tokenId,
      pluginAddress: plugin.pluginAddress,
      task: {
        role: 1,
        weight: values.weight,
        metadata: {
          name: values.title,
          description: values.description,
          properties: {
            attachmentRequired: values.attachmentRequired,
            textRequired: values.textRequired,
            attachmentType: values.attachmentType
          }
        },
        startDate: dateToUnix(values.startDate),
        endDate: dateToUnix(values.endDate)
      } as unknown as Task
    });
  };

  useEffect(() => {
    if (isSuccess) {
      navigate({
        pathname: `/${communityData?.name}/tasks`
      });
    }
  }, [isSuccess, communityData]);

  const selectedRole = useMemo(() => {
    return roles.find(
      (r) => r.id === +searchParams.get(RequiredQueryParams.QuestId)
    );
  }, [roles, searchParams]);

  return (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      <ErrorDialog handleClose={() => reset()} open={isError} message={error} />
      <LoadingDialog open={isLoading} message="Creating task..." />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          flex: 1,
          mb: 4,
          mx: "auto",
          width: "100%"
        }}
      >
        <Stack alignItems="center" justifyContent="center">
          <Button
            startIcon={<ArrowBackIosNewIcon />}
            color="offWhite"
            sx={{
              position: {
                sm: "absolute"
              },
              left: {
                sm: "0"
              }
            }}
            to={`/${communityData?.name}/modules/Task`}
            component={Link}
          >
            {/* {searchParams.get("returnUrlLinkName") || "Back"} */}
            <Typography color="white" variant="body">
              Back
            </Typography>
          </Button>
          <Typography textAlign="center" color="white" variant="h3">
            Open Task for {selectedRole?.roleName}
          </Typography>
        </Stack>
        <Typography
          sx={{
            width: {
              xs: "100%",
              sm: "700px",
              xxl: "1000px"
            }
          }}
          mt={2}
          mx="auto"
          textAlign="center"
          color="white"
          variant="body"
        >
          Create an Open Task which will require you to approve or dismiss
          submissions. <br /> This Task type is designed to give you <br />{" "}
          freedom on the nature and requirements of the Task.
        </Typography>
      </Box>
      <Stack
        direction="column"
        gap={8}
        sx={{
          margin: "0 auto",
          width: {
            xs: "100%",
            sm: "650px",
            xxl: "800px"
          }
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={8}>
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
                    sx={{
                      width: "100%"
                    }}
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
                        <Typography color="white" variant="caption">
                          {6 - countWords(value)} Words left
                        </Typography>
                      </FormHelperText>
                    }
                  />
                );
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <Controller
              name="weight"
              control={control}
              rules={{
                required: true,
                min: 1,
                max: 10
              }}
              render={({ field: { name, value, onChange } }) => {
                return (
                  <Box
                    sx={{
                      marginTop: "10px"
                    }}
                    gap={2}
                  >
                    <Slider
                      step={1}
                      name={name}
                      min={1}
                      max={10}
                      sx={{
                        width: "100%",
                        height: "20px",
                        ".MuiSlider-thumb": {
                          display: "none"
                        }
                      }}
                      onChange={onChange}
                      // placeholder="Weight"
                      value={+(value || 0)}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        minWidth: "40px"
                      }}
                    >
                      <Typography color="white" variant="caption">
                        Weight (1-10)
                      </Typography>
                      <Typography color="white" variant="caption">
                        {value}
                      </Typography>
                    </Box>
                  </Box>

                  // <AutTextField
                  //   variant="standard"
                  //   color="offWhite"
                  //   required
                  //   type="number"
                  //   sx={{
                  //     width: "100%"
                  //   }}
                  //   autoFocus
                  //   name={name}
                  //   value={value || ""}
                  //   onChange={onChange}
                  //   placeholder="Weight"
                  //   helperText={
                  //     <FormHelperText
                  //       errorTypes={errorTypes}
                  //       value={value}
                  //       name={name}
                  //       errors={formState.errors}
                  //     >
                  //       <Typography color="white" variant="caption">
                  //         Between 1 - 10
                  //       </Typography>
                  //     </FormHelperText>
                  //   }
                  // />
                );
              }}
            />
          </Grid>
        </Grid>

        <Stack direction="row" gap={4}>
          <Controller
            name="startDate"
            control={control}
            rules={{
              required: true
            }}
            render={({ field: { name, value, onChange } }) => {
              return (
                <AutDatepicker
                  placeholder="Start date"
                  value={value}
                  onChange={onChange}
                />
              );
            }}
          />
          <Controller
            name="endDate"
            control={control}
            rules={{
              required: true
            }}
            render={({ field: { name, value, onChange } }) => {
              return (
                <AutDatepicker
                  placeholder="End date"
                  minDateTime={values.startDate}
                  value={value}
                  onChange={onChange}
                />
              );
            }}
          />
        </Stack>

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
                placeholder="Describe the requirements of the task including instructions on what to submit. I.e. a link to an artwork or plain text."
                helperText={
                  <FormHelperText
                    errorTypes={errorTypes}
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
        <Stack
          direction="column"
          gap={2}
          sx={{
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            width: {
              xs: "100%",
              sm: "650px",
              xxl: "800px"
            },
            minHeight: "45px"
          }}
        >
          <Stack direction="column">
            <Typography
              color="white"
              variant="body"
              component="div"
              sx={{ mb: "5px" }}
            >
              Choose whether contributors need to complete a text input, attach
              a file, or both. At least one of the options must be selected.
            </Typography>
            {/* <Typography color="white" variant="caption">
              Choose whether contributors need to complete a text input, attach
              a file, or both. At least one of the options must be selected.
            </Typography> */}
          </Stack>
          <Stack
            direction={{
              xs: "column",
              md: "row"
            }}
            gap={2}
            sx={{
              margin: "0 auto",
              display: "flex",
              alignItems: {
                xs: "flex-start",
                md: "center"
              },

              width: {
                xs: "100%",
                sm: "650px",
                xxl: "800px"
              }
            }}
          >
            <Stack
              direction="row"
              gap={1}
              sx={{
                display: "flex",
                alignItems: "center"
              }}
            >
              <Typography color="white" variant="body" component="div">
                Text
              </Typography>
              <Controller
                name="textRequired"
                control={control}
                rules={{
                  required: !values?.attachmentRequired
                }}
                render={({ field: { name, value, onChange } }) => {
                  return (
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
                  );
                }}
              />
            </Stack>
            <Stack
              direction={{
                xs: "column",
                md: "row"
              }}
              gap={2}
              sx={{
                display: "flex",
                alignItems: {
                  xs: "flex-start",
                  md: "center"
                }
              }}
            >
              <Stack
                direction="row"
                gap={1}
                sx={{
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <Typography color="white" variant="body" component="div">
                  Attachment
                </Typography>

                <Controller
                  name="attachmentRequired"
                  control={control}
                  rules={{
                    required: !values?.textRequired
                  }}
                  render={({ field: { name, value, onChange } }) => {
                    return (
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
                    );
                  }}
                />
              </Stack>
              {values?.attachmentRequired === true && (
                <Controller
                  name="attachmentType"
                  control={control}
                  rules={{
                    validate: {
                      selected: (v) => !!v
                    },
                    required: values.attachmentRequired
                  }}
                  render={({ field: { name, value, onChange } }) => {
                    return (
                      <AutSelectField
                        variant="standard"
                        color="offWhite"
                        renderValue={(selected) => {
                          if (!selected) {
                            return "Type" as any;
                          }
                          const type = AttachmentTypes.find(
                            (t) => t.value === selected
                          );
                          return type?.label || selected;
                        }}
                        name={name}
                        value={value || ""}
                        displayEmpty
                        required
                        onChange={onChange}
                      >
                        {AttachmentTypes.map((type) => {
                          return (
                            <MenuItem
                              key={`role-${type.value}`}
                              value={type.value}
                            >
                              {type.label}
                            </MenuItem>
                          );
                        })}
                      </AutSelectField>
                    );
                  }}
                />
              )}
            </Stack>
            {/* <Controller
            name="attachmentType"
            control={control}
            rules={{
              required: true
            }}
            render={({ field: { name, value, onChange } }) => {
              return (
                <AutTextField
                  sx={{
                    width: "150px",
                    ".MuiSvgIcon-root ": {
                      fill: "white !important"
                    }
                  }}
                  id="attachmentType"
                  value={value}
                  name={name}
                  color="offWhite"
                  onChange={onChange}
                  label="Type"
                  size="small"
                  select
                  InputLabelProps={{
                    style: { color: "white" }
                  }}
                  SelectProps={{
                    style: { color: "white" }
                  }}
                ></AutTextField>
              );
            }}
          /> */}
          </Stack>
        </Stack>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            mb: 4,
            justifyContent: {
              xs: "center",
              sm: "flex-end"
            }
          }}
        >
          <StepperButton
            label="Confirm"
            disabled={!formState.isValid}
            sx={{ width: "250px" }}
          />
        </Box>
      </Stack>
    </FormContainer>
  );
};

export default memo(OpenTasks);
