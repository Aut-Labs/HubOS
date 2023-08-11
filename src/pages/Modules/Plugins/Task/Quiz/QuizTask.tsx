import { useGetAllTasksPerQuestQuery } from "@api/onboarding.api";
import { PluginDefinition } from "@aut-labs/sdk";
import AutLoading from "@components/AutLoading";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Container,
  Stack,
  styled,
  Typography
} from "@mui/material";
import { IsAdmin } from "@store/Community/community.reducer";
import { memo, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import TaskDetails from "../Shared/TaskDetails";
import { GridBox } from "./QuestionsAndAnswers";
import { RequiredQueryParams } from "@api/RequiredQueryParams";
import { PluginDefinitionType } from "@aut-labs/sdk/dist/models/plugin";
import { taskTypes } from "../Shared/Tasks";
import { getQestions } from "@api/tasks.api";
import { useAccount } from "wagmi";

interface PluginParams {
  plugin: PluginDefinition;
}

const GridRow = styled(Box)({
  boxSizing: "border-box",
  display: "grid",
  gridTemplateColumns: "1fr 40px",
  gridGap: "8px"
});

const Answers = memo(({ control, questionIndex, answers, isDisabled }: any) => {
  const values = useWatch({
    name: `questions[${questionIndex}].answers`,
    control
  });

  const alphabetize = {
    0: "A",
    1: "B",
    2: "C",
    3: "D"
  };

  return (
    <GridBox>
      {answers.map((answer, index) => {
        return (
          <>
            {answer?.value && (
              <GridRow key={`questions[${questionIndex}].answers[${index}]`}>
                <Stack
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center"
                  }}
                >
                  <Typography mr={1} color="white" variant="subtitle2">
                    {alphabetize[index]}
                  </Typography>
                  <Typography color="white" variant="body" lineHeight="40px">
                    {answer?.value}
                  </Typography>
                </Stack>
                <Controller
                  name={`questions[${questionIndex}].answers[${index}].correct`}
                  control={control}
                  rules={{
                    required: !values?.some((v) => v.correct)
                  }}
                  render={({ field: { name, value, onChange } }) => {
                    console.log(value, "value");
                    return (
                      <Checkbox
                        name={name}
                        value={value}
                        checked={!!value}
                        tabIndex={-1}
                        onChange={onChange}
                        disabled={isDisabled}
                        sx={{
                          ".MuiSvgIcon-root": {
                            color: !value ? "offWhite.main" : "primary.main"
                          }
                        }}
                      />
                    );
                  }}
                />
              </GridRow>
            )}
          </>
        );
      })}
    </GridBox>
  );
});

const QuizTask = ({ plugin }: PluginParams) => {
  const [searchParams] = useSearchParams();
  const isAdmin = useSelector(IsAdmin);
  const { address: userAddress } = useAccount();
  const params = useParams();
  const [initialized, setInitialized] = useState(false);

  const { task } = useGetAllTasksPerQuestQuery(
    {
      userAddress,
      isAdmin,
      pluginAddress: searchParams.get(
        RequiredQueryParams.OnboardingQuestAddress
      ),
      questId: +searchParams.get(RequiredQueryParams.QuestId)
    },
    {
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        isLoading: isLoading || isFetching,
        task: (data?.tasks || []).find((t) => {
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

  const { control, setValue, watch } = useForm({
    mode: "onChange",
    defaultValues: {
      questions: []
    }
  });

  const values = watch();

  const { fields } = useFieldArray({
    control,
    name: "questions"
  });

  useEffect(() => {
    if (!initialized && task) {
      const start = async () => {
        const questionsAndAnswer: any[] = await getQestions(task.pluginAddress);
        const taskUuid = task.metadata.properties["uuid"];
        const foundQuestion = questionsAndAnswer.find(
          ({ taskAddress, uuid }) =>
            taskAddress === task.pluginAddress && uuid === taskUuid
        );

        if (foundQuestion) {
          setValue("questions", foundQuestion.questions);
        } else {
          setValue("questions", (task as any)?.metadata?.properties?.questions);
        }
        setInitialized(true);
      };
      start();
    }
  }, [initialized, task]);

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
              flex: 1,
              justifyContent: "space-between",
              margin: "0 auto",
              width: {
                xs: "100%",
                sm: "650px",
                xxl: "800px"
              }
            }}
          >
            {values.questions?.map((question, questionIndex) => (
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
                    isDisabled={!!task?.taskId}
                  ></Answers>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </>
      ) : (
        <AutLoading width="130px" height="130px"></AutLoading>
      )}
    </Container>
  );
};

export default memo(QuizTask);
