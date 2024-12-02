import { Card, CardContent, Link, Stack, Typography } from "@mui/material";
import { memo, useMemo } from "react";

const GithubTaskView = ({
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
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <Stack direction="column" alignItems="center" mb="15px">
            <Typography
              color="white"
              variant="subtitle2"
              textAlign="center"
              p="5px"
            >
              {contributionSubmissionContent?.repo}
            </Typography>
            <Typography variant="caption" className="text-secondary">
              Repository
            </Typography>
          </Stack>
          <Stack direction="column" alignItems="center" mb="15px">
            <Typography
              color="white"
              variant="subtitle2"
              textAlign="center"
              p="5px"
            >
              {contributionSubmissionContent?.authenticatedUser}
            </Typography>
            <Typography variant="caption" className="text-secondary">
              Authenticated User
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default memo(GithubTaskView);
