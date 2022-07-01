import { ResultState } from "@store/result-status";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ErrorParser } from "@utils/error-parser";
import { getLogs } from "@api/aut.api";
import {
  fetchCommunity,
  fetchMembers,
  updateCommunity,
} from "@api/community.api";
import { createSelector } from "reselect";
import { Community } from "@api/community.model";
import { AutID } from "@api/aut.model";

export const fetchLogs = createAsyncThunk(
  "community/logs",
  async (address: string, { dispatch }) => {
    try {
      return await getLogs();
    } catch (error) {
      return ErrorParser(error, dispatch);
    }
  }
);

export interface CommunityState {
  community: Community;
  communities: Community[];
  members: { [key: string]: AutID[] };
  activeRoleName: string;
  status: ResultState;
  logs: any[];
}

const initialState = {
  community: new Community(),
  members: {},
  logs: [],
  activeRole: null,
  status: ResultState.Idle,
};

export const communitySlice = createSlice({
  name: "community",
  initialState,
  reducers: {
    resetCommunityState: () => initialState,
    communityUpdateState(state, action) {
      Object.keys(action.payload).forEach((key) => {
        state[key] = action.payload[key];
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // get community
      .addCase(fetchCommunity.pending, (state) => {
        state.status = ResultState.Loading;
      })
      .addCase(fetchCommunity.fulfilled, (state, action) => {
        state.community = action.payload;
        state.status = ResultState.Idle;
      })
      .addCase(fetchCommunity.rejected, (state) => {
        state.status = ResultState.Failed;
      })
      // get community members
      .addCase(fetchMembers.pending, (state) => {
        state.status = ResultState.Loading;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.members = action.payload;
        state.status = ResultState.Idle;
      })
      .addCase(fetchMembers.rejected, (state) => {
        state.status = ResultState.Failed;
        state.members = {};
      })
      // update community
      .addCase(updateCommunity.pending, (state) => {
        state.status = ResultState.Updating;
      })
      .addCase(updateCommunity.fulfilled, (state, action) => {
        state.community = action.payload;
        state.status = ResultState.Idle;
      })
      .addCase(updateCommunity.rejected, (state) => {
        state.status = ResultState.Failed;
      })
      // update community logs
      .addCase(fetchLogs.pending, (state) => {
        state.status = ResultState.Loading;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.logs = action.payload as any[];
        // state.status = ResultState.Idle;
      })
      .addCase(fetchLogs.rejected, (state) => {
        // state.status = ResultState.Failed;
        state.logs = [];
      });
  },
});

export const { communityUpdateState } = communitySlice.actions;

export const CommunityStatus = (state) => state.community.status as ResultState;
export const CommunityData = (state) => state.community.community as Community;
export const CommunityMembers = (state) =>
  state.community.members as { [key: string]: AutID[] };

export const allRoles = createSelector(CommunityData, (c) => {
  return c.properties?.rolesSets[0]?.roles || [];
});

export const SelectedMember = (memberAddress: string) =>
  createSelector(CommunityMembers, (c) => {
    const membersKey = Object.keys(c).find((key) =>
      c[key].some(
        (member: AutID) => member.properties.address === memberAddress
      )
    );

    return (
      c[membersKey] &&
      c[membersKey].find(
        (member) => member.properties.address === memberAddress
      )
    );
  });

export default communitySlice.reducer;
