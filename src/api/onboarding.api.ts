import AutSDK, {
  Quest,
  QuestOnboarding,
  Task,
  fetchMetadata
} from "@aut-labs-private/sdk";
import { BaseQueryApi, createApi } from "@reduxjs/toolkit/query/react";
import { REHYDRATE } from "redux-persist";
import { environment } from "./environment";
import { CacheTypes, getCache, updateCache } from "./cache.api";
import { PluginDefinitionType } from "@aut-labs-private/sdk/dist/models/plugin";

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
        metadata: await fetchMetadata<typeof def.metadata>(
          def.metadataUri,
          environment.nftStorageUrl
        )
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

const fetchQuestById = async (
  body: {
    questId: number;
    onboardingQuestAddress: string;
    daoAddress: string;
  },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  let questOnboarding: QuestOnboarding = sdk.questOnboarding;
  const { questId, onboardingQuestAddress } = body;

  if (!questOnboarding) {
    questOnboarding = sdk.initService<QuestOnboarding>(
      QuestOnboarding,
      onboardingQuestAddress
    );
    sdk.questOnboarding = questOnboarding;
  }

  const response = await questOnboarding.getQuestById(+questId);

  if (response?.isSuccess) {
    response.data.metadata = await fetchMetadata<typeof response.data.metadata>(
      response.data.metadataUri,
      environment.nftStorageUrl
    );
    return {
      data: response.data
    };
  }
  return {
    error: response.errorMessage
  };
};

const hasUserCompletedQuest = async (
  body: {
    userAddress: string;
    questId: number;
    onboardingQuestAddress: string;
    daoAddress: string;
  },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  let questOnboarding: QuestOnboarding = sdk.questOnboarding;
  const { questId, onboardingQuestAddress, userAddress } = body;

  if (!questOnboarding) {
    questOnboarding = sdk.initService<QuestOnboarding>(
      QuestOnboarding,
      onboardingQuestAddress
    );
    sdk.questOnboarding = questOnboarding;
  }

  try {
    const hasCompletedAQuest =
      await questOnboarding.questPlugin.functions.hasCompletedAQuest(
        userAddress,
        +questId
      );
    return {
      data: hasCompletedAQuest
    };
  } catch (error) {
    return {
      data: false
    };
  }
};

const activateOnboarding = async (
  { quests, pluginAddress, userAddress },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  let questOnboarding: QuestOnboarding = sdk.questOnboarding;

  if (!questOnboarding) {
    questOnboarding = sdk.initService<QuestOnboarding>(
      QuestOnboarding,
      pluginAddress
    );
    sdk.questOnboarding = questOnboarding;
  }

  const response = await questOnboarding.activateOnboarding(quests);

  if (!response.isSuccess) {
    return {
      error: response.errorMessage
    };
  }

  try {
    const cache = await getCache(CacheTypes.UserPhases);
    cache.list[1].status = 1; // complete phase 2
    await updateCache(cache);
  } catch (error) {
    console.log(error);
  }
  return {
    data: response.data
  };
};

const applyForQuest = async (
  body: {
    questId: number;
    onboardingQuestAddress: string;
  },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  let questOnboarding: QuestOnboarding = sdk.questOnboarding;

  if (!questOnboarding) {
    questOnboarding = sdk.initService<QuestOnboarding>(
      QuestOnboarding,
      body.onboardingQuestAddress
    );
    sdk.questOnboarding = questOnboarding;
  }

  const response = await questOnboarding.applyForAQuest(body.questId);

  if (!response.isSuccess) {
    return {
      error: response.errorMessage
    };
  }
  return {
    data: response.data
  };
};

const withdrawFromAQuest = async (
  body: {
    questId: number;
    onboardingQuestAddress: string;
  },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  let questOnboarding: QuestOnboarding = sdk.questOnboarding;

  if (!questOnboarding) {
    questOnboarding = sdk.initService<QuestOnboarding>(
      QuestOnboarding,
      body.onboardingQuestAddress
    );
    sdk.questOnboarding = questOnboarding;
  }

  const response = await questOnboarding.withdrawFromAQuest(body.questId);

  if (!response.isSuccess) {
    return {
      error: response.errorMessage
    };
  }
  return {
    data: response.data
  };
};

