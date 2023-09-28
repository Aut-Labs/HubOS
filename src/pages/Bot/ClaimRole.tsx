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
import { CommunityData } from "@store/Community/community.reducer";
import { autUrls } from "@api/environment";
import { Init } from "@aut-labs/d-aut";
import { EnvMode, environment } from "@api/environment";
import { useEffect, useState } from "react";
import { AutID } from "@api/aut.model";
import { getAppConfig } from "@api/aut.api";
import { NetworkConfig } from "@api/ProviderFactory/network.config";
import { setNetworks } from "@store/WalletProvider/WalletProvider";
import { generateNetworkConfig } from "@api/ProviderFactory/setup.config";
import AutSDK from "@aut-labs/sdk";
import Web3DautConnect from "@api/ProviderFactory/web3-daut-connect";
import { useAppDispatch } from "@store/store.model";
import { useOAuth } from "@components/Oauth2/oauth2";
import { claimDiscordServerRole } from "@api/discord.api";
import { resetState } from "@store/store";
import { AUTH_TOKEN_KEY } from "@api/auth.api";

const ClaimRole = () => {
  // const [config, setConfig] = useState<any>();
  const [isLoading, setLoading] = useState(false);
  const { getAuth, authenticating } = useOAuth();
  const [roleClaimed, setRoleClaimed] = useState(false);
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  // const [error, setError] = useState(false);

  const handleAddBot = async () => {
    // const apiUrl = "http://localhost:4006/guild"; // Replace with your API endpoint URL
    // console.log("communityData", communityData);
    // const roles = communityData?.properties.rolesSets[0].roles.map((role) => {
    //   return { name: role.roleName, id: role.id };
    // });
    // let discordLink = communityData?.properties.socials.find(
    //   (l) => l.type === "discord"
    // ).link;
    // if (!discordLink) {
    //   discordLink = "https://discord.gg/4FymGpfA";
    // }
    // debugger;
    // const serverCode = discordLink.match(/discord\.gg\/(.+)/i)[1];
    // const serverIdResponse = await axios.get(
    //   `https://discord.com/api/invites/${serverCode}`
    // );
    // const guildId = serverIdResponse.data.guild.id;
    // const requestObject = {
    //   daoAddress: communityData?.properties.address,
    //   roles: roles,
    //   guildId
    // };
    // debugger;
    // try {
    //   const result = await axios.post(apiUrl, requestObject);
    //   const discordBotLink =
    //     "https://discord.com/api/oauth2/authorize?client_id=1129037421615529984&permissions=8&scope=bot%20applications.commands";
    //   window.open(discordBotLink, "_blank");
    // } catch (e) {
    //   console.log(e);
    // }
  };

  const onAutLogin = async ({ detail }: any) => {
    const profile = JSON.parse(JSON.stringify(detail));
    const autID = new AutID(profile);
    autID.properties.communities = autID.properties.communities.filter((c) => {
      return c.properties.userData?.isActive;
    });

    autID.properties.address = profile.address;
    autID.properties.network = profile.network?.network?.toLowerCase();

    const daoAddress = searchParams.get("daoAddress");
    await getAuth(
      async (data) => {
        const { access_token } = data;
        setLoading(true);
        const result = await dispatch(
          claimDiscordServerRole({
            accessToken: access_token,
            daoAddress,
            autId: autID
          })
        );
        if (result.meta.requestStatus === "rejected") {
          // setLoading(false);
          // if (result.payload === "User is not an admin.") {
          //   setError("inviteLink", {
          //     type: "custom",
          //     message: "You are not an admin in this server."
          //   });
          // }
        } else {
          setLoading(false);
          setRoleClaimed(true);
          // const community = { ...communityData };
          // for (let i = 0; i < community.properties.socials.length; i++) {
          //   const element = community.properties.socials[i];
          //   if (element.type === "discord") {
          //     element.link = values.inviteLink;
          //   }
          // }
          // const communityUpdateResult = await dispatch(
          //   updateDiscordSocials({ community, inviteLink })
          // );
          // if (communityUpdateResult.meta.requestStatus !== "rejected") {
          //   handleClose();
          // }
          // setLoading(false);
        }
      },
      () => {
        // setLoading(false);
      }
    );

    // if (profile.network) {
    //   const walletName = localStorage.getItem("wagmi.wallet").replace(/"/g, "");
    //   const [network] = networks.filter((d) => !d.disabled);
    //   if (walletName) {
    //     const c = connectors.find((c) => c.id === walletName);
    //     if (c && !isConnected) {
    //       const client = await connectAsync({
    //         connector: c,
    //         chainId: c.chains[0].id
    //       });

    //       client["transport"] = client["provider"];
    //       const temp_signer = walletClientToSigner(
    //         client as unknown as WalletClient
    //       );
    //       await initialiseSDK(network, temp_signer);
    //     }
    //   }

    //   const itemsToUpdate = {
    //     sdkInitialized: true,
    //     selectedNetwork: network
    //   };
    //   await dispatch(updateWalletProviderState(itemsToUpdate));

    //   await dispatch(
    //     communityUpdateState({
    //       communities: autID.properties.communities,
    //       selectedCommunityAddress:
    //         autID.properties.communities[0].properties?.address
    //     })
    //   );

    //   const cache = await getCache(
    //     CacheTypes.UserPhases,
    //     autID.properties.address
    //   );
    //   await dispatch(
    //     setAuthenticated({
    //       cache,
    //       isAuthenticated: true,
    //       userInfo: autID
    //     })
    //   );
  };

  const onDisconnected = async () => {
    // /    await disconnectAsync();
    // setLoading(false);
    setRoleClaimed(false);
    dispatch(resetState);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  useEffect(() => {
    // window.addEventListener("aut_profile", onAutMenuProfile);
    // window.addEventListener("aut-Init", onAutInit);
    window.addEventListener("aut-onConnected", onAutLogin);
    window.addEventListener("aut-onDisconnected", onDisconnected);

    const config: any = {
      defaultText: "Connect Wallet",
      textAlignment: "right",
      menuTextAlignment: "left",
      theme: {
        color: "offWhite",
        // color: 'nightBlack',
        // color: colors.amber['500'],
        // color: '#7b1fa2',
        type: "main"
      },
      // size: "default" // large & extraLarge or see below
      size: {
        width: 240,
        height: 50,
        padding: 3
      }
    };

    Init({
      config
    });

    return () => {
      // window.removeEventListener("aut_profile", onAutMenuProfile);
      // window.removeEventListener("aut-Init", onAutInit);
      window.removeEventListener("aut-onConnected", onAutLogin);
      window.removeEventListener("aut-onDisconnected", onAutLogin);
      // if (abort.current) {
      //   abort.current.abort();
      // }
    };
  }, []);

  return (
    <Container maxWidth="md">
      <LoadingDialog open={isLoading} message="Setting role..." />
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
        <Typography mt={7} textAlign="center" color="white" variant="h3">
          Claim your Āut Role
        </Typography>
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
        )}

        <d-aut
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
        />
      </Stack>
    </Container>
  );
};

export default ClaimRole;
