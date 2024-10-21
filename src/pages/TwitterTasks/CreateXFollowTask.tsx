import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import { AutDatepicker, FormHelperText } from "@components/Fields";
import {
  Box,
  Checkbox,
  duration,
  FormControlLabel,
  MenuItem,
  Stack,
  Typography,
  useTheme
} from "@mui/material";
import { AutSelectField } from "@theme/field-select-styles";
import { memo, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { dateToUnix } from "@utils/date-format";
import { countWords } from "@utils/helpers";
import { AutIDData, HubData } from "@store/Hub/hub.reducer";
import { useSelector } from "react-redux";

import { AutOSSlider } from "@theme/commitment-slider-styles";
import { AutOsButton } from "@components/buttons";
import {
  useCreateDiscordGatheringContributionMutation,
  useCreateOpenTaskContributionMutation
} from "@api/contributions.api";
import {
  DiscordGatheringContribution,
  OpenTaskContribution
} from "@api/contribution.model";
import SuccessDialog from "@components/Dialog/SuccessPopup";
import SubmitDialog from "@components/Dialog/SubmitDialog";
import {
  CommitmentSliderWrapper,
  SliderFieldWrapper,
  StyledTextField,
  TextFieldWrapper
} from "../Modules/Plugins/Task/Shared/StyledFields";
import { FormContainer } from "../Modules/Plugins/Task/Shared/FormContainer";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useOAuthSocials } from "@components/Oauth2/oauth2";

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


const CreateXFollowTask = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const hubData = useSelector(HubData);
  const autID = useSelector(AutIDData);

  const { mutateAsync: verifyFollow } = useMutation<any, void, any>({
    mutationFn: (verifyFollowRequest) => {
      return axios
        .post(`http://localhost:4005/api/task/twitter/comment`, verifyFollowRequest)
        .then((res) => res.data);
    }
  });

  const twitterId = useMemo(() => {
    const social = hubData.properties.socials.find((s) => s.type === "twitter");
    return social.link;
  }, [hubData]);

  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, getValues, formState, watch } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      startDate: new Date(),
      endDate: null,
      description: "",
      role: null,
      duration: null,
      allCanAttend: false,
      weight: 0,
      channelId: ""
    }
  });
  const values = watch();

  const { getAuthX } = useOAuthSocials();

  const onSubmit = async () => {
    // const values = getValues();
    // const contribution = new DiscordGatheringContribution({
    //   name: values.title,
    //   description: values.description,
    //   image: "",
    //   properties: {
    //     taskId: searchParams.get("taskId"),
    //     role: values.role,
    //     duration: values.duration,
    //     startDate: dateToUnix(values.startDate),
    //     endDate: dateToUnix(values.endDate),
    //     channelId: values.channelId,
    //     points: values.weight,
    //     quantity: 1,
    //     uri: ""
    //   }
    // });
    // createTask(contribution);

    await getAuthX(
      async (data) => {
        debugger;
        const { access_token } = data;
        debugger;
        setLoading(true);
        // const requestModel = {
        //   discordAccessToken: access_token,
        //   hubAddress,
        //   authSig
        // };
        // const result = await claimRole(requestModel, {
        //   onSuccess: (response) => {
        //     setLoading(false);
        //     setRoleClaimed(true);
        //   },
        //   onError: (res) => {
        //     setLoading(false);
        //   }
        // });
      },
      () => {
        setLoading(false);
      }
    );
  };

  //   useEffect(() => {
  //     if (isSuccess) {
  //       // navigate({
  //       //   pathname: `/${hubData?.name}/contributions`
  //       // });
  //     }
  //   }, [isSuccess, hubData]);

  return (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      {/* <ErrorDialog handleClose={() => reset()} open={isError} message={error} /> */}
      {/* <SubmitDialog
        open={isSuccess || isLoading}
        mode={isSuccess ? "success" : "loading"}
        backdropFilter={true}
        message={isLoading ? "" : "Congratulations!"}
        titleVariant="h2"
        subtitle={
          isLoading
            ? "Creating contribution..."
            : "Your submission has been created successfully!"
        }
        subtitleVariant="subtitle1"
        handleClose={() => {
          reset();
          navigate({
            pathname: `/${hubData?.name}/contributions`
          });
        }}
      ></SubmitDialog> */}

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
            Twitter Follow Task
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
          Create a discord gathering for your community to participate in.
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
                  placeholder="Choose a title for your gathering"
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
                  placeholder="Describe what the gathering is about"
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
            // disabled={!formState.isValid}
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

export default memo(CreateXFollowTask);
