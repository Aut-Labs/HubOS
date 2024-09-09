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
  styled,
  Typography,
  useTheme
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

import { FormContainerHubOs } from "../Shared/FormContainer";
import { AutOSSlider } from "@theme/commitment-slider-styles";
import { max } from "date-fns";
import { AutOsButton } from "@components/buttons";
import {
  CommitmentSliderWrapper,
  SliderFieldWrapper,
  StyledTextField,
  TextFieldWrapper
} from "../Shared/StyledFields";

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

// const StyledTextField = styled(AutTextField)(({ theme }) => ({
//   width: "100%",
//   ".MuiInputBase-input": {
//     fontSize: "16px",
//     color: theme.palette.offWhite.main,
//     "&::placeholder": {
//       color: theme.palette.offWhite.main,
//       opacity: 0.5
//     },
//     "&.Mui-disabled": {
//       color: "#7C879D",
//       textFillColor: "#7C879D"
//     }
//   },
//   ".MuiInputBase-root": {
//     caretColor: theme.palette.primary.main,
//     fieldset: {
//       border: "1.5px solid #576176 !important",
//       borderRadius: "6px"
//     },
//     borderRadius: "6px",
//     background: "transparent"
//   },
//   ".MuiInputLabel-root": {
//     color: "#7C879D"
//   }
// }));

const OpenTasks = ({ plugin }: PluginParams) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roles = useSelector(allRoles);
  const theme = useTheme();
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
    return null;
    // const values = getValues();
    // createTask({
    //   novaAddress: communityData.properties.address,
    //   pluginTokenId: plugin.tokenId,
    //   pluginAddress: plugin.pluginAddress,
    //   task: {
    //     role: 1,
    //     weight: values.weight,
    //     metadata: {
    //       name: values.title,
    //       description: values.description,
    //       properties: {
    //         attachmentRequired: values.attachmentRequired,
    //         textRequired: values.textRequired,
    //         attachmentType: values.attachmentType
    //       }
    //     },
    //     startDate: dateToUnix(values.startDate),
    //     endDate: dateToUnix(values.endDate)
    //   } as unknown as Task
    // });
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
    <FormContainerHubOs onSubmit={handleSubmit(onSubmit)}>
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
          <Typography
            variant="subtitle1"
            fontSize={{
              xs: "14px",
              md: "20px"
            }}
            color="offWhite.main"
            fontWeight="bold"
          >
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
          color="offWhite.main"
          fontSize="16px"
        >
          Create an Open Task which will require you to approve or dismiss
          submissions. <br /> This Task type is designed to give you <br />{" "}
          freedom on the nature and requirements of the Task.
        </Typography>
      </Box>
      <Stack
        direction="column"
        gap={4}
        sx={{
          margin: "0 auto",
          width: {
            xs: "100%",
            sm: "650px",
            xxl: "800px"
          }
        }}
      >
        <TextFieldWrapper>
          <Typography
            variant="caption"
            color="offWhite.main"
            mb={theme.spacing(1)}
          >
            Title
          </Typography>
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
                <StyledTextField
                  color="offWhite"
                  required
                  sx={{
                    // ".MuiInputBase-input": {
                    //   height: "48px"
                    // },
                    width: "100%",
                    height: "48px"
                  }}
                  autoFocus
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  placeholder="Choose a title for your task"
                  helperText={
                    <FormHelperText
                      errorTypes={errorTypes}
                      value={value}
                      name={name}
                      errors={formState.errors}
                    >
                      <Typography variant="caption" color="white">
                        {6 - countWords(value)} Words left
                      </Typography>
                    </FormHelperText>
                  }
                />
              );
            }}
          />
        </TextFieldWrapper>
        <TextFieldWrapper>
          <Typography
            variant="caption"
            color="offWhite.main"
            mb={theme.spacing(1)}
          >
            Description
          </Typography>
          <Controller
            name="description"
            control={control}
            rules={{
              required: true,
              maxLength: 257
            }}
            render={({ field: { name, value, onChange } }) => {
              return (
                <StyledTextField
                  name={name}
                  value={value || ""}
                  color="offWhite"
                  rows="5"
                  multiline
                  onChange={onChange}
                  placeholder="Describe the requirements of the task including instructions on what to submit. I.e. a link to an artwork or plain text."
                  helperText={
                    <FormHelperText
                      errorTypes={errorTypes}
                      value={value}
                      name={name}
                      errors={formState.errors}
                    >
                      <Typography variant="caption" color="white">
                        {257 - (value?.length || 0)} of 257 characters left
                      </Typography>
                    </FormHelperText>
                  }
                />
              );
            }}
          />
        </TextFieldWrapper>
        <SliderFieldWrapper>
          <Typography
            variant="caption"
            color="offWhite.main"
            mb={theme.spacing(1)}
          >
            Weight (1-10)
          </Typography>
          <CommitmentSliderWrapper>
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
                      marginTop: "10px",
                      marginLeft: {
                        sm: "-24px",
                        xxl: "-44px"
                      }
                    }}
                    gap={2}
                  >
                    <AutOSSlider
                      value={value}
                      name={name}
                      errors={null}
                      sliderProps={{
                        defaultValue: 1,
                        step: 1,
                        marks: true,
                        name,
                        value: (value as any) || 0,
                        onChange,
                        min: 0,
                        max: 10
                      }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        width: {
                          xs: "100%",
                          sm: "620px",
                          xxl: "840px"
                        }
                      }}
                    >
                      <Typography variant="caption" color="offWhite.dark">
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
          </CommitmentSliderWrapper>
        </SliderFieldWrapper>

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
              variant="caption"
              color="offWhite.main"
              mb={theme.spacing(1)}
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
              <Typography color="white" variant="caption" component="div">
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
                          color: !value ? "offWhite.main" : "secondary.main"
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
                <Typography color="white" variant="caption" component="div">
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
                            color: !value ? "offWhite.main" : "secondary.main"
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
          <AutOsButton
            type="button"
            color="primary"
            disabled={!formState.isValid}
            variant="outlined"
            sx={{
              width: "100px"
            }}
          >
            <Typography fontWeight="bold" fontSize="16px" lineHeight="26px">
              Confirm
            </Typography>
          </AutOsButton>
        </Box>
      </Stack>
    </FormContainerHubOs>
  );
};

export default memo(OpenTasks);
