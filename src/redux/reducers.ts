import { combineReducers } from "redux";
import hubReducer from "./Hub/hub.reducer";
import uiSliceReducer from "./ui-reducer";
import walletProviderReduce from "./WalletProvider/WalletProvider";
import { hubApi } from "@api/hub.api";
import { socialsApi } from "@api/socials.api";

export const reducers = combineReducers({
  hub: hubReducer,
  ui: uiSliceReducer,
  walletProvider: walletProviderReduce,
  [hubApi.reducerPath]: hubApi.reducer,
  [socialsApi.reducerPath]: socialsApi.reducer
});
