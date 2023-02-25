import AutSDK, {
  Quest,
  QuestOnboarding,
  SDKContractGenericResponse,
  Task
} from "@aut-labs-private/sdk";
import { fetchMetadata } from "./storage.api";
import { BaseQueryApi, createApi } from "@reduxjs/toolkit/query/react";
import { REHYDRATE } from "redux-persist";
import { PluginDefinitionType } from "@aut-labs-private/sdk/dist/models/plugin";
import { dateToUnix } from "@utils/date-format";
import { addDays, getUnixTime } from "date-fns";

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
        metadata: await fetchMetadata<typeof def.metadata>(def.metadataUri)
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

const fetchTasks = async ({ pluginAddress, questId }, api: BaseQueryApi) => {
  const sdk = AutSDK.getInstance();
  let questOnboarding: QuestOnboarding = sdk.questOnboarding;

  if (!questOnboarding) {
    questOnboarding = sdk.initService<QuestOnboarding>(
      QuestOnboarding,
      pluginAddress
    );
    sdk.questOnboarding = questOnboarding;
  }

  const response = await questOnboarding.getAllTasksByQuest(
    questId,
    pluginAddress
  );
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

const fetchTasksPerPluginType = async (
  { pluginDefinitionType, pluginAddress },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  const state = api.getState();
  let questOnboarding: QuestOnboarding = sdk.questOnboarding;

  if (!questOnboarding) {
    // const { post } = api.endpoint(undefined, {
    //   selectFromResult: ({ data }) => ({
    //     post: data?.find((post) => post.id === id)
    //   })
    // });
    questOnboarding = sdk.initService<QuestOnboarding>(
      QuestOnboarding,
      ""
      // state.
    );
    sdk.questOnboarding = questOnboarding;
  }

  const response = await questOnboarding.getTasksByType(
    pluginAddress,
    pluginDefinitionType
  );
  if (response?.isSuccess) {
    const tasksWithMetadata: Task[] = [];
    for (let i = 0; i < response.data.length; i++) {
      const def = response.data[i];
      tasksWithMetadata.push({
        ...def,
        metadata: await fetchMetadata(def.metadataUri)
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
    sdk.questOnboarding = questOnboarding;
  }

  const startDate = addDays(new Date(), 5);
  const date = getUnixTime(startDate) * 1000;

  body.startDate = date;
  const response = await questOnboarding.createQuest(body);

  if (!response.isSuccess) {
    return {
      error: response.errorMessage
    };
  }
  return {
    data: response.data
  };
};

const createTaskPerQuest = async (
  body: {
    task: Task;
    questId: number;
    pluginAddress: string;
    questPluginAddress: string;
    pluginDefinitionId: PluginDefinitionType;
  },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  let questOnboarding: QuestOnboarding = sdk.questOnboarding;

  if (!questOnboarding) {
    questOnboarding = sdk.initService<QuestOnboarding>(
      QuestOnboarding,
      body.questPluginAddress
    );
    sdk.questOnboarding = questOnboarding;
  }

  await questOnboarding.getOrInitialiseQuestPluginContract();
  await questOnboarding.getOrInitialisePluginRegistryContract();

  // try {
  //   const taskContract = questOnboarding.getOrInitialiseTaskPluginContract(
  //     body.pluginAddress,
  //     body.pluginDefinitionId
  //   );

  //   const res = await taskContract.functions.createBy(
  //     "0x81c843A6FEd08672FD392846e13ad9e5F85aC35a",
  //     0,
  //     "https://something",
  //     getUnixTime(new Date()),
  //     getUnixTime(new Date()) + 1000
  //   );

  //   const tx = await res.wait();

  //   const eventsEmitted = tx.events
  //     .filter((e) => !!e.event)
  //     .map((e) => e.event);
  //   // const successEventEmitted = tx.events.find(
  //   //   (e) => e.event === QuestPluginContractEventType.TasksAddedToQuest
  //   // );

  //   debugger;
  // } catch (error) {
  //   console.error(error);
  //   debugger;
  // }

  const response = await questOnboarding.createTask(
    body.task,
    body.questId,
    body.pluginDefinitionId,
    body.pluginAddress,
    body.questPluginAddress
  );

  if (!response.isSuccess) {
    return {
      error: response.errorMessage
    };
  }
  return {
    data: response.data
  };
};

const KEEP_DATA_UNUSED = 5 * 60;

export const onboardingApi = createApi({
  reducerPath: "onboardingApi",
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.payload && action.type === REHYDRATE) {
      return action.payload[reducerPath] || {};
    }
  },
  keepUnusedDataFor: KEEP_DATA_UNUSED,
  baseQuery: async (args, api) => {
    const { url, body } = args;
    if (url === "getAllOnboardingQuests") {
      return fetchQuests(body, api);
    }

    if (url === "createQuest") {
      return createQuest(body, api);
    }

    if (url === "getAllTasksPerQuest") {
      return fetchTasks(body, api);
    }

    if (url === "getTasksPerPluginType") {
      return fetchTasksPerPluginType(body, api);
    }

    if (url === "createTaskPerQuest") {
      return createTaskPerQuest(body, api);
    }
    return {
      data: "Test"
    };
  },
  tagTypes: ["Quests", "Tasks"],
  endpoints: (builder) => ({
    getAllOnboardingQuests: builder.query<Quest[], string>({
      query: (body) => {
        return {
          body,
          url: "getAllOnboardingQuests"
        };
      },
      providesTags: ["Quests"]
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
      async onQueryStarted({ ...args }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            onboardingApi.util.updateQueryData(
              "getAllOnboardingQuests",
              args.pluginAddress,
              (draft) => {
                draft.push(data);
                return draft;
              }
            )
          );
        } catch (err) {
          console.log(err);
        }
      }
    }),
    getAllTasksPerQuest: builder.query<
      Task[],
      {
        questId: number;
        pluginAddress: string;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "getAllTasksPerQuest"
        };
      },
      providesTags: ["Tasks"]
    }),
    createTaskPerQuest: builder.mutation<
      Task,
      {
        task: Task;
        questId: number;
        pluginAddress: string;
        questPluginAddress: string;
        pluginDefinitionId: PluginDefinitionType;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "createTaskPerQuest"
        };
      },
      invalidatesTags: ["Tasks"]
    }),
    getTasksPerPluginType: builder.query<
      Task[],
      {
        pluginAddress: string;
        pluginDefinitionId: PluginDefinitionType;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "getTasksPerPluginType"
        };
      },
      providesTags: ["Tasks"]
    })
  })
});

export const {
  useCreateQuestMutation,
  useCreateTaskPerQuestMutation,
  useGetAllTasksPerQuestQuery,
  useGetAllOnboardingQuestsQuery,
  useGetTasksPerPluginTypeQuery
} = onboardingApi;