const fetchTasks = async (
  { pluginAddress, questId, userAddress },
  api: BaseQueryApi
) => {
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
    userAddress
  );

  if (response?.isSuccess) {
    const tasksWithMetadata: Task[] = [];

    for (let i = 0; i < response.data.length; i++) {
      const def = response.data[i];
      tasksWithMetadata.push({
        ...def,
        metadata: await fetchMetadata(
          def.metadataUri,
          environment.nftStorageUrl
        ),
        submission: await fetchMetadata(
          def.submitionUrl,
          environment.nftStorageUrl
        )
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
    onboardingQuestAddress: string;
    pluginTokenId: number;
  },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  let questOnboarding: QuestOnboarding = sdk.questOnboarding;

  if (!questOnboarding) {
    questOnboarding = sdk.initService<QuestOnboarding>(
      QuestOnboarding,
      body.onboardingQuestAddress
    );
    sdk.questOnboarding = questOnboarding;
  }

  const response = await questOnboarding.createTask(
    body.task,
    body.questId,
    body.pluginTokenId
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

const removeTaskFromQuest = async (
  body: {
    task: Task;
    questId: number;
    pluginAddress: string;
    onboardingQuestAddress: string;
    pluginTokenId: number;
  },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  let questOnboarding: QuestOnboarding = sdk.questOnboarding;

  if (!questOnboarding) {
    questOnboarding = sdk.initService<QuestOnboarding>(
      QuestOnboarding,
      body.onboardingQuestAddress
    );
    sdk.questOnboarding = questOnboarding;
  }

  const response = await questOnboarding.removeTasks(
    [body.task],
    body.questId,
    body.pluginTokenId
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

const submitTask = async (
  body: {
    task: Task;
    pluginAddress: string;
    onboardingQuestAddress: string;
    pluginDefinitionId: PluginDefinitionType;
  },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  let questOnboarding: QuestOnboarding = sdk.questOnboarding;

  if (!questOnboarding) {
    questOnboarding = sdk.initService<QuestOnboarding>(
      QuestOnboarding,
      body.onboardingQuestAddress
    );
    sdk.questOnboarding = questOnboarding;
  }

  const response = await questOnboarding.submitTask(
    body.task,
    body.pluginAddress,
    body.pluginDefinitionId
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

const finalizeTask = async (
  body: {
    task: Task;
    pluginAddress: string;
    onboardingQuestAddress: string;
    pluginDefinitionId: PluginDefinitionType;
  },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  let questOnboarding: QuestOnboarding = sdk.questOnboarding;

  if (!questOnboarding) {
    questOnboarding = sdk.initService<QuestOnboarding>(
      QuestOnboarding,
      body.onboardingQuestAddress
    );
    sdk.questOnboarding = questOnboarding;
  }

  const response = await questOnboarding.finalizeFor(
    body.task,
    body.pluginAddress,
    body.pluginDefinitionId
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

    if (url === "applyForQuest") {
      return applyForQuest(body, api);
    }

    if (url === "withdrawFromAQuest") {
      return withdrawFromAQuest(body, api);
    }

    if (url === "getOnboardingQuestById") {
      return fetchQuestById(body, api);
    }

    if (url === "hasUserCompletedQuest") {
      return hasUserCompletedQuest(body, api);
    }

    if (url === "createQuest") {
      return createQuest(body, api);
    }

    if (url === "getAllTasksPerQuest") {
      return fetchTasks(body, api);
    }

    if (url === "activateOnboarding") {
      return activateOnboarding(body, api);
    }

    if (url === "createTaskPerQuest") {
      return createTaskPerQuest(body, api);
    }

    if (url === "removeTaskFromQuest") {
      return removeTaskFromQuest(body, api);
    }

    if (url === "submitTask") {
      return submitTask(body, api);
    }

    if (url === "finalizeTask") {
      return finalizeTask(body, api);
    }
    return {
      data: "Test"
    };
  },
  tagTypes: ["Quests", "Tasks", "Quest"],
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
    getOnboardingQuestById: builder.query<
      Quest,
      {
        questId: number;
        onboardingQuestAddress: string;
        daoAddress: string;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "getOnboardingQuestById"
        };
      },
      providesTags: ["Quest"]
    }),
    hasUserCompletedQuest: builder.query<
      Quest,
      {
        userAddress: string;
        questId: number;
        onboardingQuestAddress: string;
        daoAddress: string;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "hasUserCompletedQuest"
        };
      },
      providesTags: ["Quest"]
    }),
    activateOnboarding: builder.mutation<
      boolean,
      {
        quests: Quest[];
        pluginAddress: string;
        userAddress: string;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "activateOnboarding"
        };
      },
      invalidatesTags: ["Quests", "Tasks"]
    }),
    applyForQuest: builder.mutation<
      boolean,
      {
        questId: number;
        onboardingQuestAddress: string;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "applyForQuest"
        };
      },
      invalidatesTags: ["Quest"]
    }),
    withdrawFromAQuest: builder.mutation<
      boolean,
      {
        questId: number;
        onboardingQuestAddress: string;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "withdrawFromAQuest"
        };
      },
      invalidatesTags: ["Quest"]
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
          console.error(err);
        }
      }
    }),
    getAllTasksPerQuest: builder.query<
      Task[],
      {
        questId: number;
        userAddress: string;
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
        onboardingQuestAddress: string;
        pluginTokenId: number;
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
    removeTaskFromQuest: builder.mutation<
      Task,
      {
        task: Task;
        questId: number;
        pluginAddress: string;
        onboardingQuestAddress: string;
        pluginTokenId: number;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "removeTaskFromQuest"
        };
      },
      invalidatesTags: ["Tasks"]
    }),
    submitTask: builder.mutation<
      Task,
      {
        task: Task;
        pluginAddress: string;
        onboardingQuestAddress: string;
        pluginDefinitionId: PluginDefinitionType;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "submitTask"
        };
      },
      invalidatesTags: ["Tasks"]
    }),
    finalizeTask: builder.mutation<
      Task,
      {
        task: Task;
        pluginAddress: string;
        onboardingQuestAddress: string;
        pluginDefinitionId: PluginDefinitionType;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "finalizeTask"
        };
      },
      invalidatesTags: ["Tasks"]
    })
  })
});

export const {
  useCreateQuestMutation,
  useApplyForQuestMutation,
  useFinalizeTaskMutation,
  useSubmitTaskMutation,
  useWithdrawFromAQuestMutation,
  useRemoveTaskFromQuestMutation,
  useLazyHasUserCompletedQuestQuery,
  useGetOnboardingQuestByIdQuery,
  useCreateTaskPerQuestMutation,
  useGetAllTasksPerQuestQuery,
  useLazyGetAllTasksPerQuestQuery,
  useGetAllOnboardingQuestsQuery,
  useActivateOnboardingMutation
} = onboardingApi;