import { ipfsCIDToHttpUrl } from "./storage.api";
import { BaseQueryApi, createApi } from "@reduxjs/toolkit/query/react";
import { environment } from "./environment";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { HubArchetype, HubArchetypeParameters, HubGroupState, HubNFT } from "@aut-labs/sdk";
import { DAutHub } from "@aut-labs/d-aut";
import AutSDK, { fetchMetadata, Hub } from "@aut-labs/sdk";
import { RootState } from "@store/store.model";
import { apolloClient } from "@store/graphql";
import { gql } from "@apollo/client";
import { HubOSHub } from "./hub.model";

import Size from "@assets/icons/size.svg?react";
import Growth from "@assets/icons/growth.svg?react";
import Performance from "@assets/icons/performance.svg?react";
import Reputation from "@assets/icons/reputation.svg?react";
import Conviction from "@assets/icons/conviction.svg?react";

export const ArchetypeTypes = {
  [HubArchetype.SIZE]: {
    type: HubArchetype.SIZE,
    title: "Size",
    description:
      "A relative value that represents how “big” a Hub compared to others in the ecosystem. This Archetype encourages the largest projects to verify & maintain a positive influence in the overall ecosystem.",
    logo: Size
  },
  [HubArchetype.REPUTATION]: {
    type: HubArchetype.REPUTATION,
    title: "Reputation",
    description:
      "The average Participation Score of a Hub’s Contributors. This Archetype gives more insights about the shared trust between members, and their constant effort towards a common goal.",
    logo: Reputation
  },
  [HubArchetype.CONVICTION]: {
    type: HubArchetype.CONVICTION,
    title: "Conviction",
    description:
      "The avg. Commitment of the contributors of your Hub. This archetype is for the true believers – reflecting Members’ level of trust and belief in your project’s vision.",
    logo: Conviction
  },
  [HubArchetype.PERFORMANCE]: {
    type: HubArchetype.PERFORMANCE,
    title: "Performance",
    description:
      "The ratio between tasks created and tasks completed during a given period. This Archetype is for ambitious, coordinated communities set to create real impact and thrive.",
    logo: Performance
  },
  [HubArchetype.GROWTH]: {
    type: HubArchetype.GROWTH,
    title: "Growth",
    description:
      "Everything starts with something. This Archetype is not for the largest Hub, it’s for the ones with a continuous, organic, slow and steady growth determined by their scale.",
    logo: Growth
  }
};

export const fetchHubs = async (hubs: string[], customIpfsGateway: string) => {
  const query = gql`
    query GetHubs {
      hubs(where: { address_in: ["${hubs.join('", "')}"] }) {
        address
        domain
        deployer
        minCommitment
        metadataUri
      }
    }
  `;
  const response = await apolloClient.query<any>({
    query
  });

  const communities = await Promise.all(
    response.data.hubs.map(
      async ({ address, domain, metadataUri, deployer, minCommitment }) => {
        let metadata = await fetchMetadata<HubNFT>(
          metadataUri,
          customIpfsGateway
        );
        metadata =
          metadata ??
          new HubNFT({
            name: "Unknown",
            description: "Unknown",
            image: "",
            properties: {} as any
          });
        return new DAutHub({
          ...metadata,
          properties: {
            ...metadata.properties,
            minCommitment,
            deployer,
            address,
            domain
          }
        } as DAutHub);
      }
    )
  );
  return communities;
};

