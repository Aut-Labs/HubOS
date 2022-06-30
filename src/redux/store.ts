import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import { reducers } from './reducers';

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(logger),
  reducer: reducers,
});

export default store;
