import axios from "axios";
import { CommitmentMessages } from "@utils/misc";
import { Community, CommunityDomains, findRoleName } from "./community.model";
import { Web3ThunkProviderFactory } from "./ProviderFactory/web3-thunk.provider";
import { ipfsCIDToHttpUrl, isValidUrl } from "./storage.api";
import { AutID, DAOMember } from "./aut.model";
import AutSDK, { Allowlist, Nova, fetchMetadata } from "@aut-labs/sdk";
import { BaseQueryApi, createApi } from "@reduxjs/toolkit/query/react";
import { base64toFile } from "@utils/to-base-64";
import { environment } from "./environment";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { NovaArchetypeParameters } from "@aut-labs/sdk/dist/models/dao";

const communityExtensionThunkProvider = Web3ThunkProviderFactory(
  "CommunityExtension",
  {
    provider: null
  }
);

export const fetchCommunity = communityExtensionThunkProvider(
  {
    type: "community/get"
  },
  (thunkAPI) => {
    const state = thunkAPI.getState();
    const { selectedCommunityAddress } = state.community;
    return Promise.resolve(selectedCommunityAddress);
  },
  async (contract, _) => {
    const [, , uri] = await contract.getComData();

    const metadata: Community = (await axios.get(ipfsCIDToHttpUrl(uri))).data;
    const community = new Community(metadata);
    return community;
  }
);

// export const fetchCommunity = createAsyncThunk(
//   "community/get",
//   async (_, { rejectWithValue, getState }) => {
//     const sdk = AutSDK.getInstance();
//     const state = getState() as any;
//     const { selectedCommunityAddress } = state.community;
//     const response = await sdk..getComData(
//       requestBody.daoAddr,
//       requestBody.daoType
//     );
//     if (response?.isSuccess) {
//       return response.data;
//     }
//     return rejectWithValue(response?.errorMessage);
//   }
// );

export const getWhitelistedAddresses = communityExtensionThunkProvider(
  {
    type: "aut-dashboard/addresses/get"
  },
  (thunkAPI) => {
    const state = thunkAPI.getState();
    const { selectedCommunityAddress } = state.community;
    return Promise.resolve(selectedCommunityAddress);
  },
  async (contract, _, { getState }) => {
    const { auth } = getState();
    const memberAddresses = await contract.getAllMembers();
    // const names = await getCoreTeamMemberNames(auth.userInfo.community);
    // return memberAddresses.map((a) => ({
    //   address: a,
    //   name:
    //     names.coreTeamMembers.find((c) => c.memberAddress === a)?.memberName ||
    //     "N/A",
    // }));
  }
);

export const addNewWhitelistedAddresses = communityExtensionThunkProvider(
  {
    type: "aut-dashboard/addresses/add"
    // event: AutIDCommunityContractEventType.CoreTeamMemberAdded,
  },
  (thunkAPI) => {
    const state = thunkAPI.getState();
    const { selectedCommunityAddress } = state.community;
    return Promise.resolve(selectedCommunityAddress);
  },
  async (contract, newMembers, { dispatch, getState }) => {
    const { auth } = getState();
    // for (const newMember of newMembers) {
    //   await contract.addNewCoreTeamMembers(newMember.address);
    //   await addCoreTeamName(
    //     auth?.userInfo?.community,
    //     newMember.address,
    //     newMember.name
    //   );
    // }
    return dispatch(getWhitelistedAddresses(auth.userInfo.community));
  }
);

export const whitelistAddress = communityExtensionThunkProvider(
  {
    type: "aut-dashboard/addresses/add"
    // event: CommunityExtensionContractEventType.MemberAdded,
  },
  (thunkAPI) => {
    const state = thunkAPI.getState();
    const { selectedCommunityAddress } = state.community;
    return Promise.resolve(selectedCommunityAddress);
  },
  async (contract, newMembers, { dispatch, getState }) => {
    const { auth } = getState();
    // await contract.addNewCoreTeamMembers(newMember.address);
    return dispatch(getWhitelistedAddresses(auth.userInfo.community));
  }
);

export const setAsCoreTeam = communityExtensionThunkProvider(
  {
    type: "aut-dashboard/core-team/add"
  },
  (thunkAPI) => {
    const state = thunkAPI.getState();
    const { selectedCommunityAddress } = state.community;
    return Promise.resolve(selectedCommunityAddress);
  },
  async (contract, memberAddress) => {
    const result = await contract.addToCoreTeam(memberAddress);
    return memberAddress;
  }
);

export const removeAsCoreTeam = communityExtensionThunkProvider(
  {
    type: "aut-dashboard/core-team/remove"
  },
  (thunkAPI) => {
    const state = thunkAPI.getState();
    const { selectedCommunityAddress } = state.community;
    return Promise.resolve(selectedCommunityAddress);
  },
  async (contract, memberAddress) => {
    const result = await contract.removeFromCoreTeam(memberAddress);
    return memberAddress;
  }
);

interface UpdateDiscordData {
  community: Community;
  inviteLink: string;
}

export const updateDiscordSocials = createAsyncThunk(
  "community/update",
  async (args: UpdateDiscordData, { rejectWithValue, getState }) => {
    const sdk = AutSDK.getInstance();
    const updatedCommunity = Community.updateCommunity(args.community);
    const uri = await sdk.client.storeAsBlob(updatedCommunity);
    const state = getState();
    const { selectedCommunityAddress } = state["community"];

    sdk.nova = sdk.initService<Nova>(Nova, selectedCommunityAddress);

    console.log("New metadata: ->", ipfsCIDToHttpUrl(uri));
    const response = await sdk.nova.contract.metadata.setMetadataUri(uri);

    if (response.isSuccess) {
      const autIdData = JSON.parse(window.localStorage.getItem("aut-data"));
      let foundSocial = false;
      for (let i = 0; i < autIdData.properties.communities.length; i++) {
        if (foundSocial) {
          break;
        }
        const community = autIdData.properties.communities[i];
        if (community.name === args.community.name)
          for (let i = 0; i < community.properties.socials.length; i++) {
            const social = community.properties.socials[i];
            if (social.type === "discord") {
              social.link = args.inviteLink;
              foundSocial = true;
              break;
            }
          }
      }
      window.localStorage.setItem("aut-data", JSON.stringify(autIdData));
      return args.community;
    }
    return rejectWithValue(response?.errorMessage);
  }
);

export const updateCommunity = communityExtensionThunkProvider(
  {
    type: "community/update"
  },
  (thunkAPI) => {
    const state = thunkAPI.getState();
    const { selectedCommunityAddress } = state.community;
    return Promise.resolve(selectedCommunityAddress);
  },
  async (contract, community) => {
    if (community.image && !isValidUrl(community.image as string)) {
      const file = base64toFile(community.image as string, "image");
      // community.image = await storeImageAsBlob(file as File);
    }

    // const uri = await storeAsBlob(Community.updateCommunity(community));
    // await contract.setMetadataUri(uri);
    return community;
  }
);

export const fetchMember = communityExtensionThunkProvider(
  {
    type: "community/member/get"
  },
  async (thunkAPI) => {
    const state = thunkAPI.getState();
    const { selectedCommunityAddress } = state.community;
    return Promise.resolve(selectedCommunityAddress);
  },
  async (contract, memberAddress, thunkAPI) => {
    const state = thunkAPI.getState();
    const AutIDsResponse: { [role: string]: AutID[] } = {};
    const communities = state.community.communities as Community[];
    const communityAddress = state.community.selectedCommunityAddress as string;
    const community = communities.find(
      (c) => c.properties.address === communityAddress
    );

    const filteredRoles = community.properties.rolesSets[0].roles;

    for (let i = 0; i < filteredRoles.length; i += 1) {
      AutIDsResponse[filteredRoles[i].roleName] = [];
    }

    AutIDsResponse.Admins = [];

    // const autContract = await Web3AutIDProvider(environment.autIDAddress);
    // const tokenId = await autContract.getAutIDByOwner(memberAddress);
    // const metadataCID = await autContract.tokenURI(Number(tokenId.toString()));
    // const [, role, commitment] = await autContract.getCommunityData(
    //   memberAddress,
    //   community.properties.address
    // );
    // const jsonUri = ipfsCIDToHttpUrl(metadataCID);
    // const jsonMetadata: AutID = (await axios.get(jsonUri)).data;
    // const roleName = findRoleName(
    //   role.toString(),
    //   community.properties.rolesSets
    // );

    const isCoreTeam = await contract.isCoreTeam(memberAddress);
    // const member = new AutID({
    //   ...jsonMetadata,
    //   properties: {
    //     ...jsonMetadata.properties,
    //     address: memberAddress,
    //     role: role.toString(),
    //     roleName,
    //     tokenId: tokenId.toString(),
    //     commitmentDescription: CommitmentMessages(commitment),
    //     commitment: commitment.toString(),
    //     isCoreTeam
    //   } as any
    // });
    // if (isCoreTeam) {
    //   AutIDsResponse.Admins.push(member);
    // }
    // AutIDsResponse[roleName].push(member);
    return AutIDsResponse;
  }
);

export const getPAUrl = communityExtensionThunkProvider(
  {
    type: "community/url/get"
  },
  (thunkAPI) => {
    const state = thunkAPI.getState();
    const { selectedCommunityAddress } = state.community;
    return Promise.resolve(selectedCommunityAddress);
  },
  async (contract) => {
    const urls = await contract.getURLs();
    return urls?.length > 0 ? urls[urls.length - 1] : undefined;
  }
);

export const getPAContracts = communityExtensionThunkProvider(
  {
    type: "aut-dashboard/contracts/get"
  },
  (thunkAPI) => {
    const state = thunkAPI.getState();
    const { selectedCommunityAddress } = state.community;
    return Promise.resolve(selectedCommunityAddress);
  },
  async (contract) => {
    // const contracts = await contract.getImportedAddresses();
    // return contracts;
  }
);

export const addPAContracts = communityExtensionThunkProvider(
  {
    type: "aut-dashboard/contracts/add"
    // event: CommunityExtensionContractEventType.ActivitiesAddressAdded,
  },
  (thunkAPI) => {
    const state = thunkAPI.getState();
    const { selectedCommunityAddress } = state.community;
    return Promise.resolve(selectedCommunityAddress);
  },
  async (contract, payload, { dispatch }) => {
    const { newItems } = payload;
    for (const item of newItems) {
      // await contract.addNewContractAddressToAgreement(item.address);
    }
    return dispatch(getPAContracts(null));
  }
);

export const addDiscordToCommunity = communityExtensionThunkProvider(
  {
    type: "community/integrate/discord"
  },
  (thunkAPI) => {
    const state = thunkAPI.getState();
    const { selectedCommunityAddress } = state.community;
    return Promise.resolve(selectedCommunityAddress);
  },
  async (contract, discordId) => {
    const result = await contract.setDiscordServer(discordId);
    return result;
  }
);

export const addPAUrl = communityExtensionThunkProvider(
  {
    type: "community/url/add"
  },
  (thunkAPI) => {
    const state = thunkAPI.getState();
    const { selectedCommunityAddress } = state.community;
    return Promise.resolve(selectedCommunityAddress);
  },
  async (contract, daoUrl, { dispatch }) => {
    await contract.addURL(daoUrl);
    return dispatch(getPAUrl(null));
  }
);

const getMembers = async (body, api: BaseQueryApi) => {
  const state: any = api.getState();
  const { selectedCommunityAddress, communities } = state.community;
  const community: Community = communities.find(
    (c) => c.properties.address === selectedCommunityAddress
  );

  const sdk = AutSDK.getInstance();
  sdk.nova = sdk.initService<Nova>(Nova, selectedCommunityAddress);

  const members: DAOMember[] = [];
  const membersResponse = await sdk.nova.contract.members.getAllMembers();
  if (!membersResponse) {
    return {
      data: members
    };
  }

  for (let i = 0; i < membersResponse?.data?.length; i += 1) {
    try {
      const memberAddress = membersResponse.data[i];
      const autIdResponse = await sdk.autID.findAutID(memberAddress);
      const { tokenId, metadataUri } = autIdResponse.data;
      const metadata = await fetchMetadata<DAOMember>(
        metadataUri,
        environment.nftStorageUrl
      );
      const comDataResponse = await sdk.autID.contract.getCommunityMemberData(
        memberAddress,
        selectedCommunityAddress
      );
      const { role, commitment } = comDataResponse.data;
      const roleName = findRoleName(role, community.properties.rolesSets);
      const isAdminResponse = await sdk.nova.contract.admins.isAdmin(
        memberAddress
      );
      const member = new DAOMember({
        ...metadata,
        properties: {
          ...metadata.properties,
          address: memberAddress,
          role: {
            id: Number(role),
            roleName
          },
          tokenId: tokenId,
          commitmentDescription: CommitmentMessages(Number(commitment)),
          commitment: commitment,
          isAdmin: isAdminResponse.data
        }
      });
      members.push(member);
    } catch (error) {
      // handle error
    }
  }
  return {
    data: members
  };
};

interface UpdateAdminsData {
  added: { address: string; note: string }[];
  removed: { address: string; note: string }[];
  updated: { address: string; note: string }[];
  initialData: { address: string; note: string }[];
}

// export const updateAdmins = createAsyncThunk(
//   "community/admins/update",
//   async (args: UpdateAdminsData, { rejectWithValue, getState, dispatch }) => {
//     const sdk = AutSDK.getInstance();
//     try {
//       args.added.forEach(async (address) => {
//         const response = await sdk.nova.contract.functions.addAdmin(
//           address
//         );
//       });
//       args.removed.forEach(async (address) => {
//         const response = await sdk.nova.contract.functions.removeAdmin(
//           address
//         );
//       });
//       dispatch(fetchCommunity(null));
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

const getAddAdminsPromise = async (sdk: AutSDK, address: string, note = "") => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const response = await sdk.nova.addAdmin(address);
      if (!response.isSuccess) {
        reject(response.errorMessage);
      }
      resolve(response);
    } catch (e) {
      return reject(e);
    }
  });
};

const getRemoveAdminsPromise = async (sdk: AutSDK, address: string) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const response = await sdk.nova.removeAdmin(address);
      if (!response.isSuccess) {
        reject(response.errorMessage);
      }
      resolve(response);
    } catch (e) {
      return reject(e);
    }
  });
};

export const updateAdmins = async (
  data: UpdateAdminsData,
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  try {
    const promises = [];
    data.added.forEach(async (admin) => {
      promises.push(getAddAdminsPromise(sdk, admin.address));
    });
    data.removed.forEach(async (admin) => {
      promises.push(getRemoveAdminsPromise(sdk, admin.address));
    });

    const result = await Promise.all(promises);

    // const updated = data.updated.filter(
    //   (x) =>
    //     x.note !== data.initialData.find((a) => a.address === x.address).note
    // );

    const address = (api.getState() as any)?.community
      ?.selectedCommunityAddress;

    if (data.removed.length > 0) {
      const mapped = data.removed.map((x) => x.address);
      const notesDelete = await axios.delete(
        `${environment.apiUrl}/autid/user/notes/addresses`,
        {
          data: {
            daoAddress: address,
            admins: [...mapped]
          }
        }
      );
    }

    if (data.added.length > 0 || data.updated.length > 0) {
      const notesResult = await axios.post(
        `${environment.apiUrl}/autid/user/notes/setmany`,
        {
          daoAddress: address,
          admins: [...data.added, ...data.updated]
        }
      );
    }
    return {
      data: result
    };
  } catch (error) {
    return {
      error
    };
  }
};

export const vouchForAFriend = async (
  friendAddress: string,
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();

  const allowList: Allowlist = sdk.allowlist;
  try {
    await allowList.contract.addToAllowlist(friendAddress);
    return {
      data: true
    };
  } catch (error) {
    return {
      error
    };
  }
};

export const canVouchForAFriend = async (
  userAddress: string,
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  const allowList: Allowlist = sdk.allowlist;
  try {
    const response = await allowList.contract.functions.canAllowList(
      userAddress
    );
    return {
      data: response
    };
  } catch (error) {
    return {
      error
    };
  }
};

export const updateDomains = async (
  data: {
    community: Community;
    refetch: any;
    domains: CommunityDomains[];
  },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  try {
    const updatedCommunity = Community.updateCommunity({
      ...data.community,
      properties: {
        ...data.community.properties,
        domains: data.domains
      }
    });

    console.log(updatedCommunity, "updatedCommunity");
    const uri = await sdk.client.storeAsBlob(updatedCommunity);
    const state = api.getState();
    const { selectedCommunityAddress } = state["community"];

    sdk.nova = sdk.initService<Nova>(Nova, selectedCommunityAddress);

    console.log("New metadata: ->", ipfsCIDToHttpUrl(uri));
    const response = await sdk.nova.contract.metadata.setMetadataUri(uri);

    if (response.isSuccess) {
      const autIdData = JSON.parse(window.localStorage.getItem("aut-data"));
      const communities: Community[] = autIdData.properties.communities;
      const community = communities.find((c) => c.name === data.community.name);
      community.properties.domains = data.domains;
      window.localStorage.setItem("aut-data", JSON.stringify(autIdData));
      await data.refetch();
    }

    return {
      data
    };
  } catch (error) {
    console.log(error);
    return {
      error
    };
  }
};

const getCommunity = async (daoAddress: string, api: BaseQueryApi) => {
  const sdk = AutSDK.getInstance();

  const address = (api.getState() as any)?.community?.selectedCommunityAddress;
  const nova: Nova = sdk.initService<Nova>(Nova, address);

  const response = await nova.contract.metadata.getMetadataUri();
  if (!response.isSuccess) {
    return {
      error: response.errorMessage
    };
  }

  const metadata = await fetchMetadata<Community>(
    response.data,
    environment.nftStorageUrl
  );

  const adminResponse = await nova.contract.admins.getAdmins();
  const filteredEmptyAddresses = adminResponse.data.filter(
    (address) => address !== ethers.constants.AddressZero
  );

  const notes = await axios
    .post(`${environment.apiUrl}/autid/user/notes/addresses`, {
      daoAddress: address,
      admins: filteredEmptyAddresses
    })
    .then((res) => res.data);
  const getNotes = filteredEmptyAddresses.map((address) => {
    return {
      address: address,
      note: notes.find((x) => x.address === address)?.note
    };
  });
  const community = new Community(metadata);
  return {
    data: {
      community,
      admin: adminResponse.data[0],
      admins: getNotes
    }
  };
};

export const getArchetypeAndStats = async (body, api: BaseQueryApi) => {
  const sdk = AutSDK.getInstance();

  const address = (api.getState() as any)?.community?.selectedCommunityAddress;
  const nova: Nova = sdk.initService<Nova>(Nova, address);
  try {
    const response = await nova.contract.getArchetype();
    return {
      data: response?.data
    };
  } catch (error) {
    return {
      error
    };
  }
};

export const setArchetype = async (
  body: NovaArchetypeParameters,
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();

  const address = (api.getState() as any)?.community?.selectedCommunityAddress;
  const nova: Nova = sdk.initService<Nova>(Nova, address);
  try {
    const response = await nova.contract.setArchetype(body);
    return {
      data: response?.data
    };
  } catch (error) {
    return {
      error
    };
  }
};

export const communityApi = createApi({
  reducerPath: "communityApi",
  baseQuery: async (args, api, extraOptions) => {
    const { url, body } = args;
    if (url === "getAllMembers") {
      return getMembers(body, api);
    }

    if (url === "canVouchForAFriend") {
      return canVouchForAFriend(body, api);
    }

    if (url === "vouchForAFriend") {
      return vouchForAFriend(body, api);
    }

    if (url === "getCommunity") {
      return getCommunity(body, api);
    }

    if (url === "updateAdmins") {
      return updateAdmins(body, api);
    }

    if (url === "updateDomains") {
      return updateDomains(body, api);
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
  tagTypes: ["Community", "Vouch", "Archetype"],
  endpoints: (builder) => ({
    getAllMembers: builder.query<DAOMember[], void>({
      query: (body) => {
        return {
          body,
          url: "getAllMembers"
        };
      }
    }),
    getArchetypeAndStats: builder.query<NovaArchetypeParameters, void>({
      providesTags: ["Archetype"],
      query: (body) => {
        return {
          body,
          url: "getArchetypeAndStats"
        };
      }
    }),
    setArchetype: builder.mutation<
      NovaArchetypeParameters,
      NovaArchetypeParameters
    >({
      invalidatesTags: ["Archetype"],
      query: (body) => {
        return {
          body,
          url: "setArchetype"
        };
      }
    }),
    canVouchForAFriend: builder.query<boolean, string>({
      providesTags: ["Vouch"],
      query: (body) => {
        return {
          body,
          url: "canVouchForAFriend"
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
      invalidatesTags: ["Community"]
    }),
    updateDomains: builder.mutation<
      {
        community: Community;
        domains: CommunityDomains[];
      },
      any
    >({
      query: (body) => {
        return {
          body,
          url: "updateDomains"
        };
      },
      invalidatesTags: ["Community"]
    }),
    vouchForAFriend: builder.mutation<boolean, string>({
      query: (body) => {
        return {
          body,
          url: "vouchForAFriend"
        };
      },
      invalidatesTags: ["Vouch"]
    }),
    getCommunity: builder.query<
      {
        community: Community;
        admin: string;
        admins: { address: string; note: string }[];
      },
      void
    >({
      query: (body) => {
        return {
          body,
          url: "getCommunity"
        };
      },
      providesTags: ["Community"]
    })
  })
});

export const {
  useGetAllMembersQuery,
  useGetCommunityQuery,
  useUpdateAdminsMutation,
  useUpdateDomainsMutation,
  useCanVouchForAFriendQuery,
  useVouchForAFriendMutation,
  useGetArchetypeAndStatsQuery,
  useSetArchetypeMutation
} = communityApi;
