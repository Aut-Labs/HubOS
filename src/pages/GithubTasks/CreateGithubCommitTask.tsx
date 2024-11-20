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
  useCreateGithubCommitContributionMutation,
  useCreateOpenTaskContributionMutation
} from "@api/contributions.api";
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
import { CommitContribution } from "@api/contribution-types/github-commit.model";

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

const CreateGithubCommitTask = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const hubData = useSelector(HubData);
  const autID = useSelector(AutIDData);
  const [createTask, { error, isError, isSuccess, isLoading, reset }] =
    useCreateGithubCommitContributionMutation();

  const metadata = useMemo(() => {
    const social = hubData.properties.socials.find((s) => s.type === "github");
    return social.metadata;
  }, [hubData]);

  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, getValues, formState, watch } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      startDate: new Date(),
      endDate: null,
      description: "",
      repository: "",
      branch: "",
      role: null,
      quantity: 1,
      allCanAttend: false,
      weight: 0,
      channelId: ""
    }
  });
  const values = watch();

  const { data: reposResponse, isLoading: loadingRepos } = useQuery({
    queryKey: ["repositories", metadata.orgId],
    queryFn: async () => {
      const response = await axios.post(
        "http://localhost:4005/api/task/github/getRepositories",
        {
          organisationId: metadata.orgId,
          organisationName: metadata.orgName
        }
      );
      return response.data;
    },
    enabled: !!metadata.orgId && !!metadata.orgName
  });

  const { data: branchesResponse, isLoading: loadingBranches } = useQuery({
    queryKey: ["branches", values.repository],
    queryFn: async () => {
      const response = await axios.post(
        "http://localhost:4005/api/task/github/getBranches",
        {
          repositoryName: values.repository,
          organisationName: metadata.orgName
        }
      );
      return response.data;
    },
    enabled: !!values.repository && !!metadata.orgName
  });

  const onSubmit = async () => {
    const values = getValues();
    const joinedHub = autID.joinedHub(hubData.properties.address);
    const contribution = new CommitContribution({
      name: values.title,
      description: values.description,
      image: "",
      properties: {
        taskId: searchParams.get("taskId"),
        role: +joinedHub.role,
        startDate: dateToUnix(values.startDate),
        endDate: dateToUnix(values.endDate),
        points: values.weight,
        branch: values.branch,
        repository: values.repository,
        organisation: metadata.orgName,
        quantity: values.quantity,
        uri: ""
      }
    });
    createTask(contribution);
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
      <ErrorDialog handleClose={() => reset()} open={isError} message={error} />
      <SubmitDialog
        open={isSuccess || isLoading}
        mode={isSuccess ? "success" : "loading"}
        backdropFilter={true}
        message={isLoading ? "" : "Congratulations!"}
        titleVariant="h2"
        subtitle={
          isLoading
            ? "Creating contribution..."
            : "Your contribution has been created successfully!"
        }
        subtitleVariant="subtitle1"
        handleClose={() => {
          reset();
          navigate({
            pathname: `/${hubData?.name}/contributions`
          });
        }}
      ></SubmitDialog>

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
            Github Commit Task
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
          Create a task that requires the user to commit to your hub's
          repository.
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
                  placeholder="Choose a title"
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
                  placeholder="Describe what the task is about"
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
        {!!reposResponse?.repositories?.length && (
          <TextFieldWrapper>
            <Typography
              variant="caption"
              color="offWhite.main"
              mb={theme.spacing(1)}
            >
              Repository
            </Typography>
            <Controller
              name="repository"
              control={control}
              rules={{ required: true }}
              render={({ field: { name, value, onChange } }) => (
                <AutSelectField
                  value={value}
                  onChange={onChange}
                  color="offWhite"
                  disabled={loadingRepos}
                  sx={{ width: "100%" }}
                >
                  <MenuItem value="">
                    <em>Select a repository</em>
                  </MenuItem>
                  {reposResponse?.repositories?.map((repo) => (
                    <MenuItem key={repo.id} value={repo.name}>
                      {repo.name}
                    </MenuItem>
                  ))}
                </AutSelectField>
              )}
            />
          </TextFieldWrapper>
        )}

        <TextFieldWrapper>
          <Typography
            variant="caption"
            color="offWhite.main"
            mb={theme.spacing(1)}
          >
            Branch
          </Typography>
          <Controller
            name="branch"
            control={control}
            rules={{ required: true }}
            render={({ field: { name, value, onChange } }) => (
              <AutSelectField
                value={value}
                onChange={onChange}
                color="offWhite"
                disabled={
                  !values.repository ||
                  loadingBranches ||
                  branchesResponse?.branches?.length === 0
                }
                sx={{ width: "100%" }}
              >
                <MenuItem value="">
                  <em>Select a branch</em>
                </MenuItem>
                {branchesResponse?.branches?.map((branch) => (
                  <MenuItem key={branch.name} value={branch.name}>
                    {branch.name}
                  </MenuItem>
                ))}
              </AutSelectField>
            )}
          />
        </TextFieldWrapper>
        <TextFieldWrapper
          sx={{
            width: "100%"
          }}
        >
          <Typography
            variant="caption"
            color="offWhite.main"
            mb={theme.spacing(1)}
          >
            Quantity
          </Typography>
          <Controller
            name="quantity"
            control={control}
            rules={{
              required: true,
              min: 1
            }}
            render={({ field: { name, value, onChange } }) => {
              return (
                <StyledTextField
                  color="offWhite"
                  required
                  type="number"
                  sx={{
                    width: "100%",
                    height: "48px"
                  }}
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  placeholder="Quantity"
                  helperText={
                    <FormHelperText
                      errorTypes={errorTypes}
                      value={value}
                      name={name}
                      errors={formState.errors}
                    ></FormHelperText>
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

export default memo(CreateGithubCommitTask);
