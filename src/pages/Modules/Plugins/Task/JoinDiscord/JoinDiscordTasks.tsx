import { useCreateTaskMutation } from "@api/onboarding.api";
import { PluginDefinition, Task } from "@aut-labs/sdk";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import { AutDatepicker, FormHelperText } from "@components/Fields";
import { StepperButton } from "@components/Stepper";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Slider,
  Stack,
  styled,
  Typography,
  useTheme
} from "@mui/material";
import { AutTextField } from "@theme/field-text-styles";
import { pxToRem } from "@utils/text-size";
import { memo, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { dateToUnix } from "@utils/date-format";
import { RequiredQueryParams } from "@api/RequiredQueryParams";
import { useSelector } from "react-redux";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import DoneIcon from "@mui/icons-material/Done";
import {
  CommunityData,
  DiscordLink,
  IsDiscordVerified,
  allRoles
} from "@store/Community/community.reducer";
import DiscordServerVerificationPopup from "@components/Dialog/DiscordServerVerificationPopup";
import LinkWithQuery from "@components/LinkWithQuery";
import { countWords } from "@utils/helpers";
import { useAccount } from "wagmi";
import { FormContainer } from "../Shared/FormContainer";
import { addMinutes } from "date-fns";
import { AutOsButton } from "@components/buttons";
import {
  CommitmentSliderWrapper,
  SliderFieldWrapper,
  StyledTextField,
  TextFieldWrapper
} from "../Shared/StyledFields";
import { AutOSSlider } from "@theme/commitment-slider-styles";

const errorTypes = {
  maxWords: `Words cannot be more than 6`,
  maxNameChars: `Characters cannot be more than 24`,
  maxLength: `Characters cannot be more than 257`
};

interface PluginParams {
  plugin: PluginDefinition;
}

const TaskSuccess = ({ pluginId, reset }) => {
  const [searchParams] = useSearchParams();
  const communityData = useSelector(CommunityData);
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
          Success! Join Discord task has been created and deployed on the
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
            startIcon={<AddIcon />}
            variant="outlined"
            sx={{
              my: pxToRem(50)
            }}
            size="medium"
            color="offWhite"
            to={`/${communityData?.name}/modules/Task`}
            preserveParams
            component={LinkWithQuery}
          >
            Add another task
          </Button>

          {searchParams.has("returnUrl") && (
            <Button
              sx={{
                my: pxToRem(50)
              }}
              onClick={() => navigate(searchParams.get("returnUrl"))}
              type="submit"
              variant="outlined"
              size="medium"
              color="offWhite"
            >
              {searchParams.get("returnUrlLinkName") || "Go back"}
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

const endDatetime = new Date();
addMinutes(endDatetime, 45);

const JoinDiscordTasks = ({ plugin }: PluginParams) => {
  const theme = useTheme();
  const isDiscordVerified = useSelector(IsDiscordVerified);
  const inviteLink = useSelector(DiscordLink);
  const roles = useSelector(allRoles);
  const communityData = useSelector(CommunityData);
  const { address: account } = useAccount();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [discordDialogOpen, setDiscordDialogOpen] = useState(false);
  const { control, handleSubmit, getValues, formState, watch } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      startDate: new Date(),
      endDate: null,
      weight: 0,
      // inviteUrl: inviteLink || "",
      description: ""
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
            inviteUrl: inviteLink
          }
        },
        startDate: dateToUnix(values.startDate),
        endDate: dateToUnix(values.endDate)
      } as unknown as Task
    });
  };

  const selectedRole = useMemo(() => {
    return roles.find(
      (r) => r.id === +searchParams.get(RequiredQueryParams.QuestId)
    );
  }, [roles, searchParams]);

  useEffect(() => {
    if (isSuccess) {
      navigate({
        pathname: `/${communityData?.name}/tasks`
      });
    }
  }, [isSuccess, communityData]);

  return (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      <DiscordServerVerificationPopup
        open={discordDialogOpen}
        handleClose={() => setDiscordDialogOpen(false)}
      ></DiscordServerVerificationPopup>
      <ErrorDialog handleClose={() => reset()} open={isError} message={error} />
      <LoadingDialog open={isLoading} message="Creating task..." />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mb: 4,
          position: "relative",
          mx: "auto",
          width: "100%"
        }}
      >
        <Stack alignItems="center" justifyContent="center">
          {/* <Button
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
            <Typography color="white" variant="body">
              Back
            </Typography>
          </Button> */}
          <Typography
            variant="subtitle1"
            fontSize={{
              xs: "14px",
              md: "20px"
            }}
            color="offWhite.main"
            fontWeight="bold"
          >
            Join Discord for {selectedRole?.roleName}
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
          Ask your community to Join your Discord Community.
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
        {!isDiscordVerified && (
          <Stack
            sx={{
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: {
                xs: "100%",
                sm: "400px",
                xxl: "500px"
              }
            }}
          >
            {/* <Typography
              className="text-secondary"
              mx="auto"
              my={2}
              textAlign="center"
              color="white"
              variant="body1"
            >
              Please verify the discord account for your community.
            </Typography> */}
            <AutOsButton
              onClick={() => setDiscordDialogOpen(true)}
              type="button"
              textTransform="uppercase"
              color="primary"
              disabled={!formState.isValid}
              variant="outlined"
              sx={{
                width: "250px"
              }}
            >
              <Typography fontWeight="bold" fontSize="16px" lineHeight="26px">
                Connect Your Discord
              </Typography>
            </AutOsButton>
          </Stack>
        )}

        {isDiscordVerified && (
          <Chip icon={<DoneIcon />} color="success" label="Discord Verified" />
        )}

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
                    placeholder="Write a personalised message to your community asking them to join your community."
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
                  );
                }}
              />
            </CommitmentSliderWrapper>
          </SliderFieldWrapper>
        </Stack>

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

        {/* <Controller
        name="inviteUrl"
        control={control}
        rules={{
          required: true
        }}
        render={({ field: { name, value, onChange } }) => {
          return (
            <AutTextField
              variant="standard"
              color="offWhite"
              required
              name={name}
              value={value || ""}
              onChange={onChange}
              placeholder="1234"
              helperText={
                <FormHelperText
                  value={value}
                  name={name}
                  errors={formState.errors}
                >
                  Discord Invite
                </FormHelperText>
              }
            />
          );
        }}
      /> */}

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
            disabled={!formState.isValid || !inviteLink}
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

export default memo(JoinDiscordTasks);
