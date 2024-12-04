import {
  Card,
  CardContent,
  Container,
  Link,
  Stack,
  Typography
} from "@mui/material";
import TaskDetails from "../Shared/TaskDetails";
import ContributionDetails from "../Contributions/ContributionDetails";
import { memo, useMemo } from "react";
import { sub } from "date-fns";

const OpenTaskView = ({
  contribution,
  submission
}: {
  contribution: any;
  submission: any;
}) => {
  const contributionSubmissionContent = useMemo(() => {
    let userSubmit = null;
    try {
      userSubmit = JSON.parse(submission?.data);
    } catch (e) {
      // pass
    }
    return userSubmit;
  }, [submission]);
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
          sm: "600px",
          xxl: "800px"
        }
      }}
    >
      <Card
        sx={{
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
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
          {/* this will be implemented once give contribution is completed */}
          {/* {contribution?.status === TaskStatus.Finished && (
          <Stack direction="column" alignItems="flex-end" mb="15px">
            <Chip label="Approved" color="success" size="small" />
          </Stack>
        )} */}
          <Stack direction="column" alignItems="center" mb="15px">
            <Typography
              color="white"
              variant="subtitle2"
              textAlign="center"
              p="5px"
            >
              {contributionSubmissionContent?.description}
            </Typography>
            <Typography variant="caption" className="text-secondary">
              Description
            </Typography>
          </Stack>

          {contribution?.properties?.attachmentRequired && (
            <Stack direction="column" alignItems="center">
              <Typography
                color="white"
                variant="body"
                textAlign="center"
                p="5px"
              >
                <Link
                  color="primary"
                  sx={{
                    mt: 1,
                    cursor: "pointer"
                  }}
                  variant="subtitle2"
                  target="_blank"
                  //TODO: To uncomment when attachment ipfs url is correctly added to the metadata
                  // href={ipfsCIDToHttpUrl(
                  //   contributionSubmitContent?.attachment
                  // )}
                >
                  Open attachment
                </Link>
              </Typography>
              <Typography variant="caption" className="text-secondary">
                Attachment File
              </Typography>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default memo(OpenTaskView);
