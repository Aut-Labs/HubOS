import { memo, useEffect, useLayoutEffect, useRef } from "react";
import { useAppDispatch } from "@store/store.model";
import { AutID } from "@api/aut.model";
import { Init } from "@aut-labs/d-aut";
import { useSelector } from "react-redux";
import {
  NetworksConfig,
  updateWalletProviderState
} from "@store/WalletProvider/WalletProvider";
import { debounce } from "@mui/material";
import { EnvMode, autUrls, environment } from "@api/environment";
import { useConnect } from "wagmi";
import AutSDK from "@aut-labs/sdk";
import { MultiSigner } from "@aut-labs/sdk/dist/models/models";
import { NetworkConfig } from "./network.config";
import { useAutConnector } from "@aut-labs/connector";
import { communityUpdateState } from "@store/Community/community.reducer";
import { getCache, CacheTypes } from "@api/cache.api";
import { setAuthenticated } from "@auth/auth.reducer";
import { resetState } from "@store/store";
import { AUTH_TOKEN_KEY } from "@api/auth.api";

function Web3DautConnect({
  setLoading
}: {
  setLoading: (loading: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const networks = useSelector(NetworksConfig);
  const dAutInitialized = useRef<boolean>(false);
  const { connectors } = useConnect();

  const {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    setStateChangeCallback,
    multiSigner,
    multiSignerId,
    chainId,
    status,
    address
  } = useAutConnector({
    defaultChainId: +environment.defaultChainId
  });

  const onAutInit = async () => {
    const connetectedAlready = localStorage.getItem("aut-data");
    if (!connetectedAlready) {
      setLoading(false);
    }
  };

  const _parseAutId = async (profile: any): Promise<AutID> => {
    const autID = new AutID(profile);
    autID.properties.communities = autID.properties.communities.filter((c) => {
      return c.properties.userData?.isActive;
    });
    autID.properties.network =
      profile.properties.network?.network?.toLowerCase();

    return autID;
  };

  const onAutLogin = async ({ detail }: any) => {
    const profile = JSON.parse(JSON.stringify(detail));
    const autID = await _parseAutId(profile);

    // autID.properties.address = profile.address;
    // autID.properties.network = profile.network?.network?.toLowerCase();

    if (autID.properties.network) {
      const selectedNetwork = networks.find(
        (d) =>
          d.network.toLowerCase() === autID.properties.network.toLowerCase()
      );
      const itemsToUpdate = {
        sdkInitialized: true,
        selectedNetwork
      };
      await dispatch(updateWalletProviderState(itemsToUpdate));

      await dispatch(
        communityUpdateState({
          communities: autID.properties.communities,
          selectedCommunityAddress:
            autID.properties.communities[0].properties?.address
        })
      );

      // const cache = await getCache(
      //   CacheTypes.UserPhases,
      //   autID.properties.address
      // );
      await dispatch(
        setAuthenticated({
          // cache,
          isAuthenticated: true,
          userInfo: autID
        })
      );

      setLoading(false);
    }
  };

  const onDisconnected = async () => {
    dispatch(resetState);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  const onAutMenuProfile = async () => {
    const urls = autUrls();
    const profile = JSON.parse(localStorage.getItem("aut-data"));
    window.open(`${urls.myAut}${profile.name}`, "_blank");
  };

  const initialiseSDK = async (
    network: NetworkConfig,
    multiSigner: MultiSigner
  ) => {
    const sdk = await AutSDK.getInstance(false);
    const itemsToUpdate = {
      selectedNetwork: network
    };
    console.log("network", network);
    await dispatch(updateWalletProviderState(itemsToUpdate));
    await sdk.init(multiSigner, {
      novaRegistryAddress: network.contracts.novaRegistryAddress,
      autIDAddress: network.contracts.autIDAddress,
      daoExpanderRegistryAddress: network.contracts.daoExpanderRegistryAddress
    });
  };

  useEffect(() => {
    if (multiSignerId) {
      let network = networks.find((d) => d.chainId === chainId);
      if (!network) {
        network = networks.filter((d) => !d.disabled)[0];
      }
      initialiseSDK(network, multiSigner);
    }
  }, [multiSignerId]);

  useEffect(() => {
    if (!dAutInitialized.current && multiSignerId) {
      window.addEventListener("aut_profile", onAutMenuProfile);
      window.addEventListener("aut-Init", onAutInit);
      window.addEventListener("aut-onConnected", onAutLogin);
      window.addEventListener("aut-onDisconnected", onDisconnected);
      dAutInitialized.current = true;
      const btnConfig = {
        metaMask: true,
        walletConnect: true,
        coinbaseWalletSDK: true,
        web3auth: true
      };

      const allowedConnectors = Object.keys(btnConfig)
        .filter((connector) => btnConfig[connector])
        .map((connector) => connectors.find((c) => c.id === connector));

      console.log("multiSignerId", multiSignerId);
      console.log("multiSigner", multiSigner);

      const config = {
        defaultText: "Connect Wallet",
        textAlignment: "right",
        menuTextAlignment: "left",
        theme: {
          color: "offWhite",
          type: "main"
        },
        size: {
          width: 240,
          height: 50,
          padding: 3
        }
      };
      Init({
        config,
        envConfig: {
          REACT_APP_API_URL: environment.apiUrl,
          REACT_APP_GRAPH_API_URL: environment.graphApiUrl,
          REACT_APP_IPFS_API_KEY: environment.ipfsApiKey,
          REACT_APP_IPFS_API_SECRET: environment.ipfsApiSecret,
          REACT_APP_IPFS_GATEWAY_URL: environment.ipfsGatewayUrl
        },
        connector: {
          connect,
          disconnect,
          setStateChangeCallback,
          connectors: allowedConnectors,
          networks,
          state: {
            multiSignerId,
            multiSigner,
            isConnected,
            isConnecting,
            status,
            address
          }
        }
      });
    }

    return () => {
      window.removeEventListener("aut_profile", onAutMenuProfile);
      window.removeEventListener("aut-Init", onAutInit);
      window.removeEventListener("aut-onConnected", onAutLogin);
      window.removeEventListener("aut-onDisconnected", onAutLogin);
    };
  }, [dAutInitialized, multiSignerId]);

  return (
    <>
      <d-aut
        style={{
          display: "none",
          position: "absolute",
          zIndex: 99999
        }}
        use-dev={environment.env == EnvMode.Development}
        id="d-aut"
        menu-items='[{"name":"Profile","actionType":"event_emit","eventName":"aut_profile"}]'
        flow-config='{"mode" : "signin", "customCongratsMessage": ""}'
        ipfs-gateway={environment.ipfsGatewayUrl}
      />
    </>
  );
}

export const DautPlaceholder = memo(() => {
  const ref = useRef<HTMLDivElement>();
  useLayoutEffect(() => {
    let dautEl: HTMLElement = document.querySelector("#d-aut");
    dautEl.style.display = "none";
    dautEl.style.left = "0";
    dautEl.style.top = "0";
    const updateDautPosition = () => {
      if (!dautEl) {
        dautEl = document.querySelector("#d-aut");
      }
      if (!dautEl || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      dautEl.style.left = `${rect.left}px`;
      dautEl.style.top = `${rect.top}px`;
      dautEl.style.display = "inherit";
    };
    const debounceFn = debounce(updateDautPosition, 10);
    window.addEventListener("resize", debounceFn);
    debounceFn();
    return () => {
      window.removeEventListener("resize", debounceFn);
      dautEl.style.display = "none";
    };
  }, [ref.current]);

  return (
    <div
      ref={ref}
      style={{
        width: "244px",
        height: "55px",
        position: "relative",
        zIndex: -1
      }}
      className="web-component-placeholder"
    />
  );
});

export default Web3DautConnect;
