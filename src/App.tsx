/* eslint-disable max-len */
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Box, CssBaseline } from "@mui/material";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useAppDispatch } from "@store/store.model";
import SWSnackbar from "./components/snackbar";
import Web3DautConnect from "@api/ProviderFactory/web3-daut-connect";
import { NetworkConfig } from "@api/ProviderFactory/network.config";
import { environment } from "@api/environment";
import { ethers } from "ethers";
import { Network } from "@ethersproject/networks";
import { DAppProvider, Config, MetamaskConnector } from "@usedapp/core";
import { WalletConnectConnector } from "@usedapp/wallet-connect-connector";
import { setNetworks } from "@store/WalletProvider/WalletProvider";
import { getAppConfig } from "@api/aut.api";
import AutSDK from "@aut-labs-private/sdk";
import { IsAuthenticated } from "@auth/auth.reducer";
import AutDashboardMain from "./pages/AutDashboardMain";
import GetStarted from "./pages/GetStarted/GetStarted";
import AutLoading from "@components/AutLoading";
import ErrorPage from "@components/ErrorPage";

const generateConfig = (networks: NetworkConfig[]): Config => {
  const readOnlyUrls = networks.reduce((prev, curr) => {
    if (!curr.disabled) {
      const network: Network = {
        name: "mumbai",
        chainId: 80001,
        _defaultProvider: (providers) =>
          new providers.JsonRpcProvider(curr.rpcUrls[0])
      };
      const provider = ethers.getDefaultProvider(network);
      prev[curr.chainId] = provider;
    }
    return prev;
  }, {});

  return {
    readOnlyUrls,
    networks: networks
      .filter((n) => !n.disabled)
      .map(
        (n) =>
          ({
            isLocalChain: false,
            isTestChain: environment.networkEnv === "testing",
            chainId: n.chainId,
            chainName: n.network,
            rpcUrl: n.rpcUrls[0],
            nativeCurrency: n.nativeCurrency
          } as any)
      ),
    gasLimitBufferPercentage: 50000,
    connectors: {
      metamask: new MetamaskConnector(),
      walletConnect: new WalletConnectConnector({
        infuraId: "d8df2cb7844e4a54ab0a782f608749dd"
      })
    }
  };
};

function App() {
  const dispatch = useAppDispatch();
  const [isLoading, setLoading] = useState(true);
  const [config, setConfig] = useState<Config>();
  const [error, setError] = useState(false);
  const isAutheticated = useSelector(IsAuthenticated);
  const location = useLocation();

  const returnUrl = useMemo(() => {
    if (!isAutheticated) return "/";
    const shouldGoToDashboard = location.pathname === "/";
    const goTo = shouldGoToDashboard ? "/aut-dashboard" : location.pathname;
    const url = location.state?.from;
    return url || goTo;
  }, [isAutheticated]);

  useEffect(() => {
    getAppConfig()
      .then(async (res) => {
        dispatch(setNetworks(res));
        setConfig(generateConfig(res));
        new AutSDK({
          nftStorageApiKey: environment.nftStorageKey
        });
      })
      .catch(() => {
        setError(true);
      });
  }, []);

  return (
    <>
      <SWSnackbar />
      {error && <ErrorPage />}
      {!error && config && (
        <>
          <DAppProvider config={config}>
            <Web3DautConnect config={config} setLoading={setLoading} />
            <Box
              sx={{
                height: "100%",
                backgroundColor: "transparent"
              }}
              className={isLoading ? "sw-loading" : ""}
            >
              {isLoading ? (
                <AutLoading />
              ) : (
                <Routes>
                  {!isAutheticated && (
                    <>
                      <Route path="/" element={<GetStarted />} />
                      <Route
                        path="*"
                        element={<Navigate to="/" state={{ from: location }} />}
                      />
                    </>
                  )}
                  {isAutheticated && (
                    <>
                      <Route
                        path="aut-dashboard/*"
                        element={<AutDashboardMain />}
                      />
                      <Route
                        path="*"
                        element={<Navigate to={returnUrl} replace />}
                      />
                    </>
                  )}
                </Routes>
              )}
            </Box>
          </DAppProvider>
        </>
      )}
    </>
  );
}

export default App;
