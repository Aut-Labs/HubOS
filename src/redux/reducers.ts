import { combineReducers } from "redux";
import hubReducer from "./Hub/hub.reducer";
import uiSliceReducer from "./ui-reducer";
import contributionReducer from "./Contributions/contributions.reducer";
import walletProviderReduce from "./WalletProvider/WalletProvider";
import { hubApi } from "@api/hub.api";
import { socialsApi } from "@api/socials.api";
import { contributionsApi } from "@api/contributions.api";

export const reducers = combineReducers({
  hub: hubReducer,
  ui: uiSliceReducer,
  walletProvider: walletProviderReduce,
  contribution: contributionReducer,
  [hubApi.reducerPath]: hubApi.reducer,
  [contributionsApi.reducerPath]: contributionsApi.reducer,
  [socialsApi.reducerPath]: socialsApi.reducer
});
