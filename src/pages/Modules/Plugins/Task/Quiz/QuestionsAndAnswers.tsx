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
  Checkbox,
  Popover,
  RadioGroup,
  InputAdornment,
  useTheme
} from "@mui/material";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RuleIcon from "@mui/icons-material/Rule";
import { AutTextField } from "@theme/field-text-styles";
import {
  useFieldArray,
  Controller,
  useWatch,
  Control,
  useFormState,
  useForm
} from "react-hook-form";
import AddIcon from "@mui/icons-material/Add";
import { FormHelperText } from "@components/Fields";
import { ChangeEvent, useState } from "react";
import { SubtitleWithInfo } from "@components/SubtitleWithInfoIcon";

import DeleteIcon from "@assets/hubos/delete-icon.svg?react";
import { AutOsButton, AutOsTabButton } from "@components/buttons";

const errorTypes = {
  uniqueQuestion: `Question should be unique`
};

interface AnswersParams {
  control: Control<any, any>;
  questionIndex: number;
  updateForm: (...args) => any;
  getFormValues: (...args) => any;
}

const StyledTextField = styled(AutTextField)(({ theme }) => ({
  width: "100%",
  ".MuiInputBase-input": {
    fontSize: "16px",
    color: theme.palette.offWhite.main,
    "&::placeholder": {
      color: theme.palette.offWhite.main,
      opacity: 0.5
    },
    "&.Mui-disabled": {
      color: "#7C879D",
      textFillColor: "#7C879D"
    }
  },
  ".MuiInputBase-root": {
    caretColor: theme.palette.primary.main,
    fieldset: {
      border: "1.5px solid #576176 !important",
      borderRadius: "6px"
    },
    borderRadius: "6px",
    background: "transparent"
  },
  ".MuiInputLabel-root": {
    color: "#7C879D"
  }
}));

const MultipleAnswerType = ({ questionIndex, index, control }) => {
  const formState = useFormState({
    name: `questions[${questionIndex}].answers`,
    control
  });

  const values = useWatch({
    name: `questions[${questionIndex}].answers`,
    control
  });

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
            <StyledTextField
              variant="standard"
              color="offWhite"
              sx={{
                width: "100%"
              }}
              InputProps={{
                startAdornment: (
                  <Typography mr={1} color="white" variant="body1">
                    {answers[index]}
                  </Typography>
                )
              }}
              required
              name={name}
              value={value || ""}
              onChange={onChange}
              placeholder={`Answer ${index + 1}`}
              helperText={
                <FormHelperText
                  errorTypes={errorTypes}
                  value={value}
                  name={name}
                  errors={formState.errors}
                />
              }
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
              required={!values?.some((v) => v.correct)}
              checked={value}
              value={value}
              tabIndex={-1}
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
    </GridRow>
  );
};

const RadioType = ({
  questionIndex,
  index,
  control,
  selectedIndex,
  handleChange
}) => {
  const formState = useFormState({
    name: `questions[${questionIndex}].answers`,
    control
  });

  const values = useWatch({
    name: `questions[${questionIndex}].answers`,
    control
  });

  return (
    <GridRow key={`questions[${questionIndex}].answers[${index}]`}>
      <Controller
        name={`questions[${questionIndex}].answers[${index}].value`}
        key={`questions[${questionIndex}].answers[${index}].value`}
        control={control}
        rules={{
          required: true
        }}
        render={({ field: { name, value, onChange } }) => {
          const adornment =
            values?.length === 2
              ? {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography mr={1} color="white" variant="body1">
                        {yesNoAnswers[index]}
                      </Typography>
                    </InputAdornment>
                  )
                }
              : {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography mr={1} color="white" variant="body1">
                        {answers[index]}
                      </Typography>
                    </InputAdornment>
                  )
                };
          return (
            <StyledTextField
              variant="standard"
              color="offWhite"
              sx={{
                width: "100%"
              }}
              InputProps={adornment}
              required
              name={name}
              value={value || ""}
              onChange={onChange}
              placeholder={`Answer ${index + 1}`}
              helperText={
                <FormHelperText
                  errorTypes={errorTypes}
                  value={value}
                  name={name}
                  errors={formState.errors}
                />
              }
            />
          );
        }}
      />
      <Controller
        name={`questions[${questionIndex}].answers[${index}].correct`}
        key={`questions[${questionIndex}].answers[${index}].correct`}
        control={control}
        rules={{
          required: !values?.some((v) => v.correct)
        }}
        render={({ field: { name, value, onChange } }) => {
          return (
            <Radio
              name={name}
              tabIndex={-1}
              checked={selectedIndex === index}
              defaultValue={null}
              onChange={(event) => {
                handleChange(event, index);
                // onChange();
              }}
              sx={{
                "&, &.MuiRadio-root": {
                  color: "offWhite.main"
                },
                "&, &.Mui-checked": {
                  color: "primary.main"
                }
              }}
            />
          );
        }}
      />
    </GridRow>
  );
};

const MultipleAnswerTypeAnswers = ({
  control,
  questionIndex
}: AnswersParams) => {
  const { fields } = useFieldArray({
    control,
    name: `questions[${questionIndex}].answers`
  });

  return (
    <GridBox>
      {fields.map((_, index) => {
        return (
          <MultipleAnswerType
            control={control}
            key={`checkbox-type-key-${index}`}
            questionIndex={questionIndex}
            index={index}
          />
        );
      })}
    </GridBox>
  );
};

