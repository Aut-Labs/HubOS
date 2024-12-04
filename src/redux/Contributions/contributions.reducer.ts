import { ResultState } from "@store/result-status";
import { createSlice } from "@reduxjs/toolkit";
import { fetchHub, updateHub } from "@api/hub.api";
import { createSelector } from "reselect";
import { HubOSHub } from "@api/hub.model";
import { HubOSAutID } from "@api/aut.model";
import { TaskType } from "@api/models/task-type";
import { TaskContributionNFT } from "@aut-labs/sdk";

export interface ContributionState {
  selectedContribution: TaskContributionNFT;
  selectedSubmission: any;
}

const initialState: ContributionState = {
  selectedContribution: null,
  selectedSubmission: null
};

export const contributionSlice = createSlice({
  name: "contribution",
  initialState,
  reducers: {
    resetContributionSet: () => initialState,
    contributionUpdateState(state, action) {
      Object.keys(action.payload).forEach((key) => {
        state[key] = action.payload[key];
      });
    },
    setSelectedContribution(state, action) {
      debugger;
      state.selectedContribution = action.payload;
    },
    setSelectedSubmission(state, action) {
      state.selectedSubmission = action.payload;
    }
  }
});

export const {
  contributionUpdateState,
  setSelectedContribution,
  setSelectedSubmission
} = contributionSlice.actions;

export const SelectedContribution = (state) =>
  state?.contribution?.selectedContribution;
export const SelectedSubmission = (state) =>
  state?.contribution?.selectedSubmission;
export const ContributionType = (state) =>
  state?.contribution?.selectedContribution?.contributionType;

export default contributionSlice.reducer;
