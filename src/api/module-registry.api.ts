/* eslint-disable max-len */
import AutSDK, { Nova, fetchMetadata } from "@aut-labs/sdk";
import { BaseQueryApi, createApi } from "@reduxjs/toolkit/query/react";
import { REHYDRATE } from "redux-persist";
import { environment } from "./environment";
import { ModuleDefinition } from "@aut-labs/sdk/dist/models/plugin";

const fetch = async (body: any, api: BaseQueryApi) => {
  const sdk = AutSDK.getInstance();
  const state = api.getState() as any;
  const { selectedCommunityAddress } = state.community;

  const nova: Nova = sdk.initService<Nova>(Nova, selectedCommunityAddress);

  const response = await sdk.moduleRegistry.getModuleDefinitions();

  if (response?.isSuccess) {
    const definitionsWithMetadata: ModuleDefinition[] = [];
    for (let i = 1; i < response.data.length; i++) {
      const def = response.data[i];
      const isActivatedResponse = await nova.isModuleActivated(i);

      const moduleData = {
        ...def,
        isActivated: isActivatedResponse.data,
        metadata: await fetchMetadata<typeof def.metadata>(
          def.metadataURI,
          environment.nftStorageUrl
        )
      };

      moduleData.metadata.properties.type =
        moduleData.metadata.properties.title;

      //TODO Change once the title changes to Onboarding Strategies in metadata
      if (moduleData.metadata.properties.title === "Onboarding Strategies") {
        moduleData.metadata.properties.type = "OnboardingStrategy";
      }

      if (moduleData.metadata.properties.title === "Task Type") {
        moduleData.metadata.properties.type = "Task";
      }
      definitionsWithMetadata.push(moduleData);
    }

    const dAutModule = {
      metadataURI:
        "ipfs://bafkreieg7dwphs4554g726kalv5ez22hd55k3bksepa6rrvon6gf4mupey",
      id: 4,
      isActivated: true,
      metadata: {
        name: "Aut Labs Default Module",
        description: "Aut Labs Modules",
        properties: {
          type: "dAut",
          title: "dĀut",
          buttonName: "See Domains",
          shortDescription:
            "integrate dĀut is here (it’s a library that needs to know only the web domain where you’re going to install it - and you need to prove ownership of that domain",
          longDescription:
            "integrate dĀut is here (it’s a library that needs to know only the web domain where you’re going to install it - and you need to prove ownership of that domain"
        }
      }
    };

    return {
      data: [dAutModule, ...definitionsWithMetadata.filter((m) => m.id !== 1)]
    };
  }
  return {
    error: response.errorMessage
  };
};

const activateModule = async ({ moduleId = 1 }, api: BaseQueryApi) => {
  const sdk = AutSDK.getInstance();
  const state = api.getState() as any;
  const { selectedCommunityAddress } = state.community;

  const nova: Nova = sdk.initService<Nova>(Nova, selectedCommunityAddress);
  const response = await nova.activateModule(moduleId);

  if (response.isSuccess) {
    return {
      data: true
    };
  }
  return {
    data: response.errorMessage
  };
};

const KEEP_DATA_UNUSED = 5 * 60;

export const moduleRegistryApi = createApi({
  reducerPath: "moduleRegistryApi",
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.payload && action.type === REHYDRATE) {
      return action.payload[reducerPath];
    }
  },
  keepUnusedDataFor: KEEP_DATA_UNUSED,
  baseQuery: async (args, api) => {
    const { url, body } = args;
    if (url === "getAllModuleDefinitions") {
      return fetch(body, api);
    }

    if (url === "activateModule") {
      return activateModule(body, api);
    }

    return {
      data: "Test"
    };
  },
  tagTypes: ["Modules"],
  endpoints: (builder) => ({
    getAllModuleDefinitions: builder.query<ModuleDefinition[], any>({
      query: (body) => {
        return {
          body,
          url: "getAllModuleDefinitions"
        };
      },
      providesTags: ["Modules"]
    }),
    activateModule: builder.mutation<
      boolean,
      {
        moduleId: number;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "activateModule"
        };
      },
      invalidatesTags: ["Modules"]
      // async onQueryStarted({ ...args }, { dispatch, queryFulfilled }) {
      //   try {
      //     const { data } = await queryFulfilled;
      //     dispatch(
      //       moduleRegistryApi.util.updateQueryData(
      //         "getAllModuleDefinitions",
      //         null,
      //         (draft) => {
      //           const index = draft.findIndex((q) => q.id === args.moduleId);
      //           const updatedModule: ModuleDefinition = JSON.parse(
      //             JSON.stringify(draft[index])
      //           );
      //           draft.splice(index, 1, updatedModule);
      //           return draft;
      //         }
      //       )
      //     );
      //   } catch (err) {
      //     console.error(err);
      //   }
      // }
    })
  })
});

export const {
  useGetAllModuleDefinitionsQuery,
  useActivateModuleMutation,
  useLazyGetAllModuleDefinitionsQuery
} = moduleRegistryApi;