const RadioTypeAnswers = ({
  control,
  questionIndex,
  updateForm,
  getFormValues
}: AnswersParams) => {
  const { fields } = useFieldArray({
    control,
    name: `questions[${questionIndex}].answers`
  });

  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleChange = (
    _: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const formValues = getFormValues();

    const updatedFormValues = {
      ...formValues,
      questions: formValues.questions.map((item, i) => {
        if (i === questionIndex) {
          return {
            ...item,
            answers: item.answers.map((answer, answerIndex) => {
              return {
                ...answer,
                correct: index === answerIndex
              };
            })
          };
        }
        return item;
      })
    };
    updateForm(updatedFormValues);
    setSelectedIndex(index);
  };

  return (
    <GridBox>
      {fields.map((_, index) => {
        return (
          <RadioType
            key={`radio-type-key-${index}`}
            selectedIndex={selectedIndex}
            handleChange={handleChange}
            control={control}
            questionIndex={questionIndex}
            index={index}
          />
        );
      })}
    </GridBox>
  );
};

export const emptyRadioQuestion = {
  question: "",
  questionType: "radio",
  answers: [
    { value: "", correct: false },
    {
      value: "",
      correct: false
    },
    { value: "", correct: false },
    { value: "", correct: false }
  ]
};

export const emptyBooleanQuestion = {
  question: "",
  questionType: "boolean",
  answers: [
    {
      value: "Yes",
      correct: false
    },
    {
      value: "No",
      correct: false
    }
  ]
};

export const emptyMultipleQuestion = {
  question: "",
  questionType: "multiple",
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

const yesNoAnswers = {
  0: "Y",
  1: "N"
};

export const GridBox = styled(Box)(({ theme }) => ({
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

const QuestionsAndAnswers = ({ control, updateForm, getFormValues }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  });

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const theme = useTheme();
  const id = open ? "simple-popover" : undefined;

  const values = useWatch({
    name: `questions`,
    control
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
          sm: "650px",
          xxl: "800px"
        }
      }}
    >
      {fields.map((field, index) => {
        return (
          <Card
            key={`questions[${index}].question`}
            sx={{
              border: "1px solid",
              borderColor: theme.palette.offWhite.dark,
              // backgroundColor: "rgba(255, 255, 255, 0.16)",
              // backgroundColor: "rgba(255, 255, 255, 0.08)",
              backgroundColor: "transparent",
              // borderRadius: "10px",
              transition: theme.transitions.create(["border-color"]),
              ":hover": {
                // borderColor: "#256BB0"
                borderColor: "white"
              }
            }}
          >
            <CardHeader
              action={
                <IconButton
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
                fontSize: "16px",
                color: theme.palette.offWhite.main,
                variant: "subtitle2"
              }}
              title={`Question ${index + 1}`}
            />
            <CardContent>
              <Controller
                name={`questions[${index}].question`}
                control={control}
                rules={{
                  required: true,
                  validate: {
                    uniqueQuestion: (v) => {
                      const counts = {
                        [v]: v
                      };
                      const count = values.reduce((prev, curr) => {
                        if (counts[curr.question] === curr.question) {
                          prev += 1;
                        }
                        return prev;
                      }, 0);
                      return count <= 1;
                    }
                  }
                }}
                render={({ formState, field: { name, value, onChange } }) => {
                  return (
                    <StyledTextField
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
                      helperText={
                        <FormHelperText
                          errorTypes={errorTypes}
                          value={value}
                          name={name}
                          errors={formState.errors}
                        />
                      }
                    />
                  );
                }}
              />

              {field["questionType"] === "multiple" && (
                <MultipleAnswerTypeAnswers
                  updateForm={updateForm}
                  getFormValues={getFormValues}
                  control={control}
                  questionIndex={index}
                />
              )}

              {(field["questionType"] === "radio" ||
                field["questionType"] === "boolean") && (
                <RadioTypeAnswers
                  updateForm={updateForm}
                  getFormValues={getFormValues}
                  control={control}
                  questionIndex={index}
                />
              )}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end"
                }}
              >
                {field["questionType"] === "multiple" ? (
                  <Typography
                    mt={2}
                    textAlign="end"
                    color="offWhite.dark"
                    variant="caption"
                  >
                    Tick the box next to the correct answer(s)
                  </Typography>
                ) : (
                  <Typography
                    mt={2}
                    textAlign="end"
                    color="offWhite.dark"
                    variant="caption"
                  >
                    Select the radio button next to the correct answer
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        );
      })}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end"
        }}
      >
        <AutOsTabButton
          startIcon={<AddIcon />}
          variant="outlined"
          size="medium"
          color="offWhite"
          onClick={handleClick}
          // onClick={() => append(emptyMultipleQuestion)}
        >
          Add question
        </AutOsTabButton>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left"
          }}
          sx={{
            ".MuiPopover-paper": {
              backgroundColor: "rgba(255, 255, 255, 0.16)",
              borderRadius: "8px"
            }
          }}
        >
          <Box
            sx={{
              bgcolor: "transparent",
              display: "flex",
              flexDirection: "column",
              padding: "10px"
            }}
          >
            <Button
              startIcon={<RuleIcon />}
              size="medium"
              color="offWhite"
              sx={{
                justifyContent: "start"
              }}
              onClick={() => {
                append(emptyBooleanQuestion);
                handleClose();
              }}
            >
              Yes/No
            </Button>
            <Button
              startIcon={<CheckBoxIcon />}
              size="medium"
              color="offWhite"
              sx={{
                justifyContent: "start"
              }}
              onClick={() => {
                append(emptyMultipleQuestion);
                handleClose();
              }}
            >
              Checkbox
            </Button>
            <Button
              startIcon={<RadioButtonCheckedIcon />}
              size="medium"
              color="offWhite"
              sx={{
                justifyContent: "start"
              }}
              onClick={() => {
                append(emptyRadioQuestion);
                handleClose();
              }}
            >
              Radio Button
            </Button>
          </Box>
        </Popover>
      </Box>
    </Stack>
  );
};

export default QuestionsAndAnswers;
