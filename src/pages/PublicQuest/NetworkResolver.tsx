import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import {
  ConnectorTypes,
  NetworksConfig,
  SelectedWalletType,
  setWallet
} from "@store/WalletProvider/WalletProvider";
import { useSelector } from "react-redux";
import AutSDK, {
  addMetadataToCache,
  getMetadataFromCache
} from "@aut-labs-private/sdk";
import { ethers } from "ethers";
import { Connector, useConnector, useEthers } from "@usedapp/core";
import AutLoading from "@components/AutLoading";
import DialogWrapper from "@components/Dialog/DialogWrapper";
import {
  Box,
  Button,
  Container,
  Link,
  Stack,
  Toolbar,
  Typography,
  styled
} from "@mui/material";
import AppTitle from "@components/AppTitle";
import { NetworkSelectors } from "@api/ProviderFactory/components/NetworkSelectors";
import { NetworkConfig } from "@api/ProviderFactory/network.config";
import ConnectorBtn from "@api/ProviderFactory/components/ConnectorBtn";
import PublicQuest from "./PublicQuest";
import { Route, Routes, useNavigate, useSearchParams } from "react-router-dom";
import { communityUpdateState } from "@store/Community/community.reducer";
import { useAppDispatch } from "@store/store.model";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useLazyGetAllPluginDefinitionsByDAOQuery } from "@api/plugin-registry.api";
import { PluginDefinitionType } from "@aut-labs-private/sdk/dist/models/plugin";
import { EnableAndChangeNetwork } from "@api/ProviderFactory/web3.network";
import BubbleTopRight from "@assets/bubble_top_right.png";
import BubbleBottomLeft from "@assets/bubble_bottom_left.png";
import { authoriseWithWeb3 } from "@api/auth.api";

const BottomLeftBubble = styled("img")({
  position: "absolute",
  width: "700px",
  height: "700px",
  left: "-350px",
  bottom: "-350px"
});

const TopRightBubble = styled("img")({
  position: "absolute",
  width: "700px",
  height: "700px",
  top: "calc(-350px + 84px)",
  right: "-350px"
});

const OpenTask = lazy(() => import("../Modules/Plugins/Task/Open/OpenTask"));

const QuizTask = lazy(() => import("../Modules/Plugins/Task/Quiz/QuizTask"));

const JoinDiscordTask = lazy(
  () => import("../Modules/Plugins/Task/JoinDiscord/JoinDiscordTask")
);
const TransactionTask = lazy(
  () => import("../Modules/Plugins/Task/Transaction/TransactionTask")
);

const DialogInnerContent = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  gridGap: "30px"
});

