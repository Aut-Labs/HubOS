import { Box, Container, Stack, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import Tasks from "../../Task/Shared/Tasks";
import { useGetAllTasksQuery } from "@api/onboarding.api";
import { IsAdmin } from "@store/Community/community.reducer";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import AutLoading from "@components/AutLoading";

export const AllTasks = () => {
  const isAdmin = useSelector(IsAdmin);
  const { address } = useAccount();
  const { data, isLoading } = useGetAllTasksQuery(
    {
      userAddress: address,
      isAdmin
    },
    {
      refetchOnMountOrArgChange: true
    }
  );
  const [searchState, setSearchState] = useState({
    title: ""
  });

  const filteredTasks = useMemo(() => {
    return (data?.tasks || [])?.filter((q) =>
      (q?.metadata?.name || "")
        ?.toLowerCase()
        ?.includes(searchState?.title?.toLowerCase())
    );
  }, [data?.tasks, searchState]);

  return (
    <Container
      sx={{
        py: "20px",
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}
      maxWidth="lg"
    >
      {isLoading ? (
        <AutLoading width="130px" height="130px" />
      ) : (
        <>
          <Stack alignItems="center" justifyContent="center">
            {/* <Button
                startIcon={<ArrowBackIcon />}
                color="offWhite"
                sx={{
                  position: {
                    sm: "absolute"
                  },
                  left: {
                    sm: "0"
                  }
                }}
                to={{
                  pathname: `/${communityData?.name}/modules/OnboardingStrategy/QuestOnboardingPlugin`,
                  search: searchParams.toString()
                }}
                component={Link}
              ></Button> */}
            <Typography textAlign="center" color="white" variant="h3">
              Tasks
            </Typography>
          </Stack>
          <Box>
            {!isLoading && !!data?.tasks?.length && !filteredTasks?.length && (
              <Box
                sx={{
                  display: "flex",
                  gap: "20px",
                  pt: 12,
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Typography color="rgb(107, 114, 128)" variant="subtitle2">
                  No tasks found!
                </Typography>
              </Box>
            )}

            <Tasks
              isAdmin={isAdmin}
              canAdd={false}
              canDelete={false}
              isLoading={isLoading}
              tasks={filteredTasks}
            />
          </Box>

          {!isLoading && !data?.tasks?.length && (
            <Box
              sx={{
                display: "flex",
                gap: "20px",
                pt: 12,
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Typography className="text-secondary" variant="subtitle2">
                No submissions yet...
              </Typography>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};
