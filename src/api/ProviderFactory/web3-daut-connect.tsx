import { memo, useEffect, useLayoutEffect, useRef } from "react";
import { useAppDispatch } from "@store/store.model";
import { setAuthenticated } from "@auth/auth.reducer";
import { AutID } from "@api/aut.model";
import { Init } from "@aut-labs/d-aut";
import { communityUpdateState } from "@store/Community/community.reducer";
import {
  NetworksConfig,
  updateWalletProviderState
} from "@store/WalletProvider/WalletProvider";
import { useSelector } from "react-redux";
import AutSDK from "@aut-labs/sdk";
import { NetworkConfig } from "./network.config";
import { debounce } from "@mui/material";
import { AUTH_TOKEN_KEY } from "@api/auth.api";
import { resetState } from "@store/store";
import { CacheTypes, getCache } from "@api/cache.api";
import { autUrls } from "@api/environment";
import { EnvMode, environment } from "@api/environment";
import { WalletClient, useAccount, useConnect, useDisconnect } from "wagmi";
import { useEthersSigner, walletClientToSigner } from "./ethers";
import { MultiSigner } from "@aut-labs/sdk/dist/models/models";

function Web3DautConnect({
  setLoading
}: {
  setLoading: (loading: boolean) => void;
  config: any;
}) {
  const dispatch = useAppDispatch();
  const abort = useRef<AbortController>();
  const networks = useSelector(NetworksConfig);
  const { connector, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const multiSigner = useEthersSigner();

  const onAutInit = async () => {
    const connetectedAlready = localStorage.getItem("aut-data");
    if (!connetectedAlready) {
      setLoading(false);
    }
  };

  const initialiseSDK = async (
    network: NetworkConfig,
    multiSigner: MultiSigner
  ) => {
    const sdk = AutSDK.getInstance();
    return sdk.init(multiSigner, {
      daoTypesAddress: network.contracts.daoTypesAddress,
      novaRegistryAddress: network.contracts.novaRegistryAddress,
      autIDAddress: network.contracts.autIDAddress,
      daoExpanderRegistryAddress: network.contracts.daoExpanderRegistryAddress,
      pluginRegistryAddress: network.contracts.pluginRegistryAddress,
      moduleRegistryAddress: network.contracts.moduleRegistryAddress
    });
  };

  useEffect(() => {
    if (connector?.ready && isConnected && multiSigner) {
      const start = async () => {
        const [network] = networks.filter((d) => !d.disabled);
        const itemsToUpdate = {
          sdkInitialized: true,
          selectedNetwork: network
          // signer: multiSigner
        };
        await initialiseSDK(network, multiSigner);
        await dispatch(updateWalletProviderState(itemsToUpdate));
      };
      start();
    }
  }, [isConnected, connector?.ready, multiSigner]);

  const onAutLogin = async ({ detail }: any) => {
    const profile = JSON.parse(JSON.stringify(detail));
    const autID = new AutID(profile);
    autID.properties.communities = autID.properties.communities.filter((c) => {
      return c.properties.userData?.isActive;
    });

    autID.properties.address = profile.address;
    autID.properties.network = profile.network?.network?.toLowerCase();

    if (profile.network) {
      const walletName = localStorage.getItem("wagmi.wallet").replace(/"/g, "");
      const [network] = networks.filter((d) => !d.disabled);
      if (walletName) {
        const c = connectors.find((c) => c.id === walletName);
        if (c && !isConnected) {
          const client = await connectAsync({
            connector: c,
            chainId: c.chains[0].id
          });

          client["transport"] = client["provider"];
          const temp_signer = walletClientToSigner(
            client as unknown as WalletClient
          );
          await initialiseSDK(network, temp_signer);
        }
      }

      const itemsToUpdate = {
        sdkInitialized: true,
        selectedNetwork: network
      };
      await dispatch(updateWalletProviderState(itemsToUpdate));

      await dispatch(
        communityUpdateState({
          communities: autID.properties.communities,
          selectedCommunityAddress:
            autID.properties.communities[0].properties?.address
        })
      );

      const cache = await getCache(
        CacheTypes.UserPhases,
        autID.properties.address
      );
      await dispatch(
        setAuthenticated({
          cache,
          isAuthenticated: true,
          userInfo: autID
        })
      );

      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const onDisconnected = async () => {
    await disconnectAsync();
    dispatch(resetState);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  const onAutMenuProfile = () => {
    const urls = autUrls();
    const profile = JSON.parse(localStorage.getItem("aut-data"));
    window.open(`${urls.myAut}${profile.name}`, "_blank");
  };

  useEffect(() => {
    window.addEventListener("aut_profile", onAutMenuProfile);
    window.addEventListener("aut-Init", onAutInit);
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
      window.removeEventListener("aut_profile", onAutMenuProfile);
      window.removeEventListener("aut-Init", onAutInit);
      window.removeEventListener("aut-onConnected", onAutLogin);
      window.removeEventListener("aut-onDisconnected", onAutLogin);
      if (abort.current) {
        abort.current.abort();
      }
    };
  }, []);

  return (
    <>
      <d-aut
        style={{
          display: "none",
          position: "absolute",
          zIndex: 99999
        }}
        id="d-aut"
        use-dev={environment.env == EnvMode.Development}
        menu-items='[{"name":"Profile","actionType":"event_emit","eventName":"aut_profile"}]'
        flow-config='{"mode" : "dashboard", "customCongratsMessage": ""}'
        ipfs-gateway="https://ipfs.nftstorage.link/ipfs"
        button-type="simple"
      />
      {/* <d-aut
        style={{
          position: "absolute",
          zIndex: 99999
        }}
        use-dev={environment.env == EnvMode.Development}
        flow-config='{"mode" : "tryAut", "customCongratsMessage": ""}'
        dao-expander={"0xb7947C6F1674129A383639e3977DDFE5189C66DF"}
        id="d-aut"
        ipfs-gateway="https://ipfs.nftstorage.link/ipfs"
        button-type="simple"
      /> */}
    </>
  );
}

export const DautPlaceholder = memo(() => {
  const ref = useRef<HTMLDivElement>();
  useLayoutEffect(() => {
    let dautEl: HTMLElement = document.querySelector("#d-aut");
    dautEl.style.display = "none";
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
        width: "270px",
        height: "55px",
        position: "relative",
        zIndex: -1
      }}
      className="web-component-placeholder"
    />
  );
});

export default memo(Web3DautConnect);
