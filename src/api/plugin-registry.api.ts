import AutSDK, { PluginDefinition } from "@aut-labs-private/sdk";
import { fetchMetadata } from "./storage.api";
import { BaseQueryApi, createApi } from "@reduxjs/toolkit/query/react";
import {
  QuestOnboardingPluginABI,
  QuestOnboardingPluginByteCode
} from "@aut-labs-private/abi-types";
import { REHYDRATE } from "redux-persist";

const fetch = async (body: any, api: BaseQueryApi) => {
  const sdk = AutSDK.getInstance();
  const state = api.getState() as any;
  const { selectedCommunityAddress } = state.community;

  const response = await sdk.pluginRegistry.getAllPluginDefinitionsByDAO(
    selectedCommunityAddress
  );
  if (response?.isSuccess) {
    const definitionsWithMetadata: PluginDefinition[] = [];
    for (let i = 0; i < response.data.length; i++) {
      const def = response.data[i];
      definitionsWithMetadata.push({
        ...def,
        metadata: await fetchMetadata(def.metadataURI)
      });
    }
    response.data = definitionsWithMetadata;
    return response;
  }
  return {
    error: response.errorMessage
  };
};

const add = async (
  body: PluginDefinition & { daoAddress: string },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();

  const { pluginDefinitionId, daoAddress } = body;

  const response = await sdk.pluginRegistry.addPluginToDAO(
    pluginDefinitionId,
    daoAddress
  );

  if (!response.isSuccess) {
    return {
      error: response.errorMessage
    };
  }
  return response;
};

export const pluginRegistryApi = createApi({
  reducerPath: "pluginRegistryApi",
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === REHYDRATE) {
      return action.payload[reducerPath];
    }
  },
  baseQuery: async (args, api, extraOptions) => {
    const { url, body } = args;
    if (url === "getAllPluginDefinitionsByDAO") {
      return fetch(body, api);
    }

    if (url === "addPluginToDAO") {
      return add(body, api);
    }
    return {
      data: "Test"
    };
  },
  endpoints: (builder) => ({
    getAllPluginDefinitionsByDAO: builder.query<PluginDefinition[], void>({
      query: (body) => {
        return {
          body,
          url: "getAllPluginDefinitionsByDAO"
        };
      }
    }),
    addPluginToDAO: builder.mutation<
      PluginDefinition,
      Partial<PluginDefinition & { daoAddress: string }>
    >({
      query: (body) => {
        return {
          body,
          url: "addPluginToDAO"
        };
      }
    })
  })
});

export const {
  useAddPluginToDAOMutation,
  useGetAllPluginDefinitionsByDAOQuery
} = pluginRegistryApi;
