/* eslint-disable max-len */
import { useGetAllTasksPerQuestQuery } from "@api/onboarding.api";
import { PluginDefinition } from "@aut-labs-private/sdk";
import AutLoading from "@components/AutLoading";
import { StepperButton } from "@components/Stepper";
import {
  Card,
  CardContent,
  Container,
  FormHelperText,
  Stack,
  Typography
} from "@mui/material";
import { IsAdmin } from "@store/Community/community.reducer";
import { AutTextField } from "@theme/field-text-styles";
import { memo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import { useSearchParams, useParams } from "react-router-dom";
import TaskDetails from "../Shared/TaskDetails";

interface PluginParams {
  plugin: PluginDefinition;
}

const OpenTask = ({ plugin }: PluginParams) => {
  const [searchParams] = useSearchParams();

  const params = useParams();
  const { task, isLoading: isLoadingPlugins } = useGetAllTasksPerQuestQuery(
    {
      pluginAddress: searchParams.get("questPluginAddress"),
      questId: +searchParams.get("questId")
    },
    {
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        isLoading: isLoading || isFetching,
        task: (data || []).find((t) => t.taskId === +params?.taskId)
      })
    }
  );
  const isAdmin = useSelector(IsAdmin);

  const { control, handleSubmit, getValues, setValue, formState } = useForm({
    mode: "onChange",
    defaultValues: {
      openTask: null
    }
  });
  const values = useWatch({
    name: "openTask",
    control
  });
  const onSubmit = async () => {
    console.log("OpenTask onSubmit Values: ", values);
    //submit
  };

  if (task) {
    console.log("TASK::", task);
  }
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
                sm: "400px",
                xxl: "800px"
              }
            }}
          >
            <Card
              sx={{
                bgcolor: "nightBlack.main",
                borderColor: "divider",
                borderRadius: "16px",
                boxShadow: 3
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <Typography
                  color="white"
                  variant="body"
                  textAlign="center"
                  p="20px"
                >
                  {task?.metadata?.description}
                </Typography>
                <Controller
                  name="openTask"
                  control={control}
                  rules={{
                    required: true,
                    maxLength: 2000
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
                        placeholder="Enter your answer here..."
                      />
                    );
                  }}
                />
              </CardContent>
            </Card>

            {/* button */}

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
              />
            </Stack>
          </Stack>
        </>
      ) : (
        <AutLoading></AutLoading>
      )}
    </Container>
  );
};

export default memo(OpenTask);
