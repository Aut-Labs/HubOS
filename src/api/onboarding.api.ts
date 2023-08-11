import AutSDK, {
  Quest,
  QuestOnboarding,
  Task,
  fetchMetadata
} from "@aut-labs/sdk";
import { BaseQueryApi, createApi } from "@reduxjs/toolkit/query/react";
import { REHYDRATE } from "redux-persist";
import { environment } from "./environment";
import { CacheModel, CacheTypes, getCache, updateCache } from "./cache.api";
import { PluginDefinitionType } from "@aut-labs/sdk/dist/models/plugin";
import {
  deleteQestions,
  finaliseJoinDiscordTask,
  saveQestions
} from "./tasks.api";
import { v4 as uuidv4 } from "uuid";
import { getDAOProgress } from "./aut.api";

const getOnboardingProgress = async (
  pluginAddress: string,
  api: BaseQueryApi
) => {
  if (!pluginAddress)
    return {
      data: {
        daoProgress: [],
        quests: []
      }
    };
  const state = api.getState() as any;
  const { selectedCommunityAddress } = state.community;
  const { cache } = state.auth;
  const sdk = AutSDK.getInstance();
  const cacheData: CacheModel = cache;

  const questOnboarding = sdk.initService<QuestOnboarding>(
    QuestOnboarding,
    pluginAddress
  );

  const tasksAndSubmissionsResponse = await Promise.all([
    questOnboarding.getAllTasksAndSubmissionsByQuest(1),
    questOnboarding.getAllTasksAndSubmissionsByQuest(2),
    questOnboarding.getAllTasksAndSubmissionsByQuest(3)
  ]);

  const daoProgress = await getDAOProgress(selectedCommunityAddress);

  const tasksAndSubmissions = [];

  for (let i = 0; i < tasksAndSubmissionsResponse.length; i++) {
    const submissions = tasksAndSubmissionsResponse[i].data.submissions;
    const tasks = tasksAndSubmissionsResponse[i].data.tasks;
    for (let j = 0; j < submissions.length; j++) {
      const submission = submissions[j];
      submission.submission = await fetchMetadata(
        submission.submitionUrl,
        environment.nftStorageUrl
      );
      submission.metadata = await fetchMetadata(
        submission.metadataUri,
        environment.nftStorageUrl
      );
    }
    for (let j = 0; j < tasks.length; j++) {
      const task = tasks[j];
      task.metadata = await fetchMetadata(
        task.metadataUri,
        environment.nftStorageUrl
      );
    }
    tasksAndSubmissions.push(tasksAndSubmissionsResponse[i].data);
  }
  return {
    data: {
      daoAddress: cacheData?.daoAddress,
      onboardingQuestAddress: cacheData?.onboardingQuestAddress,
      daoProgress: daoProgress.filter((c) => c.address !== cache.address),
      quests: [
        {
          questId: 1,
          daoAddress: cacheData?.daoAddress,
          onboardingQuestAddress: cacheData?.onboardingQuestAddress,
          tasksAndSubmissions: tasksAndSubmissions[0]
        },
        {
          questId: 2,
          daoAddress: cacheData?.daoAddress,
          onboardingQuestAddress: cacheData?.onboardingQuestAddress,
          tasksAndSubmissions: tasksAndSubmissions[1]
        },
        {
          questId: 3,
          daoAddress: cacheData?.daoAddress,
          onboardingQuestAddress: cacheData?.onboardingQuestAddress,
          tasksAndSubmissions: tasksAndSubmissions[2]
        }
      ]
    }
  };
};

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
    const cache = await getCache(CacheTypes.UserPhases, userAddress);
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
    const cache = await getCache(CacheTypes.UserPhases, userAddress);
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
    userAddress: string;
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
    await saveQestions(
      body.userAddress,
      body.pluginAddress,
      uuid,
      body.allQuestions
    );
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
      await deleteQestions(
        body.userAddress,
        body.pluginAddress,
        uuid,
        body.allQuestions
      );
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
    userAddress: string;
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
    userAddress: string;
    task: Task;
    bearerToken: string;
    onboardingPluginAddress: string;
  },
  api: BaseQueryApi
) => {
  try {
    await finaliseJoinDiscordTask(
      body.userAddress,
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

    if (url === "getOnboardingProgress") {
      return getOnboardingProgress(body, api);
    }

    return {
      data: "Test"
    };
  },
  tagTypes: ["Quests", "Tasks", "Quest"],
  endpoints: (builder) => ({
    getOnboardingProgress: builder.query<
      {
        daoAddress: string;
        onboardingQuestAddress: string;
        daoProgress: CacheModel[];
        quests: {
          questId: number;
          daoAddress: string;
          onboardingQuestAddress: string;
          tasksAndSubmissions: {
            tasks: Task[];
            submissions: Task[];
          };
        }[];
      },
      string
    >({
      query: (body) => {
        return {
          body,
          url: "getOnboardingProgress",
          timestamp: Date.now()
        };
      },
      providesTags: ["Quests"]
    }),
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
    }),
    removeTaskFromQuest: builder.mutation<
      Task,
      {
        userAddress: string;
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
        userAddress: string;
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
        userAddress: string;
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
    })
  })
});

export const {
  useUpdateQuestMutation,
  useCreateQuestMutation,
  useFinaliseOpenTaskMutation,
  useGetOnboardingProgressQuery,
  useLazyGetOnboardingProgressQuery,
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
