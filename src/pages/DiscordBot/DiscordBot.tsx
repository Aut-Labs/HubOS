import { useEffect, memo, useMemo, useRef } from "react";
import Box from "@mui/material/Box";
import { useAppDispatch } from "@store/store.model";
import { Button, Container, Stack, styled, Typography } from "@mui/material";
import { setTitle } from "@store/ui-reducer";
import { useSelector } from "react-redux";
import { HubData } from "@store/Hub/hub.reducer";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AutOsButton } from "@components/buttons";
import RefreshIcon from "@mui/icons-material/Refresh";
import AutLoading from "@components/AutLoading";
import { ModuleDefinitionCard } from "../Modules/Shared/PluginCard";
import { environment } from "@api/environment";

const GridBox = styled(Box)(({ theme }) => {
  return {
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "1fr",
    gridGap: "30px",
    [theme.breakpoints.up("sm")]: {
      gridTemplateColumns: "repeat(2,minmax(0,1fr))"
    },
    [theme.breakpoints.up("lg")]: {
      gridTemplateColumns: "repeat(3,minmax(0,1fr))"
    }
  };
});

function DiscordBot({ data }) {
  const dispatch = useAppDispatch();
  const refetchIntervalRef = useRef(null);

  const filteredTasks = useMemo(() => {
    const discordTasks: any[] = [];

    if (data) {
      data.forEach((task) => {
        const taskType = task.metadata.properties.type;

        // Sort by specific task types
        if (taskType === "DiscordGatherings" || taskType === "DiscordPolls") {
          discordTasks.push(task);
        }
      });
    }

    return {
      discordTasks
    };
  }, [data]);

  const { mutateAsync: activateBot } = useMutation({
    mutationFn: () => {
      return new Promise((resolve) => {
        const discordBotLink =
          "https://discord.com/oauth2/authorize?client_id=1129037421615529984";
        window.open(discordBotLink, "_blank");
        resolve(true);
      });
    }
  });

  const hubData = useSelector(HubData);

  const guildId = useMemo(() => {
    const social = hubData.properties.socials.find((s) => s.type === "discord");
    return social.metadata.guildId;
  }, [hubData]);

  const {
    data: activeData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["checkBotActive"],
    queryFn: () => {
      return axios.get(`${environment.apiUrl}/discord/check/${guildId}`);
    },
    enabled: !!guildId
  });

  useEffect(() => {
    dispatch(setTitle(`Hub - Everything Discord bot related.`));
  }, [dispatch]);

  const handleAddBot = async () => {
    await activateBot();

    let attempts = 0;
    const maxAttempts = 12; // 2 minutes / 10 seconds = 12 attempts

    const checkBotStatus = async () => {
      attempts++;
      const result = await refetch();

      if (result.data?.data?.active) {
        clearInterval(refetchIntervalRef.current);
      } else if (attempts >= maxAttempts) {
        clearInterval(refetchIntervalRef.current);
      }
    };

    refetchIntervalRef.current = setInterval(checkBotStatus, 10000);

    // Clear interval after 2 minutes if it hasn't been cleared already
    setTimeout(() => {
      if (refetchIntervalRef.current) {
        clearInterval(refetchIntervalRef.current);
      }
    }, 120000);
  };

  useEffect(() => {
    return () => {
      if (refetchIntervalRef.current) {
        clearInterval(refetchIntervalRef.current);
      }
    };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: "20px" }}>
      <Box
        width="100%"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2
        }}
      >
        {!activeData?.data?.active && (
          <Stack gap={2} alignItems="center">
            <Typography textAlign="center" color="white" variant="h3">
              Discord Bot Inactive
            </Typography>
            <AutOsButton
              onClick={handleAddBot}
              type="button"
              textTransform="uppercase"
              color="primary"
              variant="outlined"
              sx={{
                mt: 6,
                width: "250px"
              }}
            >
              <Typography fontWeight="bold" fontSize="16px" lineHeight="26px">
                Connect Discord Bot
              </Typography>
            </AutOsButton>
          </Stack>
        )}

        {activeData?.data?.active && (
          <Stack gap={2}>
            <Typography textAlign="center" color="white" variant="h3">
              Discord Bot
            </Typography>
            {!isLoading && !data?.length && (
              <Box
                sx={{
                  display: "flex",
                  gap: "20px",
                  mt: 12,
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Typography color="rgb(107, 114, 128)" variant="subtitle2">
                  No task types were found...
                </Typography>
                <Button
                  size="medium"
                  color="offWhite"
                  startIcon={<RefreshIcon />}
                  sx={{
                    ml: 1
                  }}
                  disabled={isLoading}
                  onClick={refetch}
                >
                  Refresh
                </Button>
              </Box>
            )}

            {isLoading ? (
              <AutLoading width="130px" height="130px" />
            ) : (
              <>
                <GridBox sx={{ flexGrow: 1, mt: 4 }}>
                  {filteredTasks.discordTasks.map((taskType, index) => (
                    <ModuleDefinitionCard
                      key={`modules-plugin-${index}`}
                      isFetching={false}
                      taskType={taskType}
                    />
                  ))}
                </GridBox>
              </>
            )}
          </Stack>
        )}
      </Box>
    </Container>
  );
}

export default memo(DiscordBot);
