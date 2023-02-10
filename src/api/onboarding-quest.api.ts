import AutSDK, { Quest, QuestOnboarding } from "@aut-labs-private/sdk";
import { fetchMetadata } from "./storage.api";
import { BaseQueryApi, createApi } from "@reduxjs/toolkit/query/react";
import { REHYDRATE } from "redux-persist";

const fetchQuests = async (pluginAddress: any, api: BaseQueryApi) => {
  const sdk = AutSDK.getInstance();
  let questOnboarding: QuestOnboarding = sdk.questOnboarding;

  if (!questOnboarding) {
    questOnboarding = sdk.initService<QuestOnboarding>(
      QuestOnboarding,
      pluginAddress
    );
    sdk.questOnboarding = questOnboarding;
  }

  const response = await questOnboarding.getAllQuests();
  if (response?.isSuccess) {
    const questsWithMetadata: Quest[] = [];
    for (let i = 0; i < response.data.length; i++) {
      const def = response.data[i];
      questsWithMetadata.push({
        ...def,
        metadata: await fetchMetadata(def.metadataUri)
      });
    }
    return {
      data: questsWithMetadata
    };
  }
  return {
    error: response.errorMessage
  };
};

const createQuest = async (
  body: Quest & { pluginAddress: string },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  let questOnboarding: QuestOnboarding = sdk.questOnboarding;

  if (!questOnboarding) {
    questOnboarding = sdk.initService<QuestOnboarding>(
      QuestOnboarding,
      body.pluginAddress
    );
    delete body.pluginAddress;
    sdk.questOnboarding = questOnboarding;
  }

  const response = await questOnboarding.createQuest(body);

  if (!response.isSuccess) {
    return {
      error: response.errorMessage
    };
  }
  return {
    data: {
      ...body,
      tasksCount: 0,
      questId: response.data
    } as Quest
  };
};

export const onboardingQuestApi = createApi({
  reducerPath: "onboardingQuestApi",
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === REHYDRATE) {
      return action.payload[reducerPath];
    }
  },
  baseQuery: async (args, api, extraOptions) => {
    const { url, body } = args;
    if (url === "getAllOnboardingQuests") {
      return fetchQuests(body, api);
    }

    if (url === "createQuest") {
      return createQuest(body, api);
    }
    return {
      data: "Test"
    };
  },
  endpoints: (builder) => ({
    getAllOnboardingQuests: builder.query<Quest[], string>({
      query: (body) => {
        return {
          body,
          url: "getAllOnboardingQuests"
        };
      }
    }),
    createQuest: builder.mutation<
      Quest,
      Partial<Quest & { pluginAddress: string }>
    >({
      query: (body) => {
        return {
          body,
          url: "createQuest"
        };
      },
      async onQueryStarted({ pluginAddress }, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedPost } = await queryFulfilled;
          dispatch(
            onboardingQuestApi.util.updateQueryData(
              "getAllOnboardingQuests",
              pluginAddress,
              (draft) => {
                draft.push(updatedPost);
              }
            )
          );
        } catch (err) {
          console.log(err, "err");
        }
      }
    })
  })
});

export const { useCreateQuestMutation, useGetAllOnboardingQuestsQuery } =
  onboardingQuestApi;
