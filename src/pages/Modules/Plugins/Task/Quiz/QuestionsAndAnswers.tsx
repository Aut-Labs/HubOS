import {
  Stack,
  Card,
  CardHeader,
  IconButton,
  CardContent,
  Button,
  Radio,
  Tooltip,
  Typography,
  Box,
  styled,
  Checkbox
} from "@mui/material";
import { AutTextField } from "@theme/field-text-styles";
import { memo, useState } from "react";
import { useFieldArray, Controller, useWatch, Control } from "react-hook-form";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface AnswersParams {
  control: Control<any, any>;
  questionIndex: number;
}

const Answers = memo(({ control, questionIndex }: AnswersParams) => {
  const { fields, update } = useFieldArray({
    control,
    name: `questions[${questionIndex}].answers`
  });

  const values = useWatch({
    name: `questions[${questionIndex}].answers`,
    control
  });

  console.log("values: ", values);

  return (
    <GridBox>
      {fields.map((_, index) => {
        return (
          <GridRow key={`questions[${questionIndex}].answers[${index}]`}>
            <Controller
              name={`questions[${questionIndex}].answers[${index}].value`}
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { name, value, onChange } }) => {
                return (
                  <AutTextField
                    variant="standard"
                    color="offWhite"
                    sx={{
                      width: "100%"
                    }}
                    InputProps={{
                      startAdornment: (
                        <Typography mr={1} color="white" variant="subtitle2">
                          {answers[index]}
                        </Typography>
                      )
                    }}
                    required
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    placeholder={`Answer ${index + 1}`}
                  />
                );
              }}
            />
            <Controller
              name={`questions[${questionIndex}].answers[${index}].correct`}
              control={control}
              rules={{
                required: !values?.some((v) => v.correct)
              }}
              render={({ field: { name, value, onChange } }) => {
                return (
                  <Checkbox
                    name={name}
                    color="primary"
                    required={!values?.some((v) => v.correct)}
                    value={value}
                    tabIndex={-1}
                    onChange={onChange}
                  />
                  // <Tooltip
                  //   title={
                  //     selectedValue === answers[index]
                  //       ? "Correct Answer"
                  //       : "Set as correct answer"
                  //   }
                  // >
                  //   <Radio
                  //     color="primary"
                  //     tabIndex={-1}
                  //     checked={selectedValue === answers[index]}
                  //     onChange={(e) => {
                  //       setSelectedValue(answers[index]);
                  //       fields.forEach((field, fIndex) => {
                  //         update(fIndex, {
                  //           ...values[fIndex],
                  //           correct: fIndex === index
                  //         });
                  //       });
                  //     }}
                  //     value={value}
                  //     name={name}
                  //   />
                  // </Tooltip>
                );
              }}
            />
          </GridRow>
        );
      })}
    </GridBox>
  );
});

export const emptyQuestion = {
  question: "",
  answers: [
    {
      value: "",
      correct: false
    },
    {
      value: "",
      correct: false
    },
    {
      value: "",
      correct: false
    },
    {
      value: "",
      correct: false
    }
  ]
};

const answers = {
  0: "A",
  1: "B",
  2: "C",
  3: "D"
};

const GridBox = styled(Box)({
  boxSizing: "border-box",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gridGap: "20px",
  marginTop: "20px"
});

const GridRow = styled(Box)({
  boxSizing: "border-box",
  display: "grid",
  gridTemplateColumns: "1fr 40px",
  gridGap: "8px"
});

const QuestionsAndAnswers = ({ control }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  });

  return (
    <Stack
      direction="column"
      gap={4}
      sx={{
        mt: 6,
        mx: "auto",
        width: {
          xs: "100%",
          sm: "600px",
          xxl: "800px"
        }
      }}
    >
      {fields.map((field, index) => (
        <Card
          key={`questions.${index}.question`}
          sx={{
            bgcolor: "nightBlack.main",
            borderColor: "divider",
            borderRadius: "16px",
            boxShadow: 3
          }}
        >
          <CardHeader
            action={
              <IconButton
                disabled={index === 0}
                tabIndex={-1}
                color="error"
                onClick={() => remove(index)}
              >
                <DeleteIcon />
              </IconButton>
            }
            titleTypographyProps={{
              fontFamily: "FractulAltBold",
              fontWeight: 900,
              color: "white",
              variant: "subtitle1"
            }}
            title={`Question ${index + 1}`}
          />
          <CardContent>
            <Controller
              name={`questions.${index}.question`}
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { name, value, onChange } }) => {
                return (
                  <AutTextField
                    variant="standard"
                    color="offWhite"
                    sx={{
                      width: "100%"
                    }}
                    required
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    placeholder="Question"
                  />
                );
              }}
            />

            <Answers control={control} questionIndex={index} />
          </CardContent>
        </Card>
      ))}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end"
        }}
      >
        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          size="medium"
          color="offWhite"
          onClick={() => append(emptyQuestion)}
        >
          Add question
        </Button>
      </Box>
    </Stack>
  );
};

export default memo(QuestionsAndAnswers);
