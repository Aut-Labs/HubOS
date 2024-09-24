import { ResultState } from "@store/result-status";
import { createSlice } from "@reduxjs/toolkit";
import { fetchHub, updateHub } from "@api/hub.api";
import { createSelector } from "reselect";
import { HubOSHub } from "@api/hub.model";
import { HubOSAutID } from "@api/aut.model";

export interface HubState {
  selectedHubAddress: string;
  hubs: HubOSHub[];
  autID: HubOSAutID;
  status: ResultState;
}

const initialState: HubState = {
  selectedHubAddress: null,
  hubs: [],
  autID: null,
  status: ResultState.Idle
};

export const hubSlice = createSlice({
  name: "hub",
  initialState,
  reducers: {
    resetHubState: () => initialState,
    hubUpdateState(state, action) {
      Object.keys(action.payload).forEach((key) => {
        state[key] = action.payload[key];
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHub.pending, (state) => {
        state.status = ResultState.Loading;
      })
      .addCase(fetchHub.fulfilled, (state, action: any) => {
        state.hubs = state.hubs.reduce((prev, curr) => {
          if (curr.properties.address === action.payload.properties.address) {
            prev = [...prev, action.payload];
          } else {
            prev = [...prev, curr];
          }
          return prev;
        }, []);
        state.status = ResultState.Idle;
      })
      .addCase(fetchHub.rejected, (state, action) => {
        if (!action.meta.aborted) {
          state.status = ResultState.Failed;
        } else {
          state.status = ResultState.Idle;
        }
      })
      .addCase(updateHub.pending, (state) => {
        state.status = ResultState.Updating;
      })
      .addCase(updateHub.fulfilled, (state: any, action) => {
        state.communities = state.communities.map((c) => {
          if (c.properties.address === state.selectedHubAddress) {
            return action.payload;
          }
          return c;
        });
        state.status = ResultState.Idle;
      })
      .addCase(updateHub.rejected, (state, action) => {
        if (!action.meta.aborted) {
          state.status = ResultState.Failed;
        } else {
          state.status = ResultState.Idle;
        }
      });
  }
});

export const { hubUpdateState } = hubSlice.actions;

export const HubStatus = (state) => state.hub.status as ResultState;
export const Hubs = (state) => state.hub.hubs as HubOSHub[];
export const HubAddress = (state) => state.hub.selectedHubAddress as string;

export const HubData = createSelector(Hubs, HubAddress, (hubs, address) => {
  return hubs.find((c) => c.properties.address === address);
});
export const AutIDData = (state) => state.hub.autID as HubOSAutID;

export default hubSlice.reducer;
