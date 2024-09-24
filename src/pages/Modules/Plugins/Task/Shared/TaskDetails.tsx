import { TaskContributionNFT } from "@aut-labs/sdk";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { memo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { HubData } from "@store/Hub/hub.reducer";

interface TaskDetailsParams {
  task: TaskContributionNFT;
}

const TaskDetails = ({ task }: TaskDetailsParams) => {
  const hubData = useSelector(HubData);
  const isLoading = false;

  return (
    <>
      {isLoading ? (
        <CircularProgress className="spinner-center" size="60px" />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            mb: 4,
            position: "relative",
            mx: "auto",
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
              to={`/${hubData?.name}/tasks`}
              component={Link}
            >
              {/* {searchParams.get("returnUrlLinkName") || "Back"} */}
              <Typography color="white" variant="body">
                Back
              </Typography>
            </Button>
            <Typography textAlign="center" color="white" variant="h3">
              {task?.name}
            </Typography>
          </Stack>

          <Typography
            mt={2}
            mx="auto"
            textAlign="center"
            color="white"
            sx={{
              width: {
                xs: "100%",
                sm: "700px",
                xxl: "1000px"
              }
            }}
            variant="body"
          >
            {task?.description}
          </Typography>

          {/* <OverflowTooltip
          typography={{
            maxWidth: "400px"
          }}
          text={task?.metadata?.description}
        /> */}
        </Box>
      )}
    </>
  );
};

export default memo(TaskDetails);
