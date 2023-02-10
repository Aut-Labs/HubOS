import { BrowserRouter as Router } from "react-router-dom";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import store from "@store/store";
import { swEnvVariables, environment } from "@api/environment";
import { ensureVariablesExist } from "@utils/env";
import reportWebVitals from "./reportWebVitals";
import { createRoot } from "react-dom/client";
import App from "./App";
import AutTheme from "./theme/theme";
import "./App.scss";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import AutLoading from "@components/AutLoading";
import CssBaseline from "@mui/material/CssBaseline";

const container = document.getElementById("root");
const root = createRoot(container);

const persistor = persistStore(store);

root.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={AutTheme}>
      <CssBaseline />
      <Provider store={store}>
        <PersistGate loading={<AutLoading />} persistor={persistor}>
          <Router>
            <App />
          </Router>
        </PersistGate>
      </Provider>
    </ThemeProvider>
  </StyledEngineProvider>
);
ensureVariablesExist(environment, swEnvVariables);
reportWebVitals(null);
