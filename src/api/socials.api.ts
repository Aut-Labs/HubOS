import { BaseQueryApi, createApi } from "@reduxjs/toolkit/query/react";
import { Community } from "./community.model";
import AutSDK, { Nova, SDKContractGenericResponse } from "@aut-labs/sdk";
import { ipfsCIDToHttpUrl } from "./storage.api";

const updateCommunitySocial = async (
  api: BaseQueryApi,
  type: string,
  value: string
): Promise<SDKContractGenericResponse<void>> => {
  const sdk = await AutSDK.getInstance();
  const communityState: {
    communities: Community[];
    selectedCommunityAddress: string;
  } = (api.getState() as any)?.community;

  const community = communityState.communities.find(
    (c) => c.properties.address === communityState.selectedCommunityAddress
  );

  sdk.nova = sdk.initService<Nova>(Nova, community.properties.address);

  for (let i = 0; i < community.properties.socials.length; i++) {
    const element = community.properties.socials[i];
    if (element.type === type) {
      element.link = value;
      break;
    }
  }

  const updatedCommunity = Community.updateCommunity(community);
  const uri = await sdk.client.sendJSONToIPFS(updatedCommunity as any);
  console.log("New metadata: ->", ipfsCIDToHttpUrl(uri));
  const response = await sdk.nova.contract.metadata.setMetadataUri(uri);

  if (response.isSuccess) {
    const autIdData = JSON.parse(window.localStorage.getItem("aut-data"));
    let foundSocial = false;
    for (let i = 0; i < autIdData.properties.communities.length; i++) {
      if (foundSocial) {
        break;
      }
      const community: Community = autIdData.properties.communities[i];
      if (community.name === community.name) {
        for (let i = 0; i < community.properties.socials.length; i++) {
          const social = community.properties.socials[i];
          if (social.type === type) {
            social.link = value;
            foundSocial = true;
            break;
          }
        }
      }
    }
    window.localStorage.setItem("aut-data", JSON.stringify(autIdData));
  }

  return response;
};

export const verifyENS = async (address: any, api: BaseQueryApi) => {
  try {
    // await signMessage({
    //   message: "Allow Aut to verify you ENS name"
    // });
    // const name = await fetchEnsName({
    //   address: address
    // });
    // // await updateCommunitySocial(api, "ens", "tao.eth");
    return {
      data: "name"
    };
  } catch (error) {
    return {
      error: error?.shortMessage || error?.message || error
    };
  }
};

export const socialsApi = createApi({
  reducerPath: "socialsApi",
  baseQuery: async (args, api, extraOptions) => {
    const { url, body } = args;
    if (url === "verifyENS") {
      return verifyENS(body, api);
    }
  },
  tagTypes: [],
  endpoints: (builder) => ({
    verifyENS: builder.mutation<boolean, string>({
      // @ts-ignore
      query: (body) => ({
        body,
        url: "verifyENS"
      })
    })
  })
});

export const { useVerifyENSMutation } = socialsApi;
