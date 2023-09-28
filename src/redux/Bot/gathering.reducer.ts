import { addGroupCall } from "@api/activities.api";
import { createSlice } from "@reduxjs/toolkit";
import { ResultState } from "@store/result-status";

export interface GatheringState {
  title: string;
  description: string;
  startDate: Date;
  startTime: string;
  duration: string;
  roles: [string];
}

const initialState: GatheringState = {
  title: null,
  description: null,
  startDate: null,
  startTime: null,
  duration: null,
  roles: null
};

export const gatheringSlice = createSlice({
  name: "gathering",
  initialState,
  reducers: {
    updateGatheringData(state, action) {
      Object.keys(action.payload).forEach((key) => {
        state[key] = action.payload[key];
      });
    },
    resetGatheringData: () => initialState
  }
});

export const { updateGatheringData, resetGatheringData } =
  gatheringSlice.actions;

export const ActivityGroupCallData = (state: any) =>
  state.call.callData as typeof initialState;

export default gatheringSlice.reducer;
