import AutSDK, {
  Quest,
  QuestOnboarding,
  Task,
  TaskOnboarding,
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
// @ts-ignore

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
  const sdk = await AutSDK.getInstance();
  const cacheData: CacheModel = cache;

  const questOnboarding = sdk.initService<QuestOnboarding>(
    QuestOnboarding,
    pluginAddress
  );

  const tasksAndSubmissionsResponse = await Promise.all([
    // @ts-ignore
    questOnboarding.getAllTasksAndSubmissionsByQuest(1),
    // @ts-ignore
    questOnboarding.getAllTasksAndSubmissionsByQuest(2),
    // @ts-ignore
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
        environment.ipfsGatewayUrl
      );
      submission.metadata = await fetchMetadata(
        submission.metadataUri,
        environment.ipfsGatewayUrl
      );
    }
    for (let j = 0; j < tasks.length; j++) {
      const task = tasks[j];
      task.metadata = await fetchMetadata(
        task.metadataUri,
        environment.ipfsGatewayUrl
      );
    }
    tasksAndSubmissions.push(tasksAndSubmissionsResponse[i].data);
  }
  return {
    data: {
      novaAddress: cacheData?.novaAddress,
      onboardingQuestAddress: cacheData?.onboardingQuestAddress,
      daoProgress: daoProgress.filter((c) => c.address !== cache.address),
      quests: [
        {
          questId: 1,
          novaAddress: cacheData?.novaAddress,
          onboardingQuestAddress: cacheData?.onboardingQuestAddress,
          tasksAndSubmissions: tasksAndSubmissions[0]
        },
        {
          questId: 2,
          novaAddress: cacheData?.novaAddress,
          onboardingQuestAddress: cacheData?.onboardingQuestAddress,
          tasksAndSubmissions: tasksAndSubmissions[1]
        },
        {
          questId: 3,
          novaAddress: cacheData?.novaAddress,
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
  const sdk = await AutSDK.getInstance();
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
          environment.ipfsGatewayUrl
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
    novaAddress: string;
  },
  api: BaseQueryApi
) => {
  const sdk = await AutSDK.getInstance();
  const { questId, onboardingQuestAddress } = body;

  sdk.questOnboarding = sdk.initService<QuestOnboarding>(
    QuestOnboarding,
    onboardingQuestAddress
  );

  const response = await sdk.questOnboarding.getQuestById(+questId);

  if (response?.isSuccess) {
    response.data.metadata = await fetchMetadata<typeof response.data.metadata>(
      response.data.metadataUri,
      environment.ipfsGatewayUrl
    );
    return {
      data: response.data
    };
  }
  return {
    error: response.errorMessage
  };
};

const activateQuest = async (
  { questId, pluginAddress, userAddress },
  api: BaseQueryApi
) => {
  const sdk = await AutSDK.getInstance();
  sdk.questOnboarding = sdk.initService<QuestOnboarding>(
    QuestOnboarding,
    pluginAddress
  );

  const questOnboarding: QuestOnboarding = sdk.questOnboarding;
  // @ts-ignore
  const response = await questOnboarding.activateQuest(questId);

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

const deactivateQuest = async (
  { questId, pluginAddress, userAddress },
  api: BaseQueryApi
) => {
  const sdk = await AutSDK.getInstance();
  sdk.questOnboarding = sdk.initService<QuestOnboarding>(
    QuestOnboarding,
    pluginAddress
  );

  const questOnboarding: QuestOnboarding = sdk.questOnboarding;
  // @ts-ignore
  const response = await questOnboarding.deactivateQuest(questId);

  if (!response.isSuccess) {
    return {
      error: response.errorMessage
    };
  }

  // try {
  //   const cache = await getCache(CacheTypes.UserPhases, userAddress);
  //   cache.list[2].status = 0; // reset phase 3
  //   await updateCache(cache);
  // } catch (error) {
  //   console.log(error);
  // }
  return {
    data: response.data
  };
};

const getAllTasksPerQuest = async (
  { pluginAddress, questId, isAdmin, userAddress },
  api: BaseQueryApi
) => {
  const sdk = await AutSDK.getInstance();
  sdk.questOnboarding = sdk.initService<QuestOnboarding>(
    QuestOnboarding,
    pluginAddress
  );

  let tasks: Task[] = [];
  let submissions: Task[] = [];

  if (isAdmin) {
    const response =
      await sdk.questOnboarding.getAllTasksAndSubmissionsByQuest(questId);

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
      metadata: await fetchMetadata(
        def.metadataUri,
        environment.ipfsGatewayUrl
      ),
      submission: await fetchMetadata(
        def.submitionUrl,
        environment.ipfsGatewayUrl
      )
    });
  }
  for (let i = 0; i < submissions.length; i++) {
    const def = submissions[i];
    submissionsWithMetadata.push({
      ...def,
      metadata: await fetchMetadata(
        def.metadataUri,
        environment.ipfsGatewayUrl
      ),
      submission: await fetchMetadata(
        def.submitionUrl,
        environment.ipfsGatewayUrl
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

const getAllTasks = async ({ isAdmin, userAddress }, api: BaseQueryApi) => {
  const sdk = await AutSDK.getInstance();
  const state = api.getState() as any;

  const { data } =
    state.pluginRegistryApi.queries["getAllPluginDefinitionsByDAO(null)"];

  const pluginAddresses = data?.reduce((prev, curr) => {
    if (curr.pluginAddress) {
      prev = [...prev, curr.pluginAddress];
    }
    return prev;
  }, []);

  const { selectedCommunityAddress } = state.community;
  sdk.taskOnboarding = sdk.initService<TaskOnboarding>(
    TaskOnboarding,
    selectedCommunityAddress
  );

  const taskOnboarding: TaskOnboarding = sdk.taskOnboarding;

  // let tasks: Task[] = [];
  // let submissions: Task[] = [];

  // if (isAdmin) {
  //   // @ts-ignore
  //   const response =
  //     await taskOnboarding.getAllTasksAndSubmissions(pluginAddresses);

  //   tasks = response.data.tasks;
  //   submissions = response.data.submissions;
  // } else {
  //   // @ts-ignore
  //   const response = await taskOnboarding.getAllTasks(
  //     userAddress,
  //     pluginAddresses
  //   );
  //   tasks = response.data;
  // }

  // const tasksWithMetadata: Task[] = [];
  // const submissionsWithMetadata: Task[] = [];

  // for (let i = 0; i < tasks.length; i++) {
  //   const def = tasks[i];
  //   tasksWithMetadata.push({
  //     ...def,
  //     metadata: await fetchMetadata(
  //       def.metadataUri,
  //       environment.ipfsGatewayUrl
  //     ),
  //     submission: await fetchMetadata(
  //       def.submitionUrl,
  //       environment.ipfsGatewayUrl
  //     )
  //   });
  // }
  // for (let i = 0; i < submissions.length; i++) {
  //   const def = submissions[i];
  //   submissionsWithMetadata.push({
  //     ...def,
  //     metadata: await fetchMetadata(
  //       def.metadataUri,
  //       environment.ipfsGatewayUrl
  //     ),
  //     submission: await fetchMetadata(
  //       def.submitionUrl,
  //       environment.ipfsGatewayUrl
  //     )
  //   });
  // }
  return {
    data: {
      tasks: [],
      submissions: []
    }
  };
};

const createQuest = async (
  body: Quest & { pluginAddress: string },
  api: BaseQueryApi
) => {
  const sdk = await AutSDK.getInstance();
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
  const sdk = await AutSDK.getInstance();
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

const createTask = async (
  body: {
    task: Task;
    pluginAddress: string;
    novaAddress: string;
    pluginTokenId: number;
  },
  api: BaseQueryApi
) => {
  const sdk = await AutSDK.getInstance();

  sdk.taskOnboarding = sdk.initService<TaskOnboarding>(
    TaskOnboarding,
    body.novaAddress
  );

  const taskOnboarding: TaskOnboarding = sdk.taskOnboarding;

  // @ts-ignore
  const response = await taskOnboarding.createTask(
    body.task,
    body.pluginAddress,
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

const CreateQuizTask = async (
  body: {
    userAddress: string;
    task: Task;
    allQuestions: any[];
    pluginAddress: string;
    novaAddress: string;
    pluginTokenId: number;
  },
  api: BaseQueryApi
) => {
  const sdk = await AutSDK.getInstance();
  const taskOnboarding: TaskOnboarding = sdk.initService<TaskOnboarding>(
    TaskOnboarding,
    body.novaAddress
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
  // @ts-ignore
  const response = await taskOnboarding.createTask(
    body.task,
    body.pluginAddress,
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
  const sdk = await AutSDK.getInstance();
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

const removeTask = async (
  body: {
    task: Task;
    questId: number;
    pluginAddress: string;
    novaAddress: string;
    pluginTokenId: number;
  },
  api: BaseQueryApi
) => {
  const sdk = await AutSDK.getInstance();
  sdk.taskOnboarding = sdk.initService<TaskOnboarding>(
    TaskOnboarding,
    body.novaAddress
  );

  const taskOnboarding: TaskOnboarding = sdk.taskOnboarding;

  // @ts-ignore
  const response = await taskOnboarding.removeTasks(
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
  const sdk = await AutSDK.getInstance();
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
    pluginDefinitionId: PluginDefinitionType;
  },
  api: BaseQueryApi
) => {
  const sdk = await AutSDK.getInstance();
  sdk.taskOnboarding = sdk.initService<TaskOnboarding>(
    TaskOnboarding,
    body.pluginAddress
  );

  const taskOnboarding: TaskOnboarding = sdk.taskOnboarding;

  // @ts-ignore
  const response = await taskOnboarding.finalizeFor(
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

    if (url === "getAllTasks") {
      return getAllTasks(body, api);
    }

    if (url === "activateQuest") {
      return activateQuest(body, api);
    }

    if (url === "deactivateOnboarding") {
      return deactivateQuest(body, api);
    }

    if (url === "createTask") {
      return createTask(body, api);
    }

    if (url === "CreateQuizTask") {
      return CreateQuizTask(body, api);
    }

    if (url === "removeTaskFromQuest") {
      return removeTaskFromQuest(body, api);
    }

    if (url === "removeTask") {
      return removeTask(body, api);
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
        novaAddress: string;
        onboardingQuestAddress: string;
        daoProgress: CacheModel[];
        quests: {
          questId: number;
          novaAddress: string;
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
        novaAddress: string;
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
    getAllTasks: builder.query<
      {
        tasks: Task[];
        submissions: Task[];
      },
      {
        userAddress: string;
        isAdmin: boolean;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "getAllTasks"
        };
      },
      providesTags: ["Tasks"]
    }),
    activateQuest: builder.mutation<
      boolean,
      {
        questId: number;
        pluginAddress: string;
        userAddress: string;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "activateQuest"
        };
      },
      invalidatesTags: ["Quests", "Tasks"]
    }),
    deactivateQuest: builder.mutation<
      boolean,
      {
        questId: number;
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
    createTask: builder.mutation<
      Task,
      {
        task: Task;
        pluginAddress: string;
        novaAddress: string;
        pluginTokenId: number;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "createTask"
        };
      },
      invalidatesTags: ["Tasks"]
    }),
    CreateQuizTask: builder.mutation<
      Task,
      {
        task: Task;
        userAddress: string;
        isAdmin: boolean;
        pluginAddress: string;
        allQuestions: any[];
        novaAddress: string;
        pluginTokenId: number;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "CreateQuizTask"
        };
      },
      invalidatesTags: ["Tasks"]
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
    removeTask: builder.mutation<
      Task,
      {
        userAddress: string;
        task: Task;
        questId: number;
        pluginAddress: string;
        novaAddress: string;
        pluginTokenId: number;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "removeTask"
        };
      },
      invalidatesTags: ["Tasks"]
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
        userAddress: string;
        pluginAddress: string;
        pluginDefinitionId: PluginDefinitionType;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "finaliseOpenTask"
        };
      },
      invalidatesTags: ["Tasks"]
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
  useRemoveTaskMutation,
  useCreateQuizTaskMutation,
  useCreateTaskMutation,
  useGetAllTasksPerQuestQuery,
  useLazyGetAllTasksPerQuestQuery,
  useGetAllOnboardingQuestsQuery,
  useGetAllTasksQuery,
  useActivateQuestMutation,
  useDeactivateQuestMutation,
  useSubmitJoinDiscordTaskMutation
} = onboardingApi;
