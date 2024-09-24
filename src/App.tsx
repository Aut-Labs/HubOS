
import { lazy, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useAppDispatch } from "@store/store.model";
import SWSnackbar from "./components/snackbar";
import Web3DautConnect from "@api/ProviderFactory/web3-daut-connect";
import { environment } from "@api/environment";
import { updateWalletProviderState } from "@store/WalletProvider/WalletProvider";
import { getAppConfig } from "@api/aut.api";
import AutSDK from "@aut-labs/sdk";
import GetStarted from "./pages/GetStarted/GetStarted";
import AutLoading from "@components/AutLoading";
import { HubData } from "@store/Hub/hub.reducer";

const AutDashboardMain = lazy(() => import("./pages/AutDashboardMain"));

function App() {
  const dispatch = useAppDispatch();
  const [isAuthenticating, setLoading] = useState(true);
  const [isInitialized, setInitialized] = useState(false);
  const hubData = useSelector(HubData);
  const location = useLocation();

  // const isLoading = useMemo(
  //   () => !isAuthenticating && isInitialized,
  //   [isAuthenticating, isInitialized]
  // );

  console.log(isAuthenticating, "isAuthenticating");
  console.log(isInitialized, "isInitialized");
  // console.log(isLoading, "isLoading");
  const returnUrl = useMemo(() => {
    if (!hubData) return "/";
    const shouldGoToDashboard =
      location.pathname === "/" ||
      !location.pathname.includes(hubData?.name);
    const goTo = shouldGoToDashboard
      ? `/${hubData?.name}`
      : location.pathname;
    const url = location.state?.from;
    return url || goTo;
  }, [hubData]);
  console.log(returnUrl, "returnUrl");

  useEffect(() => {
    getAppConfig().then(async (networks) => {
      dispatch(
        updateWalletProviderState({
          networksConfig: networks
        })
      );

      const sdk = new AutSDK({
        ipfs: {
          apiKey: environment.ipfsApiKey,
          secretApiKey: environment.ipfsApiSecret,
          gatewayUrl: environment.ipfsGatewayUrl
        }
      });
      // await AutSDK.getInstance(true);
      setInitialized(true);
    });
    // .finally(() => setLoading(false));
  }, []);

  // useEffect(() => {
  //   getAppConfig()
  //     .then(async (res) => {
  //       dispatch(setNetworks(res));
  //       const [network] = res.filter((d) => !d.disabled);
  //       setConfig(generateNetworkConfig(network));
  //       new AutSDK({
  //         ipfs: {
  //           apiKey: environment.ipfsApiKey,
  //           secretApiKey: environment.ipfsApiSecret,
  //           gatewayUrl: environment.ipfsGatewayUrl
  //         }
  //       });
  //     })
  //     .catch(() => {
  //       setError(true);
  //     });
  // }, []);

  return (
    <>
      <SWSnackbar />
      <Web3DautConnect setLoading={setLoading} />
      <Box
        sx={{
          height: "100%",
          backgroundColor: "transparent"
        }}
        className={isAuthenticating || !isInitialized ? "sw-loading" : ""}
      >
        {isAuthenticating || !isInitialized ? (
          <AutLoading width="130px" height="130px" />
        ) : (
          <>
            <Routes>
              {/* <Route path="callback" element={<Callback />} /> */}
              {!hubData && (
                <>
                  <Route path="/" element={<GetStarted />} />
                  <Route
                    path="*"
                    element={<Navigate to="/" state={{ from: location }} />}
                  />
                </>
              )}
              {hubData && (
                <>
                  <Route
                    path={`${hubData?.name}/*`}
                    element={<AutDashboardMain />}
                  />
                  <Route path="*" element={<Navigate to={returnUrl} />} />
                </>
              )}
            </Routes>
          </>
        )}
      </Box>
    </>
  );
}

export default App;
