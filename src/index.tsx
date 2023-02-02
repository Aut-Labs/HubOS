import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import store from "@store/store";
import { swEnvVariables, environment } from "@api/environment";
import { ensureVariablesExist } from "sw-web-shared";
import reportWebVitals from "./reportWebVitals";
import { createRoot } from "react-dom/client";
import App from "./App";
import AutTheme from "./theme/theme";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={AutTheme}>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  </StyledEngineProvider>
);
ensureVariablesExist(environment, swEnvVariables);
reportWebVitals(null);
