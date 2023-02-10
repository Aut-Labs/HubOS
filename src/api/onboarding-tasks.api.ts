import AutSDK, { Quest, QuestOnboarding, Task } from "@aut-labs-private/sdk";
import { fetchMetadata } from "./storage.api";
import { BaseQueryApi, createApi } from "@reduxjs/toolkit/query/react";
import { REHYDRATE } from "redux-persist";

const fetchTasks = async (pluginAddress: any, api: BaseQueryApi) => {
  const sdk = AutSDK.getInstance();
  let questOnboarding: QuestOnboarding = sdk.questOnboarding;

  if (!questOnboarding) {
    questOnboarding = sdk.initService<QuestOnboarding>(
      QuestOnboarding,
      pluginAddress
    );
    sdk.questOnboarding = questOnboarding;
  }

  const response = await questOnboarding.getAllTasksForAllQuests();
  if (response?.isSuccess) {
    const tasksWithMetadata: Task[] = [];
    for (let i = 0; i < response.data.length; i++) {
      const def = response.data[i];
      tasksWithMetadata.push({
        ...def,
        metadata: await fetchMetadata(def.submitionUrl)
      });
    }
    return {
      data: tasksWithMetadata
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
      questId: response.data
    } as Quest
  };
};

export const onboardingTasksApi = createApi({
  reducerPath: "onboardingTasksApi",
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === REHYDRATE) {
      return action.payload[reducerPath];
    }
  },
  baseQuery: async (args, api, extraOptions) => {
    const { url, body } = args;
    if (url === "getAllTasksPerQuest") {
      return fetchTasks(body, api);
    }

    if (url === "createQuest") {
      return createQuest(body, api);
    }
    return {
      data: "Test"
    };
  },
  endpoints: (builder) => ({
    getAllTasksPerQuest: builder.query<Quest[], string>({
      query: (body) => {
        return {
          body,
          url: "getAllTasksPerQuest"
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
      }
    })
  })
});

export const { useGetAllTasksPerQuestQuery } = onboardingTasksApi;
