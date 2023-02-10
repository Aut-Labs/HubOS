import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import { reducers } from "./reducers";
import { pluginRegistryApi } from "@api/plugin-registry.api";
import { onboardingQuestApi } from "@api/onboarding-quest.api";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import { communityApi } from "@api/community.api";
import { onboardingTasksApi } from "@api/onboarding-tasks.api";
import autoMergeLevel1 from "redux-persist/es/stateReconciler/autoMergeLevel1";

const persistConfig = {
  key: "aut-dashboard",
  storage,
  blacklist: ["walletProvider", "auth"],
  stateReconciler: autoMergeLevel1
};
const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false
    }).concat(
      logger,
      onboardingTasksApi.middleware,
      pluginRegistryApi.middleware,
      onboardingQuestApi.middleware,
      communityApi.middleware
    ),
  reducer: persistedReducer
});

export default store;
