/* eslint-disable max-len */
import { useEffect, useState } from "react";
import {
  withRouter,
  Switch,
  Route,
  Redirect as RedirectRoute,
  useLocation,
  useHistory
} from "react-router-dom";
import { useSelector } from "react-redux";
import {
  AppBar,
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  useTheme
} from "@mui/material";
import { ReactComponent as AutLogo } from "@assets/aut/logo.svg";
import Redirect from "@components/Redirect";
import { resetAuthState, setAuthenticated } from "@auth/auth.reducer";
import { RootState, useAppDispatch } from "@store/store.model";
import NotFound from "@components/NotFound";
import detectEthereumProvider from "@metamask/detect-provider";
import { AppTitle, openSnackbar } from "@store/ui-reducer";
import { pxToRem } from "@utils/text-size";
import AutDashboard from "./pages/AutDashboard";
import SWSnackbar from "./components/snackbar";
import GetStarted from "./pages/GetStarted/GetStarted";
import "./App.scss";
import { communityUpdateState } from "@store/Community/community.reducer";
import { AutID } from "@api/aut.model";
import Web3DautConnect from "@api/ProviderFactory/web3-daut-connect";
import { NetworkConfig } from "@api/ProviderFactory/network.config";
import { environment } from "@api/environment";
import { Init } from "@aut-labs/d-aut";
import { ethers } from "ethers";
import { Network } from "@ethersproject/networks";
import { DAppProvider, Config, MetamaskConnector } from "@usedapp/core";
import { WalletConnectConnector } from "@usedapp/wallet-connect-connector";
import { setNetworks } from "@store/WalletProvider/WalletProvider";
import { getAppConfig } from "@api/aut.api";
import AutSDK from "@aut-labs-private/sdk";
import { DautPlaceholder } from "@components/DautPlaceholder";

const LoadingMessage = () => (
  <div className="app-loading">
    <AutLogo width="80" height="80" />
  </div>
);

const generateConfig = (networks: NetworkConfig[]): Config => {
  const readOnlyUrls = networks.reduce((prev, curr) => {
    const network: Network = {
      name: "mumbai",
      chainId: 80001,
      _defaultProvider: (providers) =>
        new providers.JsonRpcProvider(curr.rpcUrls[0])
    };
    const provider = ethers.getDefaultProvider(network);
    prev[curr.chainId] = provider;
    return prev;
  }, {});

  return {
    readOnlyUrls,
    networks: networks.map(
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
  const location = useLocation<any>();
  const history = useHistory();
  const [isLoading, setLoading] = useState(true);
  const appTitle = useSelector(AppTitle);
  const { isAutheticated } = useSelector((state: RootState) => state.auth);
  const [config, setConfig] = useState<Config>(null);
  const theme = useTheme();

  useEffect(() => {
    getAppConfig()
      .then(async (res) => {
        dispatch(setNetworks(res));
        setConfig(generateConfig(res));
        const sdk = new AutSDK({
          nftStorageApiKey: environment.nftStorageKey
        });
      })
      .finally(() => setLoading(false));
  }, [dispatch, history, location.pathname, location.state?.from]);

  return (
    <>
      <CssBaseline />
      <SWSnackbar />
      <Web3DautConnect setLoading={setLoading} />
      <AppBar
        position="fixed"
        sx={{
          border: "0",
          p: 0,
          backgroundColor: "transparent",
          zIndex: (s) => s.zIndex.drawer + 1,
          ml: isAutheticated ? pxToRem(350) : 0,
          width: isAutheticated ? `calc(100% - ${pxToRem(350)})` : "100%"
        }}
      >
        <Toolbar
          sx={{
            p: "0px !important",
            backgroundColor: "transparent",
            border: "0",
            minHeight: `${pxToRem(160)} !important`,
            justifyContent: "flex-end",
            flexDirection: "column"
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "flex-end"
            }}
          >
            <div style={{ marginRight: pxToRem(50) }}>
              <DautPlaceholder
                styles={{
                  right: "80px"
                }}
                hide={false}
              />
            </div>
          </div>

          <div
            style={{
              visibility: !isAutheticated ? "hidden" : "visible",
              width: "100%",
              borderStyle: "solid",
              height: pxToRem(50),
              borderColor: theme.palette.offWhite.main,
              // borderImage:
              //   "linear-gradient(160deg, #009fe3 0%, #0399de 8%, #0e8bd3 19%, #2072bf 30%, #3a50a4 41%, #5a2583 53%, #453f94 71%, #38519f 88%, #3458a4 100%) 1",
              borderBottomWidth: "1px",
              borderTopWidth: "1px",
              borderLeft: 0,
              borderRight: 0,
              display: "flex",
              alignItems: "center"
            }}
          >
            <Typography pl="10px" color="white" variant="subtitle2">
              {appTitle}
            </Typography>
          </div>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          height: `calc(100%)`,
          backgroundColor: "transparent"
        }}
        className={isLoading ? "sw-loading" : ""}
      >
        {isLoading || !config ? (
          <LoadingMessage />
        ) : (
          <DAppProvider config={config}>
            <Switch>
              <Route exact component={GetStarted} path="/" />
              <Route path="/redirect" component={Redirect} />
              {isAutheticated && (
                <Route path="/aut-dashboard" component={AutDashboard} />
              )}
              {isAutheticated ? (
                <Route component={NotFound} />
              ) : (
                <RedirectRoute
                  to={{ pathname: "/", state: { from: location.pathname } }}
                />
              )}
            </Switch>
          </DAppProvider>
        )}
      </Box>
    </>
  );
}

export default withRouter(App);
