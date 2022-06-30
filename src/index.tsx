import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import store from '@store/store';
import { swEnvVariables, environment } from '@api/environment';
import { ensureVariablesExist } from 'sw-web-shared';
import { SwTheme } from './theme';
import reportWebVitals from './reportWebVitals';
import App from './App';

ReactDOM.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={SwTheme}>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  </StyledEngineProvider>,
  document.getElementById('root')
);

ensureVariablesExist(environment, swEnvVariables);
reportWebVitals(null);