export const fetchHub = createAsyncThunk(
  "hub/get",
  async (_, { rejectWithValue, getState }) => {
    const state = getState() as RootState;
    const { selectedHubAddress } = state.hub;
    try {
      const hubs = await fetchHubs(
        [selectedHubAddress],
        environment.ipfsGatewayUrl
      );
      return hubs[0];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateHub = createAsyncThunk(
  "hub/update",
  async (body: HubOSHub, { rejectWithValue, getState }) => {
    const sdk = await AutSDK.getInstance();
    const updatedHub = HubOSHub.updateHubNFT(body);
    const uri = await sdk.client.sendJSONToIPFS(updatedHub as any);
    const hubService: Hub = sdk.initService<Hub>(Hub, body.properties.address);
    const result = await hubService.contract.metadata.setMetadataUri(uri);
    console.log("New metadata: ->", ipfsCIDToHttpUrl(uri));

    if (result.isSuccess) {
      return body;
    }
    return rejectWithValue(result?.errorMessage);
  }
);

interface UpdateAdminsData {
  added: { address: string; note: string }[];
  removed: { address: string; note: string }[];
  updated: { address: string; note: string }[];
  initialData: { address: string; note: string }[];
}

export const updateAdmins = async (
  data: UpdateAdminsData,
  api: BaseQueryApi
) => {
  const sdk = await AutSDK.getInstance();
  try {
    const addedAddresses = data.added.map((x) => x.address);
    const adminsAddResult = await sdk.hub.addAdmins(addedAddresses);

    // const removedAddresses = data.removed.map((x) => x.address);
    // sdk.hub.removeAdmin(removedAddresses);
    return {
      data: adminsAddResult
    };
  } catch (error) {
    return {
      error
    };
  }
};

export const getArchetypeAndStats = async (body, api: BaseQueryApi) => {
  const sdk = await AutSDK.getInstance(true);

  const address = (api.getState() as any)?.hub?.selectedHubAddress;
  // const hub: Hub = sdk.initService<Hub>(Hub, address);
  // const localReputation: LocalReputation = sdk.localReputation;

  try {
    // const response = await hub.contract.getArchetype();
    // const stats = await localReputation.contract.getHubLocalReputationStats(
    //   address
    // );
    return {
      data: {
        archetype: {
          archetype: Number(1),
          size: Number(20),
          reputation: Number(20),
          conviction: Number(20),
          performance: Number(20),
          growth: Number(20)
        },
        stats: {
          lastPeriod: 0,
          TCL: 0,
          TCP: 0,
          k: 0,
          penalty: 0,
          c: 0,
          p: "",
          commitHash: "",
          lrUpdatesPerPeriod: 0,
          periodHubParameters: {
            aDiffMembersLP: 0,
            bMembersLastLP: 0,
            cAverageRepLP: 0,
            dAverageCommitmentLP: 0,
            ePerformanceLP: 0
          }
        }
      }
    };
  } catch (error) {
    return {
      error
    };
  }
};

export const setArchetype = async (
  body: HubArchetypeParameters,
  api: BaseQueryApi
) => {
  const sdk = await AutSDK.getInstance();

  const address = (api.getState() as any)?.hub?.selectedHubAddress;
  const hub: Hub = sdk.initService<Hub>(Hub, address);
  try {
    const response = await hub.contract.setArchetype(body);
    return {
      data: response?.data
    };
  } catch (error) {
    return {
      error
    };
  }
};

export const hubApi = createApi({
  reducerPath: "hubApi",
  baseQuery: async (args, api, extraOptions) => {
    const { url, body } = args;
    if (url === "updateAdmins") {
      return updateAdmins(body, api);
    }

    if (url === "getArchetypeAndStats") {
      return getArchetypeAndStats(body, api);
    }

    if (url === "setArchetype") {
      return setArchetype(body, api);
    }
    return {
      data: "Test"
    };
  },
  tagTypes: [ "Archetype"],
  endpoints: (builder) => ({
    getArchetypeAndStats: builder.query<
      {
        archetype: HubArchetypeParameters;
        stats: HubGroupState;
      },
      void
    >({
      providesTags: ["Archetype"],
      query: (body) => {
        return {
          body,
          url: "getArchetypeAndStats"
        };
      }
    }),
    setArchetype: builder.mutation<
      HubArchetypeParameters,
      HubArchetypeParameters
    >({
      invalidatesTags: ["Archetype"],
      query: (body) => {
        return {
          body,
          url: "setArchetype"
        };
      }
    }),
    updateAdmins: builder.mutation({
      query: (body) => {
        return {
          body,
          url: "updateAdmins"
        };
      },
    })
  })
});

export const {
  useUpdateAdminsMutation,
  useGetArchetypeAndStatsQuery,
  useSetArchetypeMutation
} = hubApi;
