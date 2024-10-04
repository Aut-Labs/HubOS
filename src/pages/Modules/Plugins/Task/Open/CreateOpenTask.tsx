import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import { AutDatepicker, FormHelperText } from "@components/Fields";
import {
  Box,
  Checkbox,
  MenuItem,
  Stack,
  Typography,
  useTheme
} from "@mui/material";
import { AutSelectField } from "@theme/field-select-styles";
import { memo, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { dateToUnix } from "@utils/date-format";
import { countWords } from "@utils/helpers";
import { AutIDData, HubData } from "@store/Hub/hub.reducer";
import { useSelector } from "react-redux";

import { FormContainer } from "../Shared/FormContainer";
import { AutOSSlider } from "@theme/commitment-slider-styles";
import { AutOsButton } from "@components/buttons";
import {
  CommitmentSliderWrapper,
  SliderFieldWrapper,
  StyledTextField,
  TextFieldWrapper
} from "../Shared/StyledFields";
import { useCreateOpenTaskContributionMutation } from "@api/contributions.api";
import { OpenTaskContribution } from "@api/contribution.model";

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

const CreateOpenTask = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const hubData = useSelector(HubData);
  const autID = useSelector(AutIDData);
  const { control, handleSubmit, getValues, formState, watch } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "Test",
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      description: "A test description",
      attachmentType: "",
      attachmentRequired: false,
      textRequired: true,
      weight: 4
    }
  });
  const values = watch();

  const [createTask, { error, isError, isSuccess, isLoading, reset }] =
    useCreateOpenTaskContributionMutation();

  const onSubmit = async () => {
    const values = getValues();
    const joinedHub = autID.joinedHub(hubData.properties.address);
    const contribution = new OpenTaskContribution({
      name: values.title,
      description: values.description,
      image: "",
      properties: {
        attachmentRequired: values.attachmentRequired,
        textRequired: values.textRequired,
        attachmentType: values.attachmentType,
        taskId: searchParams.get("taskId"),
        role: +joinedHub.role,
        startDate: dateToUnix(values.startDate),
        endDate: dateToUnix(values.endDate),
        points: values.weight,
        quantity: 1,
        uri: ""
      }
    });
    createTask(contribution);
  };

  useEffect(() => {
    if (isSuccess) {
      navigate({
        pathname: `/${hubData?.name}/contributions`
      });
    }
  }, [isSuccess, hubData]);

  const roleName = useMemo(() => {
    const joinedHub = autID.joinedHub(hubData.properties.address);
    return hubData.roleName(+joinedHub?.role);
  }, [hubData, autID]);

  return (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      <ErrorDialog handleClose={() => reset()} open={isError} message={error} />
      <LoadingDialog open={isLoading} message="Creating contribution..." />

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
            variant="h3"
            fontSize={{
              xs: "14px",
              md: "20px"
            }}
            color="offWhite.main"
            fontWeight="bold"
          >
            Open Task for {roleName}
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
          variant="body"
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
              variant="body"
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
            onClick={() => onSubmit()}
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
    </FormContainer>
  );
};

export default memo(CreateOpenTask);
