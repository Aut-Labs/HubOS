import { AutDatepicker, FormHelperText } from "@components/Fields";
import { StepperButton } from "@components/Stepper";
import { Box, Button, Stack, Typography } from "@mui/material";
import { memo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import QuestionsAndAnswers from "./QuestionsAndAnswers";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

import { countWords } from "@utils/helpers";
import { AutIDData, HubData } from "@store/Hub/hub.reducer";
import { useSelector } from "react-redux";
import { FormContainer } from "../Shared/FormContainer";
import { addMinutes } from "date-fns";
import {
  CommitmentSliderWrapper,
  StyledTextField,
  TextFieldWrapper
} from "../Shared/StyledFields";
import { AutOSSlider } from "@theme/commitment-slider-styles";
import { useCreateQuizContributionMutation } from "@api/contributions.api";
import { dateToUnix } from "@utils/date-format";
import { QuizTaskContribution } from "@api/contribution-types/quiz.model.model";
import SubmitDialog from "@components/Dialog/SubmitDialog";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import { useWalletConnector } from "@aut-labs/connector";

const errorTypes = {
  maxWords: `Words cannot be more than 6`,
  maxNameChars: `Characters cannot be more than 24`,
  maxLength: `Characters cannot be more than 257`
};

const endDatetime = new Date();
addMinutes(endDatetime, 45);

const CreateQuizTask = () => {
  const { state } = useWalletConnector();
  const autID = useSelector(AutIDData);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hubData = useSelector(HubData);
  const {
    control,
    handleSubmit,
    getValues,
    reset: resetForm,
    setValue,
    watch,
    formState
  } = useForm({
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      title: "test",
      startDate: new Date(),
      endDate: addMinutes(new Date(), 45),
      description: "test",
      weight: 4,
      quantity: 2,
      questions: [
        {
          question: "tr",
          questionType: "boolean",
          answers: [
            {
              value: "Yes",
              correct: true
            },
            {
              value: "No",
              correct: false
            }
          ]
        }
      ]
    }
  });

  const values = watch();

  const [createTask, { error, isError, isSuccess, isLoading, reset }] =
    useCreateQuizContributionMutation();

  const onSubmit = async () => {
    const values = getValues();
    const joinedHub = autID.joinedHub(hubData.properties.address);
    const contribution = new QuizTaskContribution({
      name: values.title,
      description: values.description,
      image: "",
      properties: {
        taskId: searchParams.get("taskId"),
        role: +joinedHub.role,
        startDate: dateToUnix(values.startDate),
        endDate: dateToUnix(values.endDate),
        points: values.weight,
        quantity: values.quantity,
        descriptionId: "",
        questions: values.questions,
        hash: ""
      }
    });
    createTask({
      contribution,
      autSig: state.authSig
    });
  };

  // useEffect(() => {
  //   if (isSuccess) {
  //     navigate({
  //       pathname: `/${hubData?.name}/tasks`
  //     });
  //   }
  // }, [isSuccess, hubData]);

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
          flex: 1,
          mb: 4,
          mx: "auto",
          position: "relative",
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
            to={`/${hubData?.name}/modules/Task`}
            component={Link}
          >
            {/* {searchParams.get("returnUrlLinkName") || "Back"} */}
            <Typography color="white" variant="body">
              Back
            </Typography>
          </Button>
          <Typography textAlign="center" color="white" variant="h3">
            Quiz
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
          Test your hub’s knowledge with a series of multiple-choice
          question(s).
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
        <Stack direction="row" gap={4}>
          <TextFieldWrapper
            sx={{
              width: "100%"
            }}
          >
            <Typography variant="caption" color="offWhite.main" mb="1">
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
          <TextFieldWrapper
            sx={{
              width: "100%"
            }}
          >
            <Typography variant="caption" color="offWhite.main" mb="1">
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
                    placeholder="Choose a title for your task"
                    helperText={
                      <FormHelperText
                        errorTypes={errorTypes}
                        value={value}
                        name={name}
                        errors={formState.errors}
                      >
                        {/* <Typography variant="caption" color="white">
                      {6 - countWords(value)} Words left
                    </Typography> */}
                      </FormHelperText>
                    }
                  />
                );
              }}
            />
          </TextFieldWrapper>
        </Stack>

        <TextFieldWrapper>
          <Typography variant="caption" color="offWhite.main" mb="1">
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

        <Stack direction="row" gap={4}>
          <TextFieldWrapper
            sx={{
              width: "100%"
            }}
          >
            <Typography variant="caption" color="offWhite.main" mb="1">
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
                        marginTop: "10px"
                        // marginLeft: {
                        //   sm: "-24px",
                        //   xxl: "-44px"
                        // }
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
                          pr: 1,
                          width: {
                            xs: "100%"
                          }
                        }}
                      >
                        <Typography variant="body" color="offWhite.dark">
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
          </TextFieldWrapper>
        </Stack>

        <Stack direction="row" gap={4}>
          <TextFieldWrapper
            sx={{
              width: "100%"
            }}
          >
            <Typography variant="caption" color="offWhite.main" mb="1">
              Start date
            </Typography>
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
          </TextFieldWrapper>
          <TextFieldWrapper
            sx={{
              width: "100%"
            }}
          >
            <Typography variant="caption" color="offWhite.main" mb="1">
              End date
            </Typography>
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
          </TextFieldWrapper>
        </Stack>

        <QuestionsAndAnswers
          getFormValues={getValues}
          updateForm={resetForm}
          control={control}
        />

        <Stack
          sx={{
            margin: "0 auto",
            mt: 8,
            width: {
              xs: "100%",
              sm: "650px",
              xxl: "800px"
            }
          }}
        >
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
              disabled={!formState.isValid || !values?.questions?.length}
              sx={{ width: "250px" }}
            />
          </Box>
        </Stack>
      </Stack>
    </FormContainer>
  );
};

export default memo(CreateQuizTask);
