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
import { Route, Routes, useSearchParams } from "react-router-dom";
import { communityUpdateState } from "@store/Community/community.reducer";
import { useAppDispatch } from "@store/store.model";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useLazyGetAllPluginDefinitionsByDAOQuery } from "@api/plugin-registry.api";
import { PluginDefinitionType } from "@aut-labs-private/sdk/dist/models/plugin";
import { EnableAndChangeNetwork } from "@api/ProviderFactory/web3.network";

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
  const [searchParams] = useSearchParams();
  const wallet = useSelector(SelectedWalletType);
  const networks = useSelector(NetworksConfig);
  const [isOpen, setIsOpen] = useState(false);
  const { connector, activate } = useConnector();
  const [eagerLoading, setEagerLoading] = useState(
    !!getMetadataFromCache("selected-connector")
  );
  const { activateBrowserWallet, switchNetwork, isLoading, chainId } =
    useEthers();
  const [connected, setIsConnected] = useState(false);

  const shouldEagerLoad = useMemo(() => {
    const config = networks.find(
      (n) => n.chainId?.toString() === chainId?.toString()
    );
    return !!connector && !isLoading && !connected && !!config && !!chainId;
  }, [connector, isLoading, chainId, connected]);

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

  const changeConnector = async (connectorType: string) => {
    activateBrowserWallet({ type: connectorType });
    const config = networks.find(
      (n) => n.chainId?.toString() === chainId?.toString()
    );
    if (config && connector.connector) {
      await activateNetwork(config, connector.connector);
    }
    addMetadataToCache("selected-connector", connectorType);
    setEagerLoading(false);
  };

  useEffect(() => {
    if (!eagerLoading) return;
    const connectorType: string = getMetadataFromCache("selected-connector");
    if (shouldEagerLoad && connectorType) {
      changeConnector(connectorType);
    }
  }, [shouldEagerLoad, eagerLoading]);

  const activateNetwork = async (network: NetworkConfig, conn: Connector) => {
    try {
      await activate(conn);
      await switchNetwork(+network.chainId);
      // @ts-ignore
      await EnableAndChangeNetwork(conn.provider.provider, network);
    } catch (error) {
      console.error(error, "error");
    }
    const signer = conn?.provider?.getSigner();
    await initialiseSDK(network, signer as ethers.providers.JsonRpcSigner);
    await dispatch(
      communityUpdateState({
        selectedCommunityAddress: searchParams.get("daoAddress")
      })
    );
    setIsOpen(false);
    setIsConnected(true);
    loadPlugins(null);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw"
      }}
    >
      {eagerLoading || isLoading ? (
        <AutLoading />
      ) : (
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
              <AppTitle variant="h3" />
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
                onClick={() => {
                  setIsOpen(false);
                  setIsConnected(false);
                  dispatch(setWallet(null));
                }}
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

            <DialogWrapper open={isOpen}>
              <>
                <AppTitle
                  mb={{
                    xs: "16px",
                    lg: "24px",
                    xxl: "32px"
                  }}
                  variant="h2"
                />
                {isLoading && (
                  <div style={{ position: "relative", flex: 1 }}>
                    <AutLoading />
                  </div>
                )}

                {!isLoading && (
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
                      {!wallet && (
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
                      {wallet && !isLoading && (
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
      )}
    </Box>
  );
};

export default NetworkResolver;
