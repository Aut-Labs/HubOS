import { useGetAllTasksPerQuestQuery } from "@api/onboarding.api";
import { PluginDefinition } from "@aut-labs-private/sdk";
import { TaskStatus } from "@aut-labs-private/sdk/dist/models/task";
import AutLoading from "@components/AutLoading";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import LinkWithQuery from "@components/LinkWithQuery";
import { StepperButton } from "@components/Stepper";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Container,
  IconButton,
  Stack,
  styled,
  Typography
} from "@mui/material";
import { IsAdmin } from "@store/Community/community.reducer";
import { AutTextField } from "@theme/field-text-styles";
import { memo, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import { isNull } from "util";
import TaskDetails from "../Shared/TaskDetails";
import { GridBox } from "./QuestionsAndAnswers";
import { RequiredQueryParams } from "@api/RequiredQueryParams";
import { PluginDefinitionType } from "@aut-labs-private/sdk/dist/models/plugin";
import { taskTypes } from "../Shared/Tasks";
import { useEthers } from "@usedapp/core";

interface PluginParams {
  plugin: PluginDefinition;
}

const GridRow = styled(Box)({
  boxSizing: "border-box",
  display: "grid",
  gridTemplateColumns: "40px 1fr",
  gridGap: "8px"
});

const Row = styled(Box)({
  display: "flex",
  justifyContent: "flex-end",
  width: "100%"
});

const Answers = memo(({ control, questionIndex, answers }: any) => {
  const values = useWatch({
    name: `questions[${questionIndex}].answers`,
    control
  });

  return (
    <GridBox>
      {answers.map((answer, index) => {
        return (
          <GridRow key={`questions[${questionIndex}].answers[${index}]`}>
            <Controller
              name={`questions[${questionIndex}].answers[${index}].checked`}
              control={control}
              rules={{
                required: !values?.some((v) => v.checked)
              }}
              render={({ field: { name, value, onChange } }) => {
                return (
                  <Checkbox
                    name={name}
                    sx={{
                      color: "white",
                      "&.Mui-checked": {
                        color: "primary"
                      }
                    }}
                    value={value}
                    tabIndex={-1}
                    onChange={onChange}
                  />
                );
              }}
            />
            <Typography color="white" variant="body" lineHeight="40px">
              {answer?.value}
            </Typography>
          </GridRow>
        );
      })}
    </GridBox>
  );
});

const QuizTask = ({ plugin }: PluginParams) => {
  const [searchParams] = useSearchParams();
  const { account: userAddress } = useEthers();
  const params = useParams();
  const [initialized, setInitialized] = useState(false);
  // const [isEditMode, setEditMode] = useState(false);

  const { task, isLoading: isLoadingPlugins } = useGetAllTasksPerQuestQuery(
    {
      userAddress,
      pluginAddress: searchParams.get(
        RequiredQueryParams.OnboardingQuestAddress
      ),
      questId: +searchParams.get(RequiredQueryParams.QuestId)
    },
    {
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        isLoading: isLoading || isFetching,
        task: (data || []).find((t) => {
          const [pluginType] = location.pathname.split("/").splice(-2);
          return (
            t.taskId === +params?.taskId &&
            PluginDefinitionType[pluginType] ===
              taskTypes[t.taskType].pluginType
          );
        })
      })
    }
  );

  console.log(task, "TASK");
  const { control, handleSubmit, getValues, setValue, formState } = useForm({
    mode: "onChange",
    defaultValues: {
      questions: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  });

  const values = useWatch({
    name: `questions`,
    control
  });

  useEffect(() => {
    if (!initialized && task) {
      setValue("questions", (task as any)?.metadata?.properties?.questions);
      setInitialized(true);
    }
  }, [initialized, task]);

  const onSubmit = async () => {
    console.log("QuizTask onSubmit Values: ", values);
    console.log(formState, "FORM STATE");
  };

  if (task) {
    console.log("TASK::", task);
  }

  const isAdmin = useSelector(IsAdmin);

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        height: "100%",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        position: "relative"
      }}
    >
      {task ? (
        <>
          <TaskDetails task={task} />
          <Stack
            direction="column"
            gap={4}
            sx={{
              mx: "auto",
              width: {
                xs: "100%",
                sm: "600px",
                xxl: "800px"
              }
            }}
          >
            {/* {isAdmin ? (
              <Row>
                <Button
                  sx={{
                    minWidth: "120px",
                    width: "120px",
                    justifySelf: "flex-end"
                  }}
                  color="offWhite"
                  size="small"
                  variant="outlined"
                  disabled={task.status !== TaskStatus.Created}
                >
                  Edit Task
                </Button>
              </Row>
            ) : null} */}
            {((task as any)?.metadata?.properties?.questions as any[])?.map(
              (question, questionIndex) => (
                <Card
                  key={`questions.${questionIndex}.question`}
                  sx={{
                    bgcolor: "nightBlack.main",
                    borderColor: "divider",
                    borderRadius: "16px",
                    boxShadow: 3
                  }}
                >
                  <CardHeader
                    titleTypographyProps={{
                      fontFamily: "FractulAltBold",
                      fontWeight: 900,
                      color: "white",
                      variant: "subtitle1"
                    }}
                    title={question?.question}
                  />
                  <CardContent>
                    <Answers
                      control={control}
                      answers={question?.answers}
                      questionIndex={questionIndex}
                      taskStatus={task?.status}
                    ></Answers>
                  </CardContent>
                </Card>
              )
            )}
            {task?.status === TaskStatus.Created ||
            task?.status === TaskStatus.Taken ? (
              <Stack
                sx={{
                  margin: "0 auto",
                  width: {
                    xs: "100%",
                    sm: "400px",
                    xxl: "800px"
                  }
                }}
              >
                <StepperButton
                  label="Submit"
                  onClick={handleSubmit(onSubmit)}
                  disabled={!formState.isValid}
                />{" "}
              </Stack>
            ) : null}
          </Stack>
        </>
      ) : (
        <AutLoading></AutLoading>
      )}
    </Container>
  );
};

export default memo(QuizTask);