const NetworkResolver = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const wallet = useSelector(SelectedWalletType);
  const networks = useSelector(NetworksConfig);
  const [isOpen, setIsOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [tryEagerConnect, setTryEagerConnect] = useState(false);
  const { connector, activate } = useConnector();
  const {
    activateBrowserWallet,
    deactivate,
    switchNetwork,
    isLoading,
    account,
    chainId
  } = useEthers();
  const [connected, setIsConnected] = useState(false);

  const initialiseSDK = async (
    network: NetworkConfig,
    signer: ethers.providers.JsonRpcSigner
  ) => {
    const sdk = AutSDK.getInstance();
    return sdk.init(signer, {
      daoExpanderAddress: searchParams.get("daoAddress"),
      daoTypesAddress: network.contracts.daoTypesAddress,
      autDaoRegistryAddress: network.contracts.autDaoRegistryAddress,
      autIDAddress: network.contracts.autIDAddress,
      daoExpanderRegistryAddress: network.contracts.daoExpanderRegistryAddress,
      pluginRegistryAddress: network.contracts.pluginRegistryAddress
    });
  };

  const [loadPlugins, { data: plugins }] =
    useLazyGetAllPluginDefinitionsByDAOQuery();

  const taskPluginTypes = useMemo(() => {
    return (plugins || []).reduce((prev, curr) => {
      prev[curr.pluginDefinitionId] = curr;
      return prev;
    }, {});
  }, [plugins]);

  const canConnectEagerly = useMemo(() => {
    return !!tryEagerConnect && !!connector?.connector && account && isOpen;
  }, [connector, tryEagerConnect, account, isOpen]);

  useEffect(() => {
    deactivate();
  }, []);

  const tryConnect = async () => {
    const config = networks.find(
      (n) => n.chainId?.toString() === chainId?.toString()
    );
    if (config && connector?.connector) {
      await activateNetwork(config, connector.connector);
    } else {
      setTryEagerConnect(false);
    }
  };

  useEffect(() => {
    if (canConnectEagerly) {
      tryConnect();
    }
  }, [canConnectEagerly]);

  const changeConnector = async (connectorType: string) => {
    activateBrowserWallet({ type: connectorType });
    if (!connector?.connector) {
      setTryEagerConnect(true);
    } else {
      await tryConnect();
    }
  };

  const activateNetwork = async (network: NetworkConfig, conn: Connector) => {
    try {
      setIsSigning(true);
      await activate(conn);
      await switchNetwork(+network.chainId);
      if (conn.name === "metamask") {
        // @ts-ignore
        const provider = conn.provider.provider;
        await EnableAndChangeNetwork(provider, network);
      }
      const signer = conn?.provider?.getSigner();
      const isAuthorised = await authoriseWithWeb3(signer);

      if (isAuthorised) {
        await initialiseSDK(network, signer as ethers.providers.JsonRpcSigner);
        await dispatch(
          communityUpdateState({
            selectedCommunityAddress: searchParams.get("daoAddress")
          })
        );
        setIsConnected(true);
        loadPlugins(null);
      } else {
        setIsConnected(false);
        dispatch(setWallet(null));
      }
    } catch (error) {
      console.error(error, "error");
    } finally {
      setIsOpen(false);
      setTryEagerConnect(false);
      setIsSigning(false);
      dispatch(setWallet(null));
    }
  };

  const closeAndDisconnect = async () => {
    deactivate();
    setIsConnected(false);
    setTryEagerConnect(false);
    dispatch(setWallet(null));
    setIsOpen(false);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw"
      }}
    >
      <BottomLeftBubble loading="lazy" src={BubbleBottomLeft} />
      <TopRightBubble loading="lazy" src={BubbleTopRight} />
      <>
        {!!connected && (
          <Toolbar
            sx={{
              width: "100%",
              zIndex: 99,
              position: "fixed",
              top: 0,
              backgroundColor: "nightBlack.main",
              boxShadow: 2,
              "&.MuiToolbar-root": {
                paddingLeft: 6,
                paddingRight: 6,
                minHeight: "84px",
                justifyContent: "space-between",
                alignItems: "center"
              }
            }}
          >
            <AppTitle
              sx={{
                cursor: "pointer"
              }}
              onClick={() => navigate("/")}
              variant="h3"
            />
            <Stack
              flex={1}
              alignItems="center"
              justifyContent="center"
              direction="row"
              gap={2}
            >
              <Link
                color="offWhite.main"
                variant="body"
                target="_blank"
                href={`https://my.aut.id/`}
              >
                Leaderboard
              </Link>
              <Link
                color="offWhite.main"
                variant="body"
                target="_blank"
                href={`https://my.aut.id/`}
              >
                Nova showcase
              </Link>
            </Stack>
            <Button
              onClick={closeAndDisconnect}
              sx={{
                width: "220px",
                height: "55px"
              }}
              color="offWhite"
              variant="outlined"
            >
              Disconnect
            </Button>
          </Toolbar>
        )}
        <PerfectScrollbar
          style={{
            marginTop: "84px",
            height: "calc(100% - 84px)",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {!connected && (
            <Container
              maxWidth="lg"
              sx={{
                py: "20px",
                height: "100%",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                position: "relative"
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row"
                }}
                mb={{
                  xs: "25px",
                  md: "50px"
                }}
              >
                <AppTitle />
              </Box>
              <Typography
                mb={{
                  xs: "10px",
                  md: "30px"
                }}
                color="white"
                variant="subtitle2"
                fontWeight="bold"
              >
                To see the quest please connect your wallet.
              </Typography>
              <Button
                onClick={() => setIsOpen(true)}
                sx={{
                  width: "220px",
                  height: "55px"
                }}
                color="offWhite"
                variant="outlined"
              >
                Connect wallet
              </Button>

              <Stack mt={8} direction="row" gap={2}>
                <Link
                  color="offWhite.main"
                  variant="body"
                  target="_blank"
                  href={`https://my.aut.id/`}
                >
                  Leaderboard
                </Link>
                <Link
                  color="offWhite.main"
                  variant="body"
                  target="_blank"
                  href={`https://my.aut.id/`}
                >
                  Nova showcase
                </Link>
              </Stack>
            </Container>
          )}
          {connected && (
            <Suspense fallback={<AutLoading />}>
              <Routes>
                <Route index element={<PublicQuest />} />
                <Route
                  path={`task/${PluginDefinitionType.OnboardingOpenTaskPlugin}/:taskId`}
                  element={
                    <OpenTask
                      plugin={
                        taskPluginTypes[
                          PluginDefinitionType.OnboardingOpenTaskPlugin
                        ]
                      }
                    />
                  }
                />
                <Route
                  path={`task/${PluginDefinitionType.OnboardingQuizTaskPlugin}/:taskId`}
                  element={
                    <QuizTask
                      plugin={
                        taskPluginTypes[
                          PluginDefinitionType.OnboardingQuizTaskPlugin
                        ]
                      }
                    />
                  }
                />
                <Route
                  path={`task/${PluginDefinitionType.OnboardingJoinDiscordTaskPlugin}/:taskId`}
                  element={
                    <JoinDiscordTask
                      plugin={
                        taskPluginTypes[
                          PluginDefinitionType.OnboardingJoinDiscordTaskPlugin
                        ]
                      }
                    />
                  }
                />
                <Route
                  path={`task/${PluginDefinitionType.OnboardingTransactionTaskPlugin}/:taskId`}
                  element={
                    <TransactionTask
                      plugin={
                        taskPluginTypes[
                          PluginDefinitionType.OnboardingTransactionTaskPlugin
                        ]
                      }
                    />
                  }
                />
              </Routes>
            </Suspense>
          )}

          <DialogWrapper open={isOpen} onClose={closeAndDisconnect}>
            <>
              <AppTitle
                mb={{
                  xs: "16px",
                  lg: "24px",
                  xxl: "32px"
                }}
                variant="h2"
              />
              {(isLoading || isSigning) && (
                <div style={{ position: "relative", flex: 1 }}>
                  <AutLoading />
                </div>
              )}

              {!isLoading && !isSigning && (
                <>
                  {!wallet && (
                    <Typography color="white" variant="subtitle1">
                      Connect your wallet
                    </Typography>
                  )}
                  {wallet && (
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
                  )}
                  <DialogInnerContent>
                    {(!wallet || !connector?.connector) && (
                      <>
                        <ConnectorBtn
                          setConnector={changeConnector}
                          connectorType={ConnectorTypes.Metamask}
                        />
                        <ConnectorBtn
                          setConnector={changeConnector}
                          connectorType={ConnectorTypes.WalletConnect}
                        />
                      </>
                    )}
                    {wallet && !isLoading && !!connector?.connector && (
                      <NetworkSelectors
                        networks={networks}
                        onSelect={async (selectedNetwork: NetworkConfig) => {
                          if (selectedNetwork) {
                            try {
                              await activateNetwork(
                                selectedNetwork,
                                connector.connector
                              );
                            } catch (error) {
                              console.log(error, "error");
                            }
                          }
                        }}
                      />
                    )}
                  </DialogInnerContent>
                </>
              )}
            </>
          </DialogWrapper>
        </PerfectScrollbar>
      </>
    </Box>
  );
};

export default NetworkResolver;
