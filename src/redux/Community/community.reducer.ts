import { ResultState } from '@store/result-status';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ErrorParser } from '@utils/error-parser';
import { getLogs } from '@api/aut.api';
import { fetchCommunity, fetchMember, fetchMembers, removeAsCoreTeam, setAsCoreTeam, updateCommunity } from '@api/community.api';
import { createSelector } from 'reselect';
import { Community } from '@api/community.model';
import { AutID } from '@api/aut.model';

export const fetchLogs = createAsyncThunk('community/logs', async (address: string, { dispatch }) => {
  try {
    return await getLogs();
  } catch (error) {
    return ErrorParser(error, dispatch);
  }
});

export interface CommunityState {
  community: Community;
  communities: Community[];
  members: { [key: string]: AutID[] };
  activeRoleName: string;
  status: ResultState;
  memberStatus: ResultState;
  logs: any[];
}

const initialState = {
  community: new Community(),
  members: {} as { [key: string]: AutID[] },
  logs: [],
  activeRole: null,
  status: ResultState.Idle,
  memberStatus: ResultState.Idle,
};

export const communitySlice = createSlice({
  name: 'community',
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
      .addCase(setAsCoreTeam.pending, (state) => {
        state.status = ResultState.Loading;
      })
      .addCase(setAsCoreTeam.fulfilled, (state, action) => {
        const address = action.payload as string;
        state.members = Object.keys(state.members).reduce((prev, curr) => {
          const members = state.members[curr].map((member: AutID) => {
            if (member.properties.address === address) {
              member.properties.isCoreTeam = true;
              prev.Admins.push(member);
            }
            return member;
          });
          return {
            ...prev,
            [curr]: members,
          };
        }, state.members);
        state.status = ResultState.Idle;
      })
      .addCase(setAsCoreTeam.rejected, (state, action) => {
        if (!action.meta.aborted) {
          state.status = ResultState.Failed;
        } else {
          state.status = ResultState.Idle;
        }
      })
      .addCase(removeAsCoreTeam.pending, (state) => {
        state.status = ResultState.Loading;
      })
      .addCase(removeAsCoreTeam.fulfilled, (state, action) => {
        const address = action.payload as string;
        state.status = ResultState.Idle;
        state.members = Object.keys(state.members).reduce((prev, curr) => {
          const members = state.members[curr].map((member: AutID) => {
            if (member.properties.address === address) {
              member.properties.isCoreTeam = false;
              prev.Admins.filter((m: AutID) => m.properties.address !== address);
            }
            return member;
          });
          return {
            ...prev,
            [curr]: members,
          };
        }, state.members);
      })
      .addCase(removeAsCoreTeam.rejected, (state, action) => {
        if (!action.meta.aborted) {
          state.status = ResultState.Failed;
        } else {
          state.status = ResultState.Idle;
        }
      })
      // get community
      .addCase(fetchCommunity.pending, (state) => {
        state.status = ResultState.Loading;
      })
      .addCase(fetchCommunity.fulfilled, (state, action) => {
        state.community = action.payload;
        state.status = ResultState.Idle;
      })
      .addCase(fetchCommunity.rejected, (state, action) => {
        if (!action.meta.aborted) {
          state.status = ResultState.Failed;
        } else {
          state.status = ResultState.Idle;
        }
      })
      // get community members
      .addCase(fetchMembers.pending, (state) => {
        state.status = ResultState.Loading;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.members = action.payload;
        state.status = ResultState.Idle;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        if (!action.meta.aborted) {
          state.status = ResultState.Failed;
        } else {
          state.status = ResultState.Idle;
        }
        state.members = {};
      })
      // get community members
      .addCase(fetchMember.pending, (state) => {
        state.memberStatus = ResultState.Loading;
      })
      .addCase(fetchMember.fulfilled, (state, action) => {
        state.members = {
          ...state.members,
          ...action.payload,
        };
        state.memberStatus = ResultState.Idle;
      })
      .addCase(fetchMember.rejected, (state, action) => {
        if (!action.meta.aborted) {
          state.memberStatus = ResultState.Failed;
        } else {
          state.memberStatus = ResultState.Idle;
        }
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
      .addCase(updateCommunity.rejected, (state, action) => {
        if (!action.meta.aborted) {
          state.status = ResultState.Failed;
        } else {
          state.status = ResultState.Idle;
        }
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
export const MemberStatus = (state) => state.community.memberStatus as ResultState;
export const CommunityData = (state) => state.community.community as Community;
export const Communities = (state) => state.community.communities as Community[];
export const CommunityMembers = (state) => state.community.members as { [key: string]: AutID[] };

export const allRoles = createSelector(CommunityData, (c) => {
  return c.properties?.rolesSets[0]?.roles || [];
});

export const SelectedMember = (memberAddress: string) =>
  createSelector(CommunityMembers, (c) => {
    const membersKey = Object.keys(c).find((key) => c[key].some((member: AutID) => member.properties.address === memberAddress));

    return c[membersKey] && c[membersKey].find((member) => member.properties.address === memberAddress);
  });

export default communitySlice.reducer;
