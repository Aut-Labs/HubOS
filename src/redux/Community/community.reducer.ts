import { ResultState } from "@store/result-status";
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCommunity,
  updateCommunity,
  updateDiscordSocials
} from "@api/community.api";
import { createSelector } from "reselect";
import { socialUrls } from "@api/aut.model";
import { DAutHub } from "@aut-labs/d-aut";

export interface CommunityState {
  selectedCommunityAddress: string;
  communities: DAutHub[];
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
      .addCase(fetchCommunity.pending, (state) => {
        state.status = ResultState.Loading;
      })
      .addCase(fetchCommunity.fulfilled, (state, action: any) => {
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
      .addCase(updateCommunity.fulfilled, (state: any, action) => {
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
      })
      .addCase(updateDiscordSocials.pending, (state) => {
        state.status = ResultState.Loading;
      })
      .addCase(updateDiscordSocials.fulfilled, (state, action) => {
        state.communities = state.communities.map((c) => {
          if (c.properties.address === state.selectedCommunityAddress) {
            return action.payload;
          }
          return c;
        });
        state.status = ResultState.Idle;
      })
      .addCase(updateDiscordSocials.rejected, (state, action) => {
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
export const Communities = (state) => state.community.communities as DAutHub[];
const CommunityAddress = (state) =>
  state.community.selectedCommunityAddress as string;
export const CommunityData = createSelector(
  Communities,
  CommunityAddress,
  (communities, address) => {
    console.log(communities, address);
    return (
      communities.find((c) => c.properties.address === address) || new DAutHub()
    );
  }
);

export const IsDiscordVerified = createSelector(CommunityData, (c) => {
  try {
    const social = c.properties.socials.find((s) => s.type === "discord");
    if (
      typeof social?.link === "string" &&
      social?.link?.replace("https://discord.gg/", "")?.length > 0
    ) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
});

export const IsSocialVerified = (type: string) =>
  createSelector(CommunityData, (c) => {
    try {
      const social = c.properties.socials.find((s) => s.type === type);
      if (
        typeof social?.link === "string" &&
        social?.link?.replace(socialUrls[type], "")?.length > 0
      ) {
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  });

export const DiscordLink = createSelector(
  [CommunityData, IsDiscordVerified],
  (c, isVerified) => {
    if (!isVerified) return "";
    return c.properties.socials.find((s) => s.type === "discord")?.link;
  }
);

export const allRoles = createSelector(CommunityData, (c) => {
  return c.properties?.rolesSets[0]?.roles || [];
});

export const IsAdmin = createSelector([CommunityData], (a) => false);

export default communitySlice.reducer;
