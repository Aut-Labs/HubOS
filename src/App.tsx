import { useEffect, useState } from "react";
import {
  withRouter,
  Switch,
  Route,
  Redirect as RedirectRoute,
  useLocation,
  useHistory,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { AppBar, Box, CssBaseline, Toolbar, Typography } from "@mui/material";
import { ReactComponent as AutLogo } from "@assets/aut/logo.svg";
import Redirect from "@components/Redirect";
import { resetAuthState, setAuthenticated } from "@auth/auth.reducer";
import { RootState, useAppDispatch } from "@store/store.model";
import NotFound from "@components/NotFound";
import { Init } from "d-aut-alpha";
import detectEthereumProvider from "@metamask/detect-provider";
import { AppTitle, openSnackbar } from "@store/ui-reducer";
import AutDashboard from "./pages/AutDashboard";
import SWSnackbar from "./components/snackbar";
import GetStarted from "./pages/GetStarted/GetStarted";
import { pxToRem } from "@utils/text-size";
import "./App.scss";
import { communityUpdateState } from "@store/Community/community.reducer";
import Community from "./pages/Community/Community";
import { AutID } from "@api/aut.model";

const LoadingMessage = () => (
  <div className="app-loading">
    <AutLogo width="80" height="80" />
  </div>
);

function App() {
  const dispatch = useAppDispatch();
  const location = useLocation<any>();
  const history = useHistory();
  const [isLoading, setLoading] = useState(true);
  const appTitle = useSelector(AppTitle);
  const { isAutheticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const checkForEthereumProvider = async () => {
      let ethereum: typeof window.ethereum;
      try {
        ethereum = await detectEthereumProvider();
      } catch (e) {
        console.log(e);
      }
      if (!ethereum) {
        dispatch(
          openSnackbar({
            message:
              "Please install MetaMask and refresh the page to use the full array of Partner features.",
            severity: "error",
            duration: 30000,
          })
        );
      }
    };
    checkForEthereumProvider();
  }, []);

  useEffect(() => {
    const onSWLogin = async ({ detail }: any) => {
      const isLoggedIn = true;
      const autID = new AutID(detail)
      if (isLoggedIn) {
        dispatch(
          setAuthenticated({
            isAuthenticated: isLoggedIn,
            userInfo: autID,
          })
        );

        dispatch(
          communityUpdateState({
            communities: autID.properties.communities,
            community: autID.properties.communities[0]
          })
        );
        const shouldGoToDashboard = location.pathname === "/";
        const goTo = shouldGoToDashboard ? "/aut-dashboard" : location.pathname;
        const returnUrl = location.state?.from;
        history.push(returnUrl || goTo);
      } else {
        dispatch(resetAuthState());
        history.push("/");
      }
    };

    const onSWInit = async () => setLoading(false);

    window.addEventListener("aut-Init", onSWInit);
    window.addEventListener("aut-onConnected", onSWLogin);

    Init({
      container: document.querySelector("#connect-wallet-container"),
    });

    return () => {
      window.removeEventListener("aut-Init", onSWInit);
      window.removeEventListener("aut-onConnected", onSWLogin);
    };
  }, [dispatch, history, location.pathname, location.state?.from]);

  return (
    <>
      <div id="connect-wallet-container" />
      <CssBaseline />
      <SWSnackbar />
      <AppBar
        position="fixed"
        sx={{
          border: "0",
          p: 0,
          zIndex: (s) => s.zIndex.drawer + 1,
          ml: pxToRem(350),
          width: `calc(100% - ${pxToRem(350)})`,
        }}
      >
        <Toolbar
          sx={{
            p: "0px !important",
            backgroundColor: "black",
            border: "0",
            minHeight: `${pxToRem(130)} !important`,
            justifyContent: "flex-end",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <div style={{ marginRight: pxToRem(50) }}>
              <d-aut
                id="d-aut"
                community-address="0x6A88d911D3371328AA0cC96302f27595A2Aa3831"
                use-dev="true"
              ></d-aut>
            </div>
          </div>
          <div
            style={{
              width: "100%",
              borderStyle: "solid",
              height: pxToRem(50),
              borderImage:
                "linear-gradient(160deg, #009fe3 0%, #0399de 8%, #0e8bd3 19%, #2072bf 30%, #3a50a4 41%, #5a2583 53%, #453f94 71%, #38519f 88%, #3458a4 100%) 1",
              borderBottomWidth: "1px",
              borderTopWidth: "1px",
              borderLeft: 0,
              borderRight: 0,
            }}
          >
            <Typography
              paddingLeft="10px"
              lineHeight={pxToRem(50)}
              fontSize={pxToRem(20)}
              color="white"
            >
              {appTitle}
            </Typography>
          </div>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          height: `calc(100%)`,
          backgroundColor: "#000",
        }}
        className={isLoading ? "sw-loading" : ""}
      >
        {isLoading ? (
          <LoadingMessage />
        ) : (
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
        )}
      </Box>
    </>
  );
}

export default withRouter(App);
