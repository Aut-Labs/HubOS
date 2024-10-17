import { BrowserRouter as Router } from "react-router-dom";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import store from "@store/store";
import { swEnvVariables, environment } from "@api/environment";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ensureVariablesExist } from "@utils/env";
import reportWebVitals from "./reportWebVitals";
import { createRoot } from "react-dom/client";
import App from "./App";
import AutTheme from "./theme/theme";
import CssBaseline from "@mui/material/CssBaseline";
import { wagmiConfig, WalletConnectorProvider } from "@aut-labs/connector";
import { ConfirmDialogProvider } from "react-mui-confirm";
import { WagmiProvider } from "wagmi";
import "./App.scss";
import { apolloClient } from "@store/graphql";
import { ApolloProvider } from "@apollo/client";

const container = document.getElementById("root");
const root = createRoot(container);
const queryClient = new QueryClient();

// const persistor = persistStore(store);

// markerSDK.loadWidget({
//   project: `${process.env.VITE_MARKER}`,
//   reporter: {
//     email: "frontend@aut.id",
//     fullName: "Āut Dashboard"
//   }
// });

root.render(
  <ApolloProvider client={apolloClient}>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletConnectorProvider
          defaultChainId={+environment.defaultChainId}
          requestSig={true}
        >
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={AutTheme}>
              <CssBaseline />
              <Provider store={store}>
                <Router>
                  {/* @ts-ignore */}
                  <ConfirmDialogProvider
                    dialogProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: "16px",
                          borderColor: "divider"
                        }
                      }
                    }}
                    dialogTitleProps={{
                      variant: "subtitle1",
                      color: "white"
                    }}
                    confirmButtonProps={{
                      color: "error",
                      variant: "outlined"
                    }}
                    confirmButtonText="Delete"
                    cancelButtonProps={{
                      color: "offWhite",
                      variant: "outlined"
                    }}
                    cancelButtonText="Dismiss"
                  >
                    <App />
                  </ConfirmDialogProvider>
                </Router>
              </Provider>
            </ThemeProvider>
          </StyledEngineProvider>
        </WalletConnectorProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </ApolloProvider>
);
ensureVariablesExist(environment, swEnvVariables);
reportWebVitals(null);
