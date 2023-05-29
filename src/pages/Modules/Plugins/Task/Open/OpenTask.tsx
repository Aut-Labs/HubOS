/* eslint-disable max-len */
import {
  useFinaliseOpenTaskMutation,
  useGetAllTasksPerQuestQuery,
  useSubmitOpenTaskMutation
} from "@api/onboarding.api";
import { PluginDefinition, Task } from "@aut-labs-private/sdk";
import AutLoading from "@components/AutLoading";
import { StepperButton } from "@components/Stepper";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Link,
  Stack,
  Typography,
  useTheme
} from "@mui/material";
import { IsAdmin } from "@store/Community/community.reducer";
import { AutTextField } from "@theme/field-text-styles";
import { memo, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { ipfsCIDToHttpUrl } from "@api/storage.api";
import CopyAddress from "@components/CopyAddress";
import IosShareIcon from "@mui/icons-material/IosShare";

interface PluginParams {
  plugin: PluginDefinition;
}

interface UserSubmitContentProps {
  task: Task;
  userAddress: string;
  submission?: Task;
  plugin: PluginDefinition;
}

export const taskStatuses: any = {
  [TaskStatus.Created]: {
    label: "To Do",
    color: "info"
  },
  [TaskStatus.Finished]: {
    label: "Approved",
    color: "success"
  },
  [TaskStatus.Submitted]: {
    label: "Pending",
    color: "warning"
  },
  [TaskStatus.Taken]: {
    label: "Taken",
    color: "info"
  }
};

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
    useSubmitOpenTaskMutation();

  const onSubmit = async (values) => {
    submitTask({
      task: {
        ...task,
        submission: {
          name: "Open task submission",
          description: values.openTask,
          properties: {
            submitter: userAddress
          } as any
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

      {task?.status === TaskStatus.Created ||
      task?.status === TaskStatus.Taken ? (
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
                maxLength: 257
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
      ) : (
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
            {(task as any)?.status === TaskStatus.Finished && (
              <Stack direction="column" alignItems="flex-end" mb="15px">
                <Chip label="Approved" color="success" size="small" />
              </Stack>
            )}

            <Stack direction="column" alignItems="center" mb="15px">
              <Typography
                color="white"
                variant="body"
                textAlign="center"
                p="5px"
              >
                {task?.metadata?.description}
              </Typography>
              <Typography variant="caption" className="text-secondary">
                Task Description
              </Typography>
            </Stack>

            <Stack direction="column" alignItems="center">
              <Typography
                color="white"
                variant="body"
                textAlign="center"
                p="5px"
              >
                {task?.submission?.description}
              </Typography>
              <Typography variant="caption" className="text-secondary">
                My Submission
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

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
        {(task?.status === TaskStatus.Created ||
          task?.status === TaskStatus.Taken) && (
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
  submission,
  userAddress,
  plugin
}: UserSubmitContentProps) => {
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isAdmin = useSelector(IsAdmin);

  const [finalizeTask, { error, isError, isLoading, reset }] =
    useFinaliseOpenTaskMutation();

  const { isLoading: isLoadingTasks } = useGetAllTasksPerQuestQuery(
    {
      userAddress,
      isAdmin,
      pluginAddress: searchParams.get(
        RequiredQueryParams.OnboardingQuestAddress
      ),
      questId: +searchParams.get(RequiredQueryParams.QuestId)
    },
    {
      selectFromResult: ({ isLoading, isFetching }) => ({
        isLoading: isLoading || isFetching
      })
    }
  );

  const onSubmit = async () => {
    finalizeTask({
      userAddress,
      isAdmin: true,
      questId: +searchParams.get(RequiredQueryParams.QuestId),
      task: submission,
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
        justifyContent: "space-between",
        margin: "0 auto",
        width: {
          xs: "100%",
          sm: "600px",
          xxl: "800px"
        }
      }}
    >
      <ErrorDialog handleClose={() => reset()} open={isError} message={error} />
      <LoadingDialog open={isLoading} message="Finalizing task..." />
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
          {submission && (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb="4"
            >
              <Typography
                sx={{
                  display: "flex",
                  gridGap: 4
                }}
                variant="body"
                color="white"
              >
                Submitter:{" "}
                <CopyAddress
                  color={theme.palette.primary.main}
                  address={submission.submitter}
                />
              </Typography>
              <Chip
                sx={{
                  ml: 1
                }}
                label={taskStatuses[submission?.status].label}
                color={taskStatuses[submission?.status].color}
                size="small"
              />
            </Stack>
          )}

          {!submission && (
            <>
              <Stack direction="column" alignItems="center">
                {task?.metadata?.properties.attachmentType === "url" && (
                  <Box
                    sx={{
                      display: "grid",
                      alignItems: "center",
                      justifyContent: "center",
                      gridTemplateColumns: "1fr",
                      my: 2
                    }}
                  >
                    <Stack
                      direction="column"
                      justifyContent="center"
                      alignItems="center"
                      gap={0.5}
                    >
                      <Typography
                        fontFamily="FractulRegular"
                        color="primary"
                        variant="subtitle2"
                        maxWidth="120px"
                      >
                        <Box
                          sx={{
                            background: "#43A047",
                            width: "60px",
                            height: "25px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "16px"
                          }}
                        >
                          URL
                        </Box>
                      </Typography>
                      <Typography variant="caption" className="text-secondary">
                        Attachment type
                      </Typography>
                    </Stack>
                  </Box>
                )}
                {task?.metadata?.properties.attachmentType === "text" && (
                  <Box
                    sx={{
                      display: "grid",
                      alignItems: "center",
                      justifyContent: "center",
                      gridTemplateColumns: "1fr",
                      my: 2
                    }}
                  >
                    <Stack
                      direction="column"
                      justifyContent="center"
                      alignItems="center"
                      gap={0.5}
                    >
                      <Typography
                        fontFamily="FractulRegular"
                        color="primary"
                        variant="subtitle2"
                        maxWidth="120px"
                      >
                        <Box
                          sx={{
                            background: "#1E88E5",
                            width: "60px",
                            height: "25px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "16px"
                          }}
                        >
                          DOC
                        </Box>
                      </Typography>
                      <Typography variant="caption" className="text-secondary">
                        Attachment type
                      </Typography>
                    </Stack>
                  </Box>
                )}
                {task?.metadata?.properties.attachmentType === "image" && (
                  <Box
                    sx={{
                      display: "grid",
                      alignItems: "center",
                      justifyContent: "center",
                      gridTemplateColumns: "1fr",
                      my: 2
                    }}
                  >
                    <Stack
                      direction="column"
                      justifyContent="center"
                      alignItems="center"
                      gap={0.5}
                    >
                      <Typography
                        fontFamily="FractulRegular"
                        color="primary"
                        variant="subtitle2"
                        maxWidth="120px"
                      >
                        <Box
                          sx={{
                            background: "#E53834",
                            width: "60px",
                            height: "25px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "16px"
                          }}
                        >
                          IMG
                        </Box>
                      </Typography>
                      <Typography variant="caption" className="text-secondary">
                        Attachment type
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </Stack>
              {/* <Stack direction="column" alignItems="center">
                <Box
                  sx={{
                    display: "grid",
                    alignItems: "center",
                    justifyContent: "center",
                    gridTemplateColumns: "1fr",
                    my: 2
                  }}
                >
                  <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    gap={0.5}
                  >
                    <Typography variant="caption" className="text-secondary">
                      Attachment type
                    </Typography>
                  </Stack>
                </Box>
              </Stack> */}
            </>
          )}

          {submission && (
            <Stack direction="column" alignItems="center">
              {submission?.metadata?.properties.attachmentType === "url" && (
                <Box
                  sx={{
                    display: "grid",
                    alignItems: "center",
                    justifyContent: "center",
                    gridTemplateColumns: "1fr 1fr",
                    my: 2
                  }}
                >
                  <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    gap={0.5}
                  >
                    <Typography
                      fontFamily="FractulRegular"
                      color="primary"
                      variant="subtitle2"
                      maxWidth="120px"
                    >
                      <Box
                        sx={{
                          background: "#43A047",
                          width: "60px",
                          height: "25px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "4px",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "16px"
                        }}
                      >
                        URL
                      </Box>
                    </Typography>
                    <Typography variant="caption" className="text-secondary">
                      Attachment type
                    </Typography>
                  </Stack>
                  <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    gap={0.5}
                  >
                    <Typography
                      fontFamily="FractulRegular"
                      color="primary"
                      variant="subtitle2"
                    >
                      <Link
                        color="primary"
                        sx={{
                          mt: 1,
                          cursor: "pointer"
                        }}
                        variant="body"
                        target="_blank"
                        href={submission?.submission?.properties["externalUrl"]}
                      >
                        Open link
                      </Link>
                    </Typography>
                    <Typography variant="caption" className="text-secondary">
                      Source
                    </Typography>
                  </Stack>
                </Box>
              )}
              {submission?.metadata?.properties.attachmentType === "text" && (
                <Box
                  sx={{
                    display: "grid",
                    alignItems: "center",
                    justifyContent: "center",
                    gridTemplateColumns: "1fr 1fr",
                    my: 2
                  }}
                >
                  <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    gap={0.5}
                  >
                    <Typography
                      fontFamily="FractulRegular"
                      color="primary"
                      variant="subtitle2"
                      maxWidth="120px"
                    >
                      <Box
                        sx={{
                          background: "#1E88E5",
                          width: "60px",
                          height: "25px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "4px",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "16px"
                        }}
                      >
                        DOC
                      </Box>
                    </Typography>
                    <Typography variant="caption" className="text-secondary">
                      Attachment type
                    </Typography>
                  </Stack>
                  {/* <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    gap={0.5}
                  >
                    <Typography
                      fontFamily="FractulRegular"
                      color="primary"
                      variant="subtitle2"
                    >
                      <Link
                        color="primary"
                        sx={{
                          mt: 1,
                          cursor: "pointer"
                        }}
                        variant="body"
                        target="_blank"
                        href={ipfsCIDToHttpUrl(
                          submission?.submission?.properties["fileUri"]
                        )}
                      >
                        Download
                      </Link>
                    </Typography>
                    <Typography variant="caption" className="text-secondary">
                      Action
                    </Typography>
                  </Stack> */}
                  <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    gap={0.5}
                  >
                    <Typography
                      fontFamily="FractulRegular"
                      color="primary"
                      variant="subtitle2"
                    >
                      <Link
                        color="primary"
                        sx={{
                          mt: 1,
                          cursor: "pointer"
                        }}
                        variant="body"
                        target="_blank"
                        href={ipfsCIDToHttpUrl(
                          submission?.submission?.properties["fileUri"]
                        )}
                      >
                        View in IPFS
                      </Link>
                    </Typography>
                    <Typography variant="caption" className="text-secondary">
                      Source
                    </Typography>
                  </Stack>
                </Box>
              )}
              {submission?.metadata?.properties.attachmentType === "image" && (
                <Box
                  sx={{
                    display: "grid",
                    alignItems: "center",
                    justifyContent: "center",
                    gridTemplateColumns: "1fr 1fr",
                    my: 2
                  }}
                >
                  <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    gap={0.5}
                  >
                    <Typography
                      fontFamily="FractulRegular"
                      color="primary"
                      variant="subtitle2"
                      maxWidth="120px"
                    >
                      <Box
                        sx={{
                          background: "#E53834",
                          width: "60px",
                          height: "25px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "4px",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "16px"
                        }}
                      >
                        IMG
                      </Box>
                    </Typography>
                    <Typography variant="caption" className="text-secondary">
                      Attachment type
                    </Typography>
                  </Stack>
                  {/* <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    gap={0.5}
                  >
                    <Typography
                      fontFamily="FractulRegular"
                      color="primary"
                      variant="subtitle2"
                    >
                      <Link
                        color="primary"
                        sx={{
                          mt: 1,
                          cursor: "pointer"
                        }}
                        variant="body"
                        target="_blank"
                        href={ipfsCIDToHttpUrl(
                          submission?.submission?.properties["fileUri"]
                        )}
                      >
                        Download
                      </Link>
                    </Typography>
                    <Typography variant="caption" className="text-secondary">
                      Action
                    </Typography>
                  </Stack> */}
                  <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    gap={0.5}
                  >
                    <Typography
                      fontFamily="FractulRegular"
                      color="primary"
                      variant="subtitle2"
                    >
                      <Link
                        color="primary"
                        sx={{
                          mt: 1,
                          cursor: "pointer"
                        }}
                        variant="body"
                        target="_blank"
                        href={ipfsCIDToHttpUrl(
                          submission?.submission?.properties["fileUri"]
                        )}
                      >
                        View in IPFS
                      </Link>
                    </Typography>
                    <Typography variant="caption" className="text-secondary">
                      Source
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Stack>
          )}

          {submission && (
            <Stack direction="column" alignItems="center">
              <Typography
                color="white"
                variant="body"
                textAlign="center"
                p="5px"
              >
                {submission?.submission?.description || "No description"}
              </Typography>
              <Typography variant="caption" className="text-secondary">
                Submission description
              </Typography>
            </Stack>
          )}
        </CardContent>
      </Card>

      <Stack
        flexDirection="row"
        justifyContent="flex-end"
        sx={{
          justifyContent: "flex-end",
          width: {
            xs: "100%",
            sm: "600px",
            xxl: "800px"
          }
        }}
      >
        {submission?.status === TaskStatus.Submitted && (
          <StepperButton
            disabled={isLoadingTasks}
            label="Finalize"
            onClick={onSubmit}
          />
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

  const { task, submission } = useGetAllTasksPerQuestQuery(
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
        submission: (data?.submissions || []).find((t) => {
          const [pluginType] = location.pathname.split("/").splice(-2);
          return (
            t.submitter === searchParams.get("submitter") &&
            t.taskId === +params?.taskId &&
            PluginDefinitionType[pluginType] ===
              taskTypes[t.taskType].pluginType
          );
        }),
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

  console.log(task, submission, isAdmin);

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
          <TaskDetails task={submission || task} />

          {!isAdmin && (
            <UserSubmitContent
              task={submission || task}
              plugin={plugin}
              userAddress={userAddress}
            />
          )}

          {isAdmin && (
            <OwnerFinalizeContent
              task={task}
              submission={submission}
              plugin={plugin}
              userAddress={userAddress}
            />
          )}
        </>
      ) : (
        <AutLoading width="130px" height="130px"></AutLoading>
      )}
    </Container>
  );
};

export default memo(OpenTask);
