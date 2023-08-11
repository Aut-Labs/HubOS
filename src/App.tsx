/* eslint-disable max-len */
import { lazy, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useAppDispatch } from "@store/store.model";
import SWSnackbar from "./components/snackbar";
import Web3DautConnect from "@api/ProviderFactory/web3-daut-connect";
import { environment } from "@api/environment";
import { setNetworks } from "@store/WalletProvider/WalletProvider";
import { getAppConfig } from "@api/aut.api";
import AutSDK from "@aut-labs/sdk";
import { IsAuthenticated } from "@auth/auth.reducer";
import GetStarted from "./pages/GetStarted/GetStarted";
import AutLoading from "@components/AutLoading";
import ErrorPage from "@components/ErrorPage";
import Callback from "./pages/Oauth2Callback/Callback";
import { CommunityData } from "@store/Community/community.reducer";
import { generateNetworkConfig } from "@api/ProviderFactory/setup.config";
import { WagmiConfig } from "wagmi";

const AutDashboardMain = lazy(() => import("./pages/AutDashboardMain"));

function App() {
  const dispatch = useAppDispatch();
  const [isLoading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>();
  const [error, setError] = useState(false);
  const isAutheticated = useSelector(IsAuthenticated);
  const communityData = useSelector(CommunityData);
  const location = useLocation();

  const returnUrl = useMemo(() => {
    if (!isAutheticated) return "/";
    const shouldGoToDashboard =
      location.pathname === "/" ||
      !location.pathname.includes(communityData?.name);
    const goTo = shouldGoToDashboard
      ? `/${communityData?.name}`
      : location.pathname;
    const url = location.state?.from;
    return url || goTo;
  }, [isAutheticated, communityData]);

  useEffect(() => {
    getAppConfig()
      .then(async (res) => {
        dispatch(setNetworks(res));
        const [network] = res.filter((d) => !d.disabled);
        setConfig(generateNetworkConfig(network));
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
          <WagmiConfig config={config}>
            <Web3DautConnect config={config} setLoading={setLoading} />
            <Box
              sx={{
                height: "100%",
                backgroundColor: "transparent"
              }}
              className={isLoading ? "sw-loading" : ""}
            >
              {isLoading ? (
                <AutLoading width="130px" height="130px" />
              ) : (
                <Routes>
                  <Route path="callback" element={<Callback />} />
                  <Route path="admins" element={<Admins />} />
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
                        path={`${communityData?.name}/*`}
                        element={<AutDashboardMain />}
                      />
                      <Route path="*" element={<Navigate to={returnUrl} />} />
                    </>
                  )}
                </Routes>
              )}
            </Box>
          </WagmiConfig>
        </>
      )}
    </>
  );
}

export default App;
