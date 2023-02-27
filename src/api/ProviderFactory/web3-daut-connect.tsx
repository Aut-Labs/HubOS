import {
  memo,
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import { useAppDispatch } from "@store/store.model";
import {
  IsAuthenticated,
  resetAuthState,
  setAuthenticated
} from "@auth/auth.reducer";
import { AutID } from "@api/aut.model";
import { Init } from "@aut-labs/d-aut";
import { communityUpdateState } from "@store/Community/community.reducer";
import {
  NetworksConfig,
  updateWalletProviderState
} from "@store/WalletProvider/WalletProvider";
import { useSelector } from "react-redux";
import AutSDK from "@aut-labs-private/sdk";
import { ethers } from "ethers";
import { NetworkConfig } from "./network.config";
import { Config, Connector, useConnector, useEthers } from "@usedapp/core";
import AutLoading from "@components/AutLoading";
import DialogWrapper from "@components/Dialog/DialogWrapper";
import { Typography, debounce, styled } from "@mui/material";
import AppTitle from "@components/AppTitle";
import { NetworkSelectors } from "./components/NetworkSelectors";

const DialogInnerContent = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  gridGap: "30px"
});

function Web3DautConnect({
  setLoading,
  config
}: {
  setLoading: (loading: boolean) => void;
  config: Config;
}) {
  const dispatch = useAppDispatch();
  const abort = useRef<AbortController>();
  const networks = useSelector(NetworksConfig);
  const [currentChainId, setCurrentChainId] = useState(null);
  const [dAutConnected, setDAutConnected] = useState(false);
  const [loadingNetwork, setIsLoadingNetwork] = useState(false);
  const { connector, activate } = useConnector();
  const { activateBrowserWallet, switchNetwork, chainId } = useEthers();

  const openForSelectNetwork = useMemo(() => {
    return dAutConnected && currentChainId && currentChainId != chainId;
  }, [chainId, dAutConnected, currentChainId]);

  const onAutInit = async () => {
    const connetectedAlready = sessionStorage.getItem("aut-data");
    if (!connetectedAlready) {
      setLoading(false);
    }
  };

  const initialiseSDK = async (
    network: NetworkConfig,
    signer: ethers.providers.JsonRpcSigner
  ) => {
    const sdk = AutSDK.getInstance();
    return sdk.init(signer, {
      daoTypesAddress: network.contracts.daoTypesAddress,
      autDaoRegistryAddress: network.contracts.autDaoRegistryAddress,
      autIDAddress: network.contracts.autIDAddress,
      daoExpanderRegistryAddress: network.contracts.daoExpanderRegistryAddress,
      pluginRegistryAddress: network.contracts.pluginRegistryAddress
    });
  };

  const activateNetwork = async (
    network: NetworkConfig,
    conn: Connector,
    wallet?: string
  ) => {
    setIsLoadingNetwork(true);
    try {
      await activate(conn);
      await switchNetwork(+network.chainId);
    } catch (error) {
      console.error(error, "error");
    }
    const signer = conn?.provider?.getSigner();
    const itemsToUpdate = {
      sdkInitialized: true,
      selectedWalletType: wallet,
      selectedNetwork: network.network,
      signer
    };
    if (!wallet) {
      delete itemsToUpdate.selectedWalletType;
    }
    await dispatch(updateWalletProviderState(itemsToUpdate));
    await initialiseSDK(network, signer as ethers.providers.JsonRpcSigner);
    setCurrentChainId(+network.chainId);
    setIsLoadingNetwork(false);
  };

  const onAutLogin = async ({ detail }: any) => {
    const profile = JSON.parse(JSON.stringify(detail));
    const autID = new AutID(profile);
    autID.properties.communities = autID.properties.communities.filter((c) => {
      return c.properties.userData?.isActive;
    });
    autID.properties.address = profile.address;
    autID.properties.network = profile.network?.toLowerCase();

    const network = networks.find(
      (n) =>
        n.network?.toLowerCase() === autID?.properties?.network?.toLowerCase()
    );

    if (network && !network?.disabled) {
      const connector = config.connectors[profile.provider];
      activateBrowserWallet({ type: profile.provider });
      await activateNetwork(network, connector, profile.provider);
    }

    await dispatch(
      communityUpdateState({
        communities: autID.properties.communities,
        selectedCommunityAddress:
          autID.properties.communities[5].properties.address
      })
    );

    await dispatch(
      setAuthenticated({
        isAuthenticated: true,
        userInfo: autID
      })
    );

    setDAutConnected(true);
    setLoading(false);
  };

  const onDisconnected = () => {
    dispatch(resetAuthState());
    // history.push("/");
  };

  useEffect(() => {
    window.addEventListener("aut-Init", onAutInit);
    window.addEventListener("aut-onConnected", onAutLogin);
    window.addEventListener("aut-onDisconnected", onDisconnected);

    Init();

    return () => {
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
        ipfs-gateway="https://ipfs.io/ipfs"
        dao-expander="0xbAac78A371432Ce5e0FAaFd01E45Df4364a7E6a4"
        button-type="simple"
      />
      <DialogWrapper open={openForSelectNetwork}>
        <>
          <AppTitle
            mb={{
              xs: "16px",
              lg: "24px",
              xxl: "32px"
            }}
            variant="h2"
          />
          {loadingNetwork && (
            <div style={{ position: "relative", flex: 1 }}>
              <AutLoading />
            </div>
          )}
          {!loadingNetwork && (
            <>
              <>
                <Typography
                  mb={{
                    xs: "8px"
                  }}
                  color="white"
                  variant="subtitle1"
                >
                  Change Network
                </Typography>

                <Typography color="white" variant="body">
                  You will need to switch your wallet’s network.
                </Typography>
              </>
              <DialogInnerContent>
                <NetworkSelectors
                  networks={networks}
                  onSelect={async (network: NetworkConfig) => {
                    activateNetwork(network, connector.connector);
                  }}
                />
              </DialogInnerContent>
            </>
          )}
        </>
      </DialogWrapper>
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
