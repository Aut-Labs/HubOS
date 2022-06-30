import {
  Web3AutIDProvider,
  Web3CommunityExtensionProvider,
} from "@skill-wallet/sw-abi-types";
import axios from "axios";
import { AutList } from "./api.model";
import { Community, findRoleName } from "./community.model";
import { Web3ThunkProviderFactory } from "./ProviderFactory/web3-thunk.provider";
import {
  getCoreTeamMemberNames,
  addCoreTeamName,
  getAutAddress,
} from "./aut.api";
import { storeMetadata, ipfsCIDToHttpUrl } from "./textile.api";
import { environment } from "./environment";
import { AutID } from "./aut.model";

const communityExtensionThunkProvider = Web3ThunkProviderFactory(
  "CommunityExtension",
  {
    provider: Web3CommunityExtensionProvider,
  }
);

export const fetchCommunity = communityExtensionThunkProvider(
  {
    type: "community/get",
  },
  (thunkAPI) => {
    const state = thunkAPI.getState();
    const community: Community = state.community.community;
    return Promise.resolve(community.properties.address);
  },
  async (contract, _) => {
    const [, uri] = await contract.getComData();
    const metadata: Community = (await axios.get(ipfsCIDToHttpUrl(uri))).data;
    const community = new Community(metadata);
    community.image = ipfsCIDToHttpUrl(community.image as string);
    return community;
  }
);

export const getWhitelistedAddresses = communityExtensionThunkProvider(
  {
    type: "partner/addresses/get",
  },
  (thunkAPI) => {
    const state = thunkAPI.getState();
    const community: Community = state.community.community;
    return Promise.resolve(community.properties.address);
  },
  async (contract, _, { getState }) => {
    const { auth } = getState();
    const memberAddresses = await contract.getAllMembers();
    const names = await getCoreTeamMemberNames(auth.userInfo.community);
    return memberAddresses.map((a) => ({
      address: a,
      name:
        names.coreTeamMembers.find((c) => c.memberAddress === a)?.memberName ||
        "N/A",
    }));
  }
);

export const addNewWhitelistedAddresses = communityExtensionThunkProvider(
  {
    type: "partner/addresses/add",
    // event: AutIDCommunityContractEventType.CoreTeamMemberAdded,
  },
  (thunkAPI) => {
    const state = thunkAPI.getState();
    const community: Community = state.community.community;
    return Promise.resolve(community.properties.address);
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

export const updatePartnersCommunity = communityExtensionThunkProvider(
  {
    type: "partner/community/update",
  },
  (thunkAPI) => {
    const state = thunkAPI.getState();
    const community: Community = state.community.community;
    return Promise.resolve(community.properties.address);
  },
  async (contract, community) => {
    const uri = await storeMetadata(community);
    // await contract.setMetadataUri(uri);
    return community;
  }
);

export const fetchMembers = communityExtensionThunkProvider(
  {
    type: "community/members/get",
  },
  async (thunkAPI) => {
    const state = thunkAPI.getState();
    const community: Community = state.community.community;
    return Promise.resolve(community.properties.address);
  },
  async (contract, _, thunkAPI) => {
    const state = thunkAPI.getState();
    const AutIDsResponse: { [role: string]: AutList[] } = {};

    let community: Community = state.community.community;

    if (!community) {
      const response = await thunkAPI.dispatch(fetchCommunity(null));
      community = response.payload as Community;
    }

    const filteredRoles = community.properties.rolesSets[0].roles;

    for (let i = 0; i < filteredRoles.length; i += 1) {
      AutIDsResponse[filteredRoles[i].roleName] = [];
    }

    const memberIds = await contract.getAllMembers();
    const swContract = await Web3AutIDProvider(environment.autIDAddress);
    for (let i = 0; i < memberIds.length; i += 1) {
      const memberAddress = memberIds[i];
      const tokenId = await swContract.getAutIDByOwner(memberAddress);
      const metadataCID = await swContract.tokenURI(Number(tokenId.toString()));
      const [, role, commitment] = await swContract.getCommunityData(
        memberAddress,
        community.properties.address
      );
      const jsonUri = ipfsCIDToHttpUrl(metadataCID);
      const jsonMetadata: AutID = (await axios.get(jsonUri)).data;
      const roleName = findRoleName(
        role.toString(),
        community.properties.rolesSets
      );

      AutIDsResponse[roleName].push({
        role: roleName,
        tokenId: tokenId.toString(),
        image: ipfsCIDToHttpUrl(jsonMetadata.properties.avatar, false),
        name: jsonMetadata.name,
        commitment: commitment.toString(),
      });
    }

    return AutIDsResponse;
  }
);

export const getPAUrl = communityExtensionThunkProvider(
  {
    type: "community/url/get",
  },
  (thunkAPI) => {
    const state = thunkAPI.getState();
    const community: Community = state.community.community;
    return Promise.resolve(community.properties.address);
  },
  async (contract) => {
    const urls = await contract.getURLs();
    return urls?.length > 0 ? urls[urls.length - 1] : undefined;
  }
);

export const addPAUrl = communityExtensionThunkProvider(
  {
    type: "community/url/add",
    // event: PartnersAgreementContractEventType.UrlAdded,
  },
  (thunkAPI) => {
    const state = thunkAPI.getState();
    const community: Community = state.community.community;
    return Promise.resolve(community.properties.address);
  },
  async (contract, daoUrl, { dispatch }) => {
    await contract.addURL(daoUrl);
    return dispatch(getPAUrl(null));
  }
);
