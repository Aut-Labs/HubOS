import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import { reducers } from "./reducers";
import { postApi } from "@api/posts.api";

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(logger, postApi.middleware),
  reducer: reducers
});

export default store;
