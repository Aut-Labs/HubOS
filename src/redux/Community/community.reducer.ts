import { ResultState } from "@store/result-status";
import { createSlice } from "@reduxjs/toolkit";
import { fetchCommunity, updateCommunity } from "@api/community.api";
import { createSelector } from "reselect";
import { Community } from "@api/community.model";

export interface CommunityState {
  selectedCommunityAddress: string;
  communities: Community[];
  status: ResultState;
}

const initialState: CommunityState = {
  selectedCommunityAddress: null,
  communities: [],
  status: ResultState.Idle
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
    }
  },
  extraReducers: (builder) => {
    builder
      // get community
      // .addCase(setAsCoreTeam.pending, (state) => {
      //   state.status = ResultState.Loading;
      // })
      // .addCase(setAsCoreTeam.fulfilled, (state, action) => {
      //   const address = action.payload as string;
      //   state.members = Object.keys(state.members).reduce((prev, curr) => {
      //     const members = state.members[curr].map((member: AutID) => {
      //       if (member.properties.address === address) {
      //         member.properties.isAdmin = true;
      //         prev.Admins.push(member);
      //       }
      //       return member;
      //     });
      //     return {
      //       ...prev,
      //       [curr]: members
      //     };
      //   }, state.members);
      //   state.status = ResultState.Idle;
      // })
      // .addCase(setAsCoreTeam.rejected, (state, action) => {
      //   if (!action.meta.aborted) {
      //     state.status = ResultState.Failed;
      //   } else {
      //     state.status = ResultState.Idle;
      //   }
      // })
      // .addCase(removeAsCoreTeam.pending, (state) => {
      //   state.status = ResultState.Loading;
      // })
      // .addCase(removeAsCoreTeam.fulfilled, (state, action) => {
      //   const address = action.payload as string;
      //   state.status = ResultState.Idle;
      //   state.members = Object.keys(state.members).reduce((prev, curr) => {
      //     const members = state.members[curr].map((member: AutID) => {
      //       if (member.properties.address === address) {
      //         member.properties.isAdmin = false;
      //         prev.Admins.filter(
      //           (m: AutID) => m.properties.address !== address
      //         );
      //       }
      //       return member;
      //     });
      //     return {
      //       ...prev,
      //       [curr]: members
      //     };
      //   }, state.members);
      // })
      // .addCase(removeAsCoreTeam.rejected, (state, action) => {
      //   if (!action.meta.aborted) {
      //     state.status = ResultState.Failed;
      //   } else {
      //     state.status = ResultState.Idle;
      //   }
      // })
      // get community
      .addCase(fetchCommunity.pending, (state) => {
        state.status = ResultState.Loading;
      })
      .addCase(fetchCommunity.fulfilled, (state, action) => {
        state.communities = state.communities.reduce((prev, curr) => {
          if (curr.properties.address === action.payload.properties.address) {
            prev = [...prev, action.payload];
          } else {
            prev = [...prev, curr];
          }
          return prev;
        }, []);
        state.status = ResultState.Idle;
      })
      .addCase(fetchCommunity.rejected, (state, action) => {
        if (!action.meta.aborted) {
          state.status = ResultState.Failed;
        } else {
          state.status = ResultState.Idle;
        }
      })
      // update community
      .addCase(updateCommunity.pending, (state) => {
        state.status = ResultState.Updating;
      })
      .addCase(updateCommunity.fulfilled, (state, action) => {
        state.communities = state.communities.map((c) => {
          if (c.properties.address === state.selectedCommunityAddress) {
            return action.payload;
          }
          return c;
        });
        state.status = ResultState.Idle;
      })
      .addCase(updateCommunity.rejected, (state, action) => {
        if (!action.meta.aborted) {
          state.status = ResultState.Failed;
        } else {
          state.status = ResultState.Idle;
        }
      });
  }
});

export const { communityUpdateState } = communitySlice.actions;

export const CommunityStatus = (state) => state.community.status as ResultState;
export const Communities = (state) =>
  state.community.communities as Community[];
const CommunityAddress = (state) =>
  state.community.selectedCommunityAddress as string;
export const CommunityData = createSelector(
  Communities,
  CommunityAddress,
  (communities, address) => {
    return (
      communities.find((c) => c.properties.address === address) ||
      new Community()
    );
  }
);

export const allRoles = createSelector(CommunityData, (c) => {
  return c.properties?.rolesSets[0]?.roles || [];
});

export const IsAdmin = createSelector([CommunityData], (a) => {
  console.log(a, "a");
  return a?.properties?.userData?.isAdmin;
});

export default communitySlice.reducer;
