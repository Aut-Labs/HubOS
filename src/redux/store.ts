import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import { reducers } from "./reducers";
import { pluginRegistryApi } from "@api/plugin-registry.api";
import { onboardingApi } from "@api/onboarding.api";
import storage from "redux-persist/lib/storage";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer
} from "redux-persist";
import { communityApi } from "@api/community.api";
// import autoMergeLevel1 from "redux-persist/es/stateReconciler/autoMergeLevel1";
// const persistConfig = {
//   key: "aut-dashboard",
//   storage,
//   whitelist: [],
//   blacklist: ["walletProvider", "auth"]
//   // stateReconciler: autoMergeLevel1
// };
// const persistedReducer = persistReducer(persistConfig, reducers);

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
      pluginRegistryApi.middleware,
      onboardingApi.middleware,
      communityApi.middleware
    ),
  reducer: reducers
});

export default store;
