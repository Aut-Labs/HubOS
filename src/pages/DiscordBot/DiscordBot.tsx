import { useEffect, memo, useMemo } from "react";
import Box from "@mui/material/Box";
import { useAppDispatch } from "@store/store.model";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Stack,
  Typography,
  styled,
  useTheme
} from "@mui/material";
import { setTitle } from "@store/ui-reducer";
import { ipfsCIDToHttpUrl } from "@api/storage.api";
import LoadingProgressBar from "@components/LoadingProgressBar";
import AutLoading from "@components/AutLoading";
import { autUrls } from "@api/environment";
import AutTabs from "@components/AutTabs/AutTabs";
import { useSelector } from "react-redux";
import { HubData } from "@store/Hub/hub.reducer";
import { DAutAutID } from "@aut-labs/d-aut";
import useQueryHubMembers from "@hooks/useQueryHubMembers";
import HubOsTabs from "@components/HubOsTabs";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AutOsButton } from "@components/buttons";
import AutSDK, { Hub } from "@aut-labs/sdk";

function DiscordBot() {
  const dispatch = useAppDispatch();

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

  // const { mutateAsync: checkBotActive } = useMutation<any, void, string>({
  //   mutationFn: (guildId) => {
  //     return axios.get(`http://localhost:4005/api/discord/check/${guildId}`);
  //   }
  // });

  const hubData = useSelector(HubData);
  console.log(hubData, "hubData");

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
      return axios.get(`http://localhost:4005/api/discord/check/${guildId}`);
    },
    enabled: !!guildId
  });

  useEffect(() => {
    dispatch(setTitle(`Hub - Everything Discord bot related.`));
  }, [dispatch]);

  const handleAddBot = async () => {
    await activateBot();
  };

  const handleCheckBot = async () => {
    // const result = await checkBotActive("962324247152312410");
    // console.log(result, "result");
    refetch();
  };

  return (
    <Container maxWidth="lg" sx={{ py: "20px" }}>
      {/* <LoadingProgressBar isLoading={isLoading} /> */}

      {/* {isLoading ? (
        <AutLoading width="130px" height="130px" />
      ) : ( */}
      <Box
        width="100%"
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        {!activeData?.data?.active && (
          <AutOsButton
            onClick={handleAddBot}
            type="button"
            textTransform="uppercase"
            color="primary"
            // disabled={!formState.isValid}
            variant="outlined"
            sx={{
              width: "250px"
            }}
          >
            <Typography fontWeight="bold" fontSize="16px" lineHeight="26px">
              Connect Discord Bot
            </Typography>
          </AutOsButton>
        )}

        {activeData?.data?.active ? (
          <Typography textAlign="center" color="white" variant="h3">
            Bot is active
          </Typography>
        ) : (
          <AutOsButton
            onClick={handleCheckBot}
            type="button"
            textTransform="uppercase"
            color="primary"
            // disabled={!formState.isValid}
            variant="outlined"
            sx={{
              width: "250px"
            }}
          >
            <Typography fontWeight="bold" fontSize="16px" lineHeight="26px">
              Check Bot Active
            </Typography>
          </AutOsButton>
        )}
      </Box>
      {/* )} */}
    </Container>
  );
}

export default memo(DiscordBot);
