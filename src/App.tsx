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
import AutLoading from "@components/AutLoading";
import { HubData } from "@store/Hub/hub.reducer";

const AutDashboardMain = lazy(() => import("./pages/AutDashboardMain"));
const Callback = lazy(() => import("./pages/Oauth2Callback/Callback"));
const ClaimRole = lazy(() => import("./pages/DiscordBot/ClaimRole"));
const GetStarted = lazy(() => import("./pages/GetStarted/GetStarted"));

function App() {
  const dispatch = useAppDispatch();
  const [isAuthenticating, setLoading] = useState(true);
  const [isInitialized, setInitialized] = useState(false);
  const hubData = useSelector(HubData);
  const location = useLocation();

  const returnUrl = useMemo(() => {
    if (!hubData) return "/";
    const shouldGoToDashboard =
      location.pathname === "/" || !location.pathname.includes(hubData?.name);
    const goTo = shouldGoToDashboard ? `/${hubData?.name}` : location.pathname;
    const url = location.state?.from;
    return url || goTo;
  }, [hubData]);

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
      setInitialized(true);
    });
  }, []);

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
              <Route path="callback" element={<Callback />} />
              <Route path="claim-discord-role" element={<ClaimRole />} />
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
