import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Container,
  Link,
  Stack,
  styled,
  Typography
} from "@mui/material";
import TaskDetails from "../Shared/TaskDetails";
import ContributionDetails from "../Contributions/ContributionDetails";
import { Fragment, memo, useMemo } from "react";
import { useWatch } from "react-hook-form";

const GridBox = styled(Box)(({ theme }) => ({
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gridGap: "20px",
  marginTop: "20px",
  [theme.breakpoints.up("sm")]: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr"
  }
}));

const GridRow = styled(Box)({
  boxSizing: "border-box",
  display: "grid",
  gridTemplateColumns: "1fr 40px",
  gridGap: "8px"
});

const alphabetize = {
  0: "A",
  1: "B",
  2: "C",
  3: "D"
};

const Answers = memo(({ questionIndex, answers }: any) => {
  return (
    <GridBox>
      {answers.map((answer, index) => {
        return (
          <Fragment key={`questions[${questionIndex}].answers[${index}]`}>
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
                <Checkbox
                  sx={{
                    color: "white",
                    "&.Mui-checked": {
                      color: "primary"
                    },
                    "&.Mui-disabled": {
                      color: "nightBlack.light"
                    }
                  }}
                  checked={answer.correct}
                  disabled
                />
              </GridRow>
            )}
          </Fragment>
        );
      })}
    </GridBox>
  );
});

const QuizTaskView = ({
  contribution,
  submission
}: {
  contribution: any;
  submission: any;
}) => {
  const questionsWithUserAnswers = useMemo(() => {
    let answers: any[] = [];
    try {
      answers = JSON.parse(submission.data);
    } catch (e) {
      // pass
    }
    if (answers.length === 0 || !submission)
      return contribution.properties.questions;
    return contribution.properties.questions.map((question) => {
      const userAnswer = answers.find(
        (answer) => answer.question === question.question
      );
      return {
        ...question,
        answers: question.answers.map((answer) => {
          const userAnswerValue = userAnswer.answers.find(
            (a) => a.value === answer.value
          );
          return {
            ...answer,
            correct: userAnswerValue?.correct
          };
        })
      };
    });
  }, [contribution, submission]);
  return (
    <Stack
      direction="column"
      gap={4}
      sx={{
        flex: 1,
        margin: "0 auto",
        width: {
          xs: "100%",
          sm: "650px",
          xxl: "800px"
        }
      }}
    >
      {questionsWithUserAnswers.map((question, questionIndex) => (
        <Card
          key={`questions.${questionIndex}.question`}
          sx={{
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "rgba(255, 255, 255, 0.08)"
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
              answers={question?.answers}
              questionIndex={questionIndex}
              disabled={true}
            ></Answers>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default memo(QuizTaskView);
