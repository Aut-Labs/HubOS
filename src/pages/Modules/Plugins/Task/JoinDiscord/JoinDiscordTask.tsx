import { useGetAllTasksPerQuestQuery } from "@api/onboarding.api";
import { PluginDefinition } from "@aut-labs-private/sdk";
import AutLoading from "@components/AutLoading";
import { AutButton } from "@components/buttons";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import { StepperButton } from "@components/Stepper";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormHelperText,
  Stack,
  Typography
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { IsAdmin } from "@store/Community/community.reducer";
import { memo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import { Link, useParams, useSearchParams } from "react-router-dom";
import TaskDetails from "../Shared/TaskDetails";

interface PluginParams {
  plugin: PluginDefinition;
}

const JoinDiscordTask = ({ plugin }: PluginParams) => {
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
      inviteClicked: false
    }
  });
  const values = useWatch({
    name: "inviteClicked",
    control
  });
  const onSubmit = async () => {
    console.log("JoinDiscordTask onSubmit Values: ", values);
    //submit
  };

  const setButtonClicked = () => {
    setValue("inviteClicked", true);
  };

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
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center"
                  }}
                >
                  <Button
                    startIcon={<OpenInNewIcon></OpenInNewIcon>}
                    sx={{
                      width: "200px",
                      height: "50px"
                    }}
                    type="button"
                    color="offWhite"
                    variant="outlined"
                    component={Link}
                    target="_blank"
                    to={`https://discord.gg/${
                      (task as any)?.metadata?.properties?.inviteUrl
                    }`}
                    onClick={setButtonClicked}
                  >
                    Join Discord
                  </Button>
                </Box>
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
              <StepperButton
                label="Submit"
                onClick={handleSubmit(onSubmit)}
                disabled={!values}
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

export default memo(JoinDiscordTask);
