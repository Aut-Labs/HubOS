import {
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography
} from "@mui/material";
import LoadingDialog from "@components/Dialog/LoadingPopup";
// import "./Contracts.scss";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { autUrls } from "@api/environment";
import { Init } from "@aut-labs/d-aut";
import { EnvMode, environment } from "@api/environment";
import { useEffect, useState } from "react";
import AutSDK from "@aut-labs/sdk";
import Web3DautConnect from "@api/ProviderFactory/web3-daut-connect";
import { useAppDispatch } from "@store/store.model";
import { useOAuth, useOAuthSocials } from "@components/Oauth2/oauth2";
// import { claimDiscordServerRole } from "@api/discord.api";
import { resetState } from "@store/store";
import { AUTH_TOKEN_KEY } from "@api/auth.api";
import {
  AutWalletConnector,
  useAutConnector,
  useWalletConnector
} from "@aut-labs/connector";
import { NetworksConfig } from "@store/WalletProvider/WalletProvider";
import AppTitle from "@components/AppTitle";
import AutLoading from "@components/AutLoading";
import { AutOsButton } from "@components/buttons";
import { useMutation } from "@tanstack/react-query";
import { Height } from "@mui/icons-material";

const ClaimRole = () => {
  // const [config, setConfig] = useState<any>();

  const { mutateAsync: claimRole } = useMutation<any, void, any>({
    mutationFn: (claimRoleRequest) => {
      return axios
        .post(`${environment.apiUrl}/discord/get-role`, claimRoleRequest)
        .then((res) => res.data);
    }
  });
  const [isLoading, setLoading] = useState(false);
  const { getAuthDiscord, authenticating } = useOAuthSocials();
  const [roleClaimed, setRoleClaimed] = useState(false);
  const dispatch = useAppDispatch();
  const networks = useSelector(NetworksConfig);
  const [searchParams] = useSearchParams();
  const hubAddress = searchParams.get("hub-address");

  const {
    open,
    state: { authSig }
  } = useWalletConnector();

  const handleConnect = async () => {
    const state = await open();
    await getAuthDiscord(
      async (data) => {
        debugger;
        const { access_token } = data;
        setLoading(true);
        const requestModel = {
          discordAccessToken: access_token,
          hubAddress,
          authSig
        };
        const result = await claimRole(requestModel, {
          onSuccess: (response) => {
            setLoading(false);
            setRoleClaimed(true);
          },
          onError: (res) => {
            setLoading(false);
          }
        });
      },
      () => {
        setLoading(false);
      }
    );
  };

  return (
    <Container maxWidth="md">
      <LoadingDialog open={isLoading} message="Setting role..." />
      <Stack
        sx={{
          justifyContent: "center",
          alignItems: "center",
          margin: "0 auto",
          height: "100vh",
          width: {
            xs: "100%",
            sm: "400px",
            xxl: "500px"
          }
        }}
      >
        {roleClaimed ? (
          <Stack
            sx={{
              justifyContent: "center",
              alignItems: "center",
              margin: "0 auto",
              width: {
                xs: "100%",
                sm: "400px",
                xxl: "500px"
              }
            }}
          >
            <Typography
              mt={2}
              mb={4}
              textAlign="center"
              color="white"
              variant="caption"
            >
              Success! Role was successfully assigned. Go back to your discord
              server and check it out.
            </Typography>
          </Stack>
        ) : (
          <>
            <Typography mt={7} textAlign="center" color="white" variant="h3">
              Get your Āut Role within your discord server
            </Typography>
            <Typography
              mt={2}
              mb={4}
              textAlign="center"
              color="white"
              variant="caption"
            >
              Connect with your Āut ID to claim your role in the Discord server
              and gain access to community interactions.
            </Typography>
          </>
        )}

        {/* <d-aut
          style={{
            // display: "none",
            // position: "absolute",
            // width: "300px",
            zIndex: 99999
          }}
          id="d-aut-role"
          use-dev={environment.env == EnvMode.Development}
          // menu-items='[{"name":"Profile","actionType":"event_emit","eventName":"aut_profile"}]'
          flow-config='{"mode" : "sas", "customCongratsMessage": ""}'
          ipfs-gateway="https://ipfs.nftstorage.link/ipfs"
          button-type="simple"
        /> */}
        {!roleClaimed && (
          <AutOsButton onClick={handleConnect}>Claim Discord Role</AutOsButton>
        )}
      </Stack>
    </Container>
  );
};

export default ClaimRole;
