import { Action, configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import { reducers } from "./reducers";
import { hubApi } from "@api/hub.api";
import { socialsApi } from "@api/socials.api";
import { contributionsApi } from "@api/contributions.api";
// import storage from "redux-persist/lib/storage";
// import {
//   FLUSH,
//   PAUSE,
//   PERSIST,
//   PURGE,
//   REGISTER,
//   REHYDRATE,
//   persistReducer
// } from "redux-persist";

// import autoMergeLevel1 from "redux-persist/es/stateReconciler/autoMergeLevel1";
// const persistConfig = {
//   key: "aut-dashboard",
//   storage,
//   whitelist: [],
//   blacklist: ["walletProvider", "auth"]
//   // stateReconciler: autoMergeLevel1
// };
// const persistedReducer = persistReducer(persistConfig, reducers);

type RootState = ReturnType<typeof reducers>;

const rootReducer = (state: RootState, action: Action) => {
  if (action.type === "RESET_ALL") {
    const keepStateKeys = ["walletProvider"];
    Object.keys(state).forEach((key) => {
      if (!keepStateKeys.includes(key)) {
        delete state[key];
      } else {
        if (key === "walletProvider") {
          state[key] = {
            networksConfig: state[key]["networksConfig"]
          } as any;
        }
      }
    });
  }
  return reducers(state, action);
};

export const resetState = { type: "RESET_ALL" };

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // serializableCheck: {
      //   ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      // },
      serializableCheck: false,
      immutableCheck: false
    }).concat(
      logger,
      hubApi.middleware,
      contributionsApi.middleware,
      socialsApi.middleware
    ),
  reducer: rootReducer
});

export default store;
