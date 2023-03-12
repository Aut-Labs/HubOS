/* eslint-disable max-len */
import {
  useFinalizeTaskMutation,
  useGetAllTasksPerQuestQuery,
  useSubmitTaskMutation
} from "@api/onboarding.api";
import { PluginDefinition, Task } from "@aut-labs-private/sdk";
import AutLoading from "@components/AutLoading";
import { StepperButton } from "@components/Stepper";
import { Card, CardContent, Container, Stack, Typography } from "@mui/material";
import { IsAdmin } from "@store/Community/community.reducer";
import { AutTextField } from "@theme/field-text-styles";
import { memo, useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import { useSearchParams, useParams } from "react-router-dom";
import TaskDetails from "../Shared/TaskDetails";
import { RequiredQueryParams } from "@api/RequiredQueryParams";
import { PluginDefinitionType } from "@aut-labs-private/sdk/dist/models/plugin";
import { taskTypes } from "../Shared/Tasks";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import { useEthers } from "@usedapp/core";
import { TaskStatus } from "@aut-labs-private/sdk/dist/models/task";

interface PluginParams {
  plugin: PluginDefinition;
}

interface UserSubmitContentProps {
  task: Task;
  userAddress: string;
  plugin: PluginDefinition;
}

const UserSubmitContent = ({
  task,
  userAddress,
  plugin
}: UserSubmitContentProps) => {
  const [searchParams] = useSearchParams();
  const [initialized, setInitialized] = useState(false);
  const { control, handleSubmit, formState, setValue } = useForm({
    mode: "onChange",
    defaultValues: {
      openTask: null
    }
  });

  useEffect(() => {
    if (!initialized && task) {
      setValue("openTask", task.submission?.description);
      setInitialized(true);
    }
  }, [initialized, task]);

  const [submitTask, { error, isError, isLoading, reset }] =
    useSubmitTaskMutation();

  const onSubmit = async (values) => {
    submitTask({
      task: {
        ...task,
        submission: {
          name: "Open task submission",
          description: values.openTask,
          properties: {
            submitter: userAddress
          }
        }
      },
      onboardingQuestAddress: searchParams.get(
        RequiredQueryParams.OnboardingQuestAddress
      ),
      pluginAddress: plugin.pluginAddress,
      pluginDefinitionId: plugin.pluginDefinitionId
    });
  };

  return (
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
      <ErrorDialog handleClose={() => reset()} open={isError} message={error} />
      <LoadingDialog open={isLoading} message="Submitting task..." />
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
          <Typography color="white" variant="body" textAlign="center" p="20px">
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
                  disabled={
                    task.status === TaskStatus.Submitted ||
                    task.status === TaskStatus.Finished
                  }
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
        {task?.status === TaskStatus.Created && (
          <StepperButton
            label="Submit"
            onClick={handleSubmit(onSubmit)}
            disabled={!formState.isValid}
          />
        )}
      </Stack>
    </Stack>
  );
};

const OwnerFinalizeContent = ({
  task,
  userAddress,
  plugin
}: UserSubmitContentProps) => {
  const [searchParams] = useSearchParams();

  const [finalizeTask, { error, isError, isLoading, reset }] =
    useFinalizeTaskMutation();

  const onSubmit = async () => {
    finalizeTask({
      task,
      onboardingQuestAddress: searchParams.get(
        RequiredQueryParams.OnboardingQuestAddress
      ),
      pluginAddress: plugin.pluginAddress,
      pluginDefinitionId: plugin.pluginDefinitionId
    });
  };

  return (
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
      <ErrorDialog handleClose={() => reset()} open={isError} message={error} />
      <LoadingDialog open={isLoading} message="Submitting task..." />
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
          <Typography color="white" variant="body" textAlign="center" p="20px">
            {task?.metadata?.description}
          </Typography>

          <Typography color="white" variant="body" textAlign="center" p="20px">
            {task?.submission?.description}
          </Typography>
        </CardContent>
      </Card>

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
        {task?.status === TaskStatus.Submitted && (
          <StepperButton label="Finalize" onClick={onSubmit} />
        )}
      </Stack>
    </Stack>
  );
};

const OpenTask = ({ plugin }: PluginParams) => {
  const [searchParams] = useSearchParams();
  const { account: userAddress } = useEthers();
  const isAdmin = useSelector(IsAdmin);

  const params = useParams();

  const { task } = useGetAllTasksPerQuestQuery(
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

          {!isAdmin && (
            <UserSubmitContent
              task={task}
              plugin={plugin}
              userAddress={userAddress}
            />
          )}

          {isAdmin && (
            <OwnerFinalizeContent
              task={task}
              plugin={plugin}
              userAddress={userAddress}
            />
          )}
        </>
      ) : (
        <AutLoading></AutLoading>
      )}
    </Container>
  );
};

export default memo(OpenTask);