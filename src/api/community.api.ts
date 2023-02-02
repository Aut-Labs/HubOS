import {
  CommunityExtensionContractEventType,
  Web3AutIDProvider,
  Web3CommunityExtensionProvider
} from "@aut-protocol/abi-types";
import axios from "axios";
import { CommitmentMessages } from "@utils/misc";
import { Community, findRoleName } from "./community.model";
import { Web3ThunkProviderFactory } from "./ProviderFactory/web3-thunk.provider";
import { httpUrlToIpfsCID, ipfsCIDToHttpUrl, isValidUrl } from "./storage.api";
import { environment } from "./environment";
import { AutID } from "./aut.model";
import { base64toFile, isBase64 } from "sw-web-shared";

const communityExtensionThunkProvider = Web3ThunkProviderFactory(
  "CommunityExtension",
  {
    provider: Web3CommunityExtensionProvider
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
    type: "aut-dashboard/core-team/add",
    event: CommunityExtensionContractEventType.CoreTeamMemberAdded
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
    type: "aut-dashboard/core-team/remove",
    event: CommunityExtensionContractEventType.CoreTeamMemberRemoved
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
      console.log("New image: ->", ipfsCIDToHttpUrl(community.image));
    }

    // const uri = await storeAsBlob(Community.updateCommunity(community));
    // console.log("New metadata: ->", ipfsCIDToHttpUrl(uri));
    // await contract.setMetadataUri(uri);
    return community;
  }
);

export const fetchMembers = communityExtensionThunkProvider(
  {
    type: "community/members/get"
  },
  async (thunkAPI) => {
    const state = thunkAPI.getState();
    const { selectedCommunityAddress } = state.community;
    return Promise.resolve(selectedCommunityAddress);
  },
  async (contract, _, thunkAPI) => {
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

    const memberIds = await contract.getAllMembers();
    const autContract = await Web3AutIDProvider(environment.autIDAddress);

    for (let i = 0; i < memberIds.length; i += 1) {
      const memberAddress = memberIds[i];
      const tokenId = await autContract.getAutIDByOwner(memberAddress);
      const metadataCID = await autContract.tokenURI(
        Number(tokenId.toString())
      );
      const [, role, commitment] = await autContract.getCommunityData(
        memberAddress,
        community.properties.address
      );
      const jsonUri = ipfsCIDToHttpUrl(metadataCID);
      const jsonMetadata: AutID = (await axios.get(jsonUri)).data;
      const roleName = findRoleName(
        role.toString(),
        community.properties.rolesSets
      );

      const isCoreTeam = await contract.isCoreTeam(memberAddress);
      const member = new AutID({
        ...jsonMetadata,
        properties: {
          ...jsonMetadata.properties,
          address: memberAddress,
          role: role.toString(),
          roleName,
          tokenId: tokenId.toString(),
          commitmentDescription: CommitmentMessages(commitment),
          commitment: commitment.toString(),
          isCoreTeam
        } as any
      });
      if (isCoreTeam) {
        AutIDsResponse.Admins.push(member);
      }
      AutIDsResponse[roleName].push(member);
    }

    return AutIDsResponse;
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

    const autContract = await Web3AutIDProvider(environment.autIDAddress);
    const tokenId = await autContract.getAutIDByOwner(memberAddress);
    const metadataCID = await autContract.tokenURI(Number(tokenId.toString()));
    const [, role, commitment] = await autContract.getCommunityData(
      memberAddress,
      community.properties.address
    );
    const jsonUri = ipfsCIDToHttpUrl(metadataCID);
    const jsonMetadata: AutID = (await axios.get(jsonUri)).data;
    const roleName = findRoleName(
      role.toString(),
      community.properties.rolesSets
    );

    const isCoreTeam = await contract.isCoreTeam(memberAddress);
    const member = new AutID({
      ...jsonMetadata,
      properties: {
        ...jsonMetadata.properties,
        address: memberAddress,
        role: role.toString(),
        roleName,
        tokenId: tokenId.toString(),
        commitmentDescription: CommitmentMessages(commitment),
        commitment: commitment.toString(),
        isCoreTeam
      } as any
    });
    if (isCoreTeam) {
      AutIDsResponse.Admins.push(member);
    }
    AutIDsResponse[roleName].push(member);
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
    type: "community/integrate/discord",
    event: CommunityExtensionContractEventType.DiscordServerSet
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
    type: "community/url/add",
    event: CommunityExtensionContractEventType.UrlAdded
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
