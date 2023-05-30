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
import {
  deleteQestions,
  finaliseJoinDiscordTask,
  saveQestions
} from "./tasks.api";
import { v4 as uuidv4 } from "uuid";

const getAllOnboardingQuests = async (
  pluginAddress: any,
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  if (!pluginAddress) {
    return {
      data: []
    };
  }

  sdk.questOnboarding = sdk.initService<QuestOnboarding>(
    QuestOnboarding,
    pluginAddress
  );
  const response = await sdk.questOnboarding.getAllQuests();
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
  const { questId, onboardingQuestAddress } = body;

  sdk.questOnboarding = sdk.initService<QuestOnboarding>(
    QuestOnboarding,
    onboardingQuestAddress
  );

  const response = await sdk.questOnboarding.getQuestById(+questId);

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

const launchOnboarding = async (
  { quests, pluginAddress, userAddress },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  sdk.questOnboarding = sdk.initService<QuestOnboarding>(
    QuestOnboarding,
    pluginAddress
  );

  const response = await sdk.questOnboarding.launchOnboarding(quests);

  if (!response.isSuccess) {
    return {
      error: response.errorMessage
    };
  }

  try {
    const cache = await getCache(CacheTypes.UserPhases);
    cache.list[2].status = 1; // complete phase 3
    await updateCache(cache);
  } catch (error) {
    console.log(error);
  }
  return {
    data: response.data
  };
};

const deactivateOnboarding = async (
  { quests, pluginAddress, userAddress },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  sdk.questOnboarding = sdk.initService<QuestOnboarding>(
    QuestOnboarding,
    pluginAddress
  );

  const response = await sdk.questOnboarding.deactivateOnboarding(quests);

  if (!response.isSuccess) {
    return {
      error: response.errorMessage
    };
  }

  try {
    const cache = await getCache(CacheTypes.UserPhases);
    cache.list[2].status = 0; // reset phase 3
    await updateCache(cache);
  } catch (error) {
    console.log(error);
  }
  return {
    data: response.data
  };
};

const getAllTasksPerQuest = async (
  { pluginAddress, questId, isAdmin, userAddress },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  sdk.questOnboarding = sdk.initService<QuestOnboarding>(
    QuestOnboarding,
    pluginAddress
  );

  let tasks: Task[] = [];
  let submissions: Task[] = [];

  if (isAdmin) {
    const response = await sdk.questOnboarding.getAllTasksAndSubmissionsByQuest(
      questId
    );

    tasks = response.data.tasks;
    submissions = response.data.submissions;
  } else {
    const response = await sdk.questOnboarding.getAllTasksByQuest(
      questId,
      userAddress
    );
    tasks = response.data;
  }

  const tasksWithMetadata: Task[] = [];
  const submissionsWithMetadata: Task[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const def = tasks[i];
    tasksWithMetadata.push({
      ...def,
      metadata: await fetchMetadata(def.metadataUri, environment.nftStorageUrl),
      submission: await fetchMetadata(
        def.submitionUrl,
        environment.nftStorageUrl
      )
    });
  }
  for (let i = 0; i < submissions.length; i++) {
    const def = submissions[i];
    submissionsWithMetadata.push({
      ...def,
      metadata: await fetchMetadata(def.metadataUri, environment.nftStorageUrl),
      submission: await fetchMetadata(
        def.submitionUrl,
        environment.nftStorageUrl
      )
    });
  }
  return {
    data: {
      tasks: tasksWithMetadata,
      submissions: submissionsWithMetadata
    }
  };
};

const createQuest = async (
  body: Quest & { pluginAddress: string },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  sdk.questOnboarding = sdk.initService<QuestOnboarding>(
    QuestOnboarding,
    body.pluginAddress
  );

  const response = await sdk.questOnboarding.createQuest(body);

  if (!response.isSuccess) {
    return {
      error: response.errorMessage
    };
  }
  return {
    data: response.data
  };
};

const updateQuest = async (
  body: Quest & { pluginAddress: string },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  sdk.questOnboarding = sdk.initService<QuestOnboarding>(
    QuestOnboarding,
    body.pluginAddress
  );

  const response = await sdk.questOnboarding.updateQuest(body);

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
  sdk.questOnboarding = sdk.initService<QuestOnboarding>(
    QuestOnboarding,
    body.onboardingQuestAddress
  );

  const response = await sdk.questOnboarding.createTask(
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

const createQuizTaskPerQuest = async (
  body: {
    task: Task;
    questId: number;
    allQuestions: any[];
    pluginAddress: string;
    onboardingQuestAddress: string;
    pluginTokenId: number;
  },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  const questOnboarding: QuestOnboarding = sdk.initService<QuestOnboarding>(
    QuestOnboarding,
    body.onboardingQuestAddress
  );

  const uuid = uuidv4();
  try {
    await saveQestions(body.pluginAddress, uuid, body.allQuestions);
  } catch (error) {
    return {
      error: "An error occurred storing the quiz answers. Please try again."
    };
  }

  body.task.metadata.properties["uuid"] = uuid;
  const response = await questOnboarding.createTask(
    body.task,
    body.questId,
    body.pluginTokenId
  );

  if (!response.isSuccess) {
    try {
      await deleteQestions(body.pluginAddress, uuid, body.allQuestions);
    } catch (error) {
      return {
        error: "An error occurred deleting the quiz answers. Please try again."
      };
    }
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
  sdk.questOnboarding = sdk.initService<QuestOnboarding>(
    QuestOnboarding,
    body.onboardingQuestAddress
  );

  const response = await sdk.questOnboarding.removeTasks(
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

const submitOpenTask = async (
  body: {
    task: Task;
    pluginAddress: string;
    onboardingQuestAddress: string;
    pluginDefinitionId: PluginDefinitionType;
  },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  sdk.questOnboarding = sdk.initService<QuestOnboarding>(
    QuestOnboarding,
    body.onboardingQuestAddress
  );

  const response = await sdk.questOnboarding.submitTask(
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

const submitJoinDiscordTask = async (
  body: {
    task: Task;
    bearerToken: string;
    onboardingPluginAddress: string;
  },
  api: BaseQueryApi
) => {
  try {
    await finaliseJoinDiscordTask(
      body.task.pluginAddress,
      body.onboardingPluginAddress,
      body.task.taskId,
      body.bearerToken
    );
    return {
      data: true
    };
  } catch (e) {
    return {
      error: e.response?.data?.error || "Task could not be finalised!"
    };
  }
};

const finaliseOpenTask = async (
  body: {
    task: Task;
    pluginAddress: string;
    onboardingQuestAddress: string;
    pluginDefinitionId: PluginDefinitionType;
  },
  api: BaseQueryApi
) => {
  const sdk = AutSDK.getInstance();
  sdk.questOnboarding = sdk.initService<QuestOnboarding>(
    QuestOnboarding,
    body.onboardingQuestAddress
  );

  const response = await sdk.questOnboarding.finalizeFor(
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
      return getAllOnboardingQuests(body, api);
    }

    if (url === "getOnboardingQuestById") {
      return fetchQuestById(body, api);
    }

    if (url === "createQuest") {
      return createQuest(body, api);
    }

    if (url === "updateQuest") {
      return updateQuest(body, api);
    }

    if (url === "getAllTasksPerQuest") {
      return getAllTasksPerQuest(body, api);
    }

    if (url === "launchOnboarding") {
      return launchOnboarding(body, api);
    }

    if (url === "deactivateOnboarding") {
      return deactivateOnboarding(body, api);
    }

    if (url === "createTaskPerQuest") {
      return createTaskPerQuest(body, api);
    }

    if (url === "createQuizTaskPerQuest") {
      return createQuizTaskPerQuest(body, api);
    }

    if (url === "removeTaskFromQuest") {
      return removeTaskFromQuest(body, api);
    }

    if (url === "submitOpenTask") {
      return submitOpenTask(body, api);
    }

    if (url === "submitJoinDiscordTask") {
      return submitJoinDiscordTask(body, api);
    }

    if (url === "finaliseOpenTask") {
      return finaliseOpenTask(body, api);
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
          url: "getAllOnboardingQuests",
          timestamp: Date.now()
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
    getAllTasksPerQuest: builder.query<
      {
        tasks: Task[];
        submissions: Task[];
      },
      {
        questId: number;
        userAddress: string;
        isAdmin: boolean;
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
    launchOnboarding: builder.mutation<
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
          url: "launchOnboarding"
        };
      },
      invalidatesTags: ["Quests", "Tasks"]
    }),
    deactivateOnboarding: builder.mutation<
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
          url: "deactivateOnboarding"
        };
      },
      invalidatesTags: ["Quests", "Tasks"]
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
      invalidatesTags: ["Quests"]
      // async onQueryStarted({ ...args }, { dispatch, queryFulfilled }) {
      //   try {
      //     const { data } = await queryFulfilled;
      //     dispatch(
      //       onboardingApi.util.updateQueryData(
      //         "getAllOnboardingQuests",
      //         args.pluginAddress,
      //         (draft) => {
      //           draft.push(data);
      //           return draft;
      //         }
      //       )
      //     );
      //   } catch (err) {
      //     console.error(err);
      //   }
      // }
    }),
    updateQuest: builder.mutation<
      Quest,
      Partial<Quest & { pluginAddress: string }>
    >({
      query: (body) => {
        return {
          body,
          url: "updateQuest"
        };
      },
      invalidatesTags: ["Quests"]
      // async onQueryStarted({ ...args }, { dispatch, queryFulfilled }) {
      //   try {
      //     const { data } = await queryFulfilled;
      //     dispatch(
      //       onboardingApi.util.updateQueryData(
      //         "getAllOnboardingQuests",
      //         args.pluginAddress,
      //         (draft) => {
      //           const index = draft.findIndex(
      //             (q) => q.questId === data.questId
      //           );
      //           draft.splice(index, 1, data);
      //           return draft;
      //         }
      //       )
      //     );
      //   } catch (err) {
      //     console.error(err);
      //   }
      // }
    }),
    createTaskPerQuest: builder.mutation<
      Task,
      {
        task: Task;
        userAddress: string;
        isAdmin: boolean;
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
      invalidatesTags: ["Tasks", "Quests"]
      // async onQueryStarted({ ...args }, { dispatch, queryFulfilled }) {
      //   try {
      //     const { data } = await queryFulfilled;
      //     dispatch(
      //       onboardingApi.util.updateQueryData(
      //         "getAllTasksPerQuest",
      //         {
      //           userAddress: args.onboardingQuestAddress,
      //           isAdmin: args.isAdmin,
      //           pluginAddress: args.onboardingQuestAddress,
      //           questId: args.questId
      //         },
      //         (draft) => {
      //           const index = draft.tasks.findIndex(
      //             (q) => q.taskId === data.taskId
      //           );
      //           draft.tasks.splice(index, 1, data);
      //           return draft;
      //         }
      //       )
      //     );
      //   } catch (err) {
      //     console.error(err);
      //   }
      // }
    }),
    createQuizTaskPerQuest: builder.mutation<
      Task,
      {
        task: Task;
        userAddress: string;
        isAdmin: boolean;
        questId: number;
        pluginAddress: string;
        allQuestions: any[];
        onboardingQuestAddress: string;
        pluginTokenId: number;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "createQuizTaskPerQuest"
        };
      },
      invalidatesTags: ["Tasks", "Quests"]
      // async onQueryStarted({ ...args }, { dispatch, queryFulfilled }) {
      //   try {
      //     const { data } = await queryFulfilled;
      //     dispatch(
      //       onboardingApi.util.updateQueryData(
      //         "getAllTasksPerQuest",
      //         {
      //           userAddress: args.onboardingQuestAddress,
      //           isAdmin: args.isAdmin,
      //           pluginAddress: args.onboardingQuestAddress,
      //           questId: args.questId
      //         },
      //         (draft) => {
      //           const index = draft.tasks.findIndex(
      //             (q) => q.taskId === data.taskId
      //           );
      //           draft.tasks.splice(index, 1, data);
      //           return draft;
      //         }
      //       )
      //     );
      //   } catch (err) {
      //     console.error(err);
      //   }
      // }
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
      invalidatesTags: ["Tasks", "Quests"]
    }),
    submitOpenTask: builder.mutation<
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
          url: "submitOpenTask"
        };
      },
      invalidatesTags: ["Tasks", "Quest"]
    }),
    submitJoinDiscordTask: builder.mutation<
      Task,
      {
        task: Task;
        bearerToken: string;
        onboardingPluginAddress: string;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "submitJoinDiscordTask"
        };
      },
      invalidatesTags: ["Tasks", "Quest"]
    }),
    finaliseOpenTask: builder.mutation<
      Task,
      {
        task: Task;
        isAdmin: boolean;
        questId: number;
        userAddress: string;
        pluginAddress: string;
        onboardingQuestAddress: string;
        pluginDefinitionId: PluginDefinitionType;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "finaliseOpenTask"
        };
      },
      invalidatesTags: ["Tasks", "Quests"]
      // async onQueryStarted({ ...args }, { dispatch, queryFulfilled }) {
      //   try {
      //     const { data } = await queryFulfilled;
      //     dispatch(
      //       onboardingApi.util.updateQueryData(
      //         "getAllTasksPerQuest",
      //         {
      //           userAddress: args.onboardingQuestAddress,
      //           isAdmin: args.isAdmin,
      //           pluginAddress: args.onboardingQuestAddress,
      //           questId: args.questId
      //         },
      //         (draft) => {
      //           const index = draft.submissions.findIndex(
      //             (q) => q.taskId === data.taskId
      //           );
      //           draft.submissions.splice(index, 1, data);
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
  useUpdateQuestMutation,
  useCreateQuestMutation,
  useFinaliseOpenTaskMutation,
  useSubmitOpenTaskMutation,
  useRemoveTaskFromQuestMutation,
  useCreateQuizTaskPerQuestMutation,
  useCreateTaskPerQuestMutation,
  useGetAllTasksPerQuestQuery,
  useLazyGetAllTasksPerQuestQuery,
  useGetAllOnboardingQuestsQuery,
  useLaunchOnboardingMutation,
  useDeactivateOnboardingMutation,
  useSubmitJoinDiscordTaskMutation
} = onboardingApi;
