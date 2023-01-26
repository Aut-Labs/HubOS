/* eslint-disable no-alert */

import { useEffect, useState } from "react";
import { getUser, oauthGetToken } from "@api/discord.api";
import {
  AutIDContractEventType,
  Web3AutIDProvider
} from "@aut-protocol/abi-types";
import { getAutAddress, AutExists } from "@api/aut.api";
import { useDispatch } from "react-redux";
import { openSnackbar } from "@store/ui-reducer";
import { Box } from "@mui/system";
import { CircularProgress, Typography } from "@mui/material";

function Redirect() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const getUserID = async (code) => {
    const accessToken = await oauthGetToken(code);
    const user = await getUser(accessToken);
    return user.id;
  };

  const addDiscordIDToAut = async (discordId) => {
    const AutAddress = await getAutAddress();

    const contract = await Web3AutIDProvider(AutAddress, {
      event: AutIDContractEventType.DiscordIDConnectedToAutID
    });
    const response = await contract.addDiscordIDToAutID(discordId);
    if (response) {
      dispatch(
        openSnackbar({
          message: `Congrats, you've connected your Aut to your Discord ID!`,
          severity: "success",
          duration: 30000
        })
      );
    } else {
      dispatch(
        openSnackbar({
          message: `Please try again.`,
          severity: "error",
          duration: 30000
        })
      );
    }
    setLoading(false);
  };

  const connectSWToDiscord = async (code) => {
    // await changeNetwork();
    const userID = await getUserID(code);
    if (userID) {
      const exists = await AutExists();
      if (exists) {
        await addDiscordIDToAut(userID);
      } else {
        setLoading(false);
        dispatch(
          openSnackbar({
            message: `Aut not found. Make sure the correct address is selected.`,
            severity: "error",
            duration: 30000
          })
        );
      }
    } else {
      setLoading(false);
      dispatch(
        openSnackbar({
          message: `'Please authetnicate with Discord again!'`,
          severity: "error",
          duration: 30000
        })
      );
    }
  };

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get("code");
    if (!code) return;
    connectSWToDiscord(code);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%"
      }}
    >
      <Typography variant="h2">Discord Integration Redirect Page</Typography>
      {loading && <CircularProgress />}
    </Box>
  );
}

export default Redirect;
