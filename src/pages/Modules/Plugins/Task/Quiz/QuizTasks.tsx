/* eslint-disable max-len */
import { useCreateQuizTaskPerQuestMutation } from "@api/onboarding.api";
import { PluginDefinition, Task } from "@aut-labs/sdk";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import { FormHelperText } from "@components/Fields";
import { StepperButton } from "@components/Stepper";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { AutTextField } from "@theme/field-text-styles";
import { pxToRem } from "@utils/text-size";
import { memo, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { dateToUnix } from "@utils/date-format";
import AddIcon from "@mui/icons-material/Add";
import QuestionsAndAnswers, { emptyQuestion } from "./QuestionsAndAnswers";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

import { RequiredQueryParams } from "@api/RequiredQueryParams";
import LinkWithQuery from "@components/LinkWithQuery";
import { countWords } from "@utils/helpers";
import { CommunityData, allRoles } from "@store/Community/community.reducer";
import { useSelector } from "react-redux";
import addMinutes from "date-fns/addMinutes";
import { useAccount } from "wagmi";

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
  const navigate = useNavigate();
  const communityData = useSelector(CommunityData);

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
          Success! Quiz task has been created and deployed on the Blockchain 🎉
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
              onClick={() =>
                navigate({
                  pathname: searchParams.get("returnUrl"),
                  search: searchParams.toString()
                })
              }
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

const QuizTasks = ({ plugin }: PluginParams) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { address: account } = useAccount();
  const roles = useSelector(allRoles);
  const communityData = useSelector(CommunityData);
  const [answersSaved, setAnswersSaved] = useState(false);
  const {
    control,
    handleSubmit,
    getValues,
    reset: resetForm,
    formState
  } = useForm({
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      questions: [emptyQuestion]
    }
  });

  const [createTask, { error, isError, isSuccess, data, isLoading, reset }] =
    useCreateQuizTaskPerQuestMutation();

  const onSubmit = async () => {
    const values = getValues();

    const questionsWithoutAnswers = [];

    for (let i = 0; i < values.questions.length; i++) {
      const { question, answers } = values.questions[i];

      const questionWithoutAnswer = {
        question,
        answers: answers.map((answer) => ({
          value: answer.value
        }))
      };
      questionsWithoutAnswers.push(questionWithoutAnswer);
    }

    createTask({
      userAddress: account,
      isAdmin: true,
      onboardingQuestAddress: searchParams.get(
        RequiredQueryParams.OnboardingQuestAddress
      ),
      pluginTokenId: plugin.tokenId,
      questId: +searchParams.get(RequiredQueryParams.QuestId),
      pluginAddress: plugin.pluginAddress,
      allQuestions: values.questions,
      task: {
        role: +searchParams.get(RequiredQueryParams.QuestId),
        metadata: {
          name: values.title,
          description: values.description,
          properties: {
            questions: questionsWithoutAnswers
          }
        },
        startDate: dateToUnix(new Date()),
        endDate: dateToUnix(endDatetime)
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
        pathname: `/${
          communityData?.name
        }/modules/OnboardingStrategy/QuestOnboardingPlugin/${+searchParams.get(
          RequiredQueryParams.QuestId
        )}`,
        search: searchParams.toString()
      });
    }
  }, [isSuccess, communityData]);

  return (
    <Container
      sx={{ py: "20px", display: "flex", flexDirection: "column" }}
      maxWidth="lg"
      component="form"
      autoComplete="off"
      onSubmit={handleSubmit(onSubmit)}
    >
      <ErrorDialog handleClose={() => reset()} open={isError} message={error} />
      <LoadingDialog open={isLoading} message="Creating task..." />

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
            to={{
              pathname: searchParams.get("returnUrl"),
              search: searchParams.toString()
            }}
            component={Link}
          >
            {/* {searchParams.get("returnUrlLinkName") || "Back"} */}
            <Typography color="white" variant="body">
              Back
            </Typography>
          </Button>
          <Typography textAlign="center" color="white" variant="h3">
            Quiz for {selectedRole?.roleName}
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
          Test your community’s knowledge with a series of multiple-choice
          question(s).
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
                placeholder="Describe the Quiz to your community"
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
      </Stack>

      <QuestionsAndAnswers control={control} />

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
            disabled={!formState.isValid}
            sx={{ width: "250px" }}
          />
        </Box>
      </Stack>
    </Container>
  );
};

export default memo(QuizTasks);
