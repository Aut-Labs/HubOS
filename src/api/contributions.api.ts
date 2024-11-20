import AutSDK, {
  BaseNFTModel,
  findLogEvent,
  getOverrides,
  Hub,
  TaskContributionNFT
} from "@aut-labs/sdk";
import { BaseQueryApi, createApi } from "@reduxjs/toolkit/query/react";
import {
  CommitContribution,
  CommitContributionProperties,
  DiscordGatheringContribution,
  OpenTaskContribution,
  PullRequestContribution,
  RetweetContribution
} from "./contribution.model";
import { TaskFactoryContractEventType } from "@aut-labs/abi-types";

const hubServiceCache: Record<string, Hub> = {};

const getTaskFactory = async (api: BaseQueryApi) => {
  const sdk = await AutSDK.getInstance();
  const state: any = api.getState() as any;

  let hubService = hubServiceCache[state.hub.selectedHubAddress];
  if (!hubService) {
    hubService = sdk.initService<Hub>(Hub, state.hub.selectedHubAddress);
  }

  return hubService.getTaskFactory();
};

const createContribution = async (
  contribution: TaskContributionNFT,
  contributionNFT: BaseNFTModel<any>,
  api: BaseQueryApi
) => {
  try {
    const sdk = await AutSDK.getInstance();
    const taskFactory = await getTaskFactory(api);
    const uri = await sdk.client.sendJSONToIPFS(contributionNFT);
    const overrides = await getOverrides(sdk.signer, 3000);

    console.log({
      taskId: contribution.properties.taskId,
      role: contribution.properties.role,
      startDate: contribution.properties.startDate,
      endDate: contribution.properties.endDate,
      points: contribution.properties.points,
      quantity: contribution.properties.quantity,
      uri: uri
    });

    const tx = await (
      await taskFactory.functions.registerDescription({ uri }, overrides)
    ).wait();

    const event = findLogEvent(
      tx,
      TaskFactoryContractEventType.RegisterDescription
    );
    if (!event) {
      return {
        error: "Failed to register description"
      };
    }

    const descriptionId = event.args[0]?.toString();
    const response = await taskFactory.createContribution(
      {
        taskId: contribution.properties.taskId,
        role: contribution.properties.role,
        startDate: contribution.properties.startDate,
        endDate: contribution.properties.endDate,
        points: contribution.properties.points,
        quantity: contribution.properties.quantity,
        descriptionId: descriptionId
      },
      overrides
    );

    if (!response.isSuccess) {
      return {
        error: response.errorMessage
      };
    }
    return {
      data: response.data
    };
  } catch (error) {
    return {
      error: error.message
    };
  }
};

const createOpenTaskContribution = async (
  openTaskContribution: OpenTaskContribution,
  api: BaseQueryApi
) => {
  const nft = OpenTaskContribution.getContributionNFT(openTaskContribution);
  return createContribution(openTaskContribution, nft, api);
};

const createTwitterRetweetContribution = async (
  retweetContribution: RetweetContribution,
  api: BaseQueryApi
) => {
  const nft = RetweetContribution.getContributionNFT(retweetContribution);
  return createContribution(retweetContribution, nft, api);
};

const createDiscordGatheringContribution = async (
  openTaskContribution: DiscordGatheringContribution,
  api: BaseQueryApi
) => {
  const nft =
    DiscordGatheringContribution.getContributionNFT(openTaskContribution);
  return createContribution(openTaskContribution, nft, api);
};

const createGithubCommitContribution = async (
  githubContribution: CommitContribution,
  api: BaseQueryApi
) => {
  const nft = CommitContribution.getContributionNFT(githubContribution);
  return createContribution(githubContribution, nft, api);
};

const createGithubPullRequestContribution = async (
  githubContribution: PullRequestContribution,
  api: BaseQueryApi
) => {
  const nft = PullRequestContribution.getContributionNFT(githubContribution);
  return createContribution(githubContribution, nft, api);
};

export const contributionsApi = createApi({
  reducerPath: "contributionsApi",
  baseQuery: (args, api, extraOptions) => {
    const { url, body } = args;
    if (url === "createOpenTaskContribution") {
      return createOpenTaskContribution(body, api);
    }
    if (url === "createDiscordGatheringContribution") {
      return createDiscordGatheringContribution(body, api);
    }
    if (url === "createTwitterRetweetContribution") {
      return createTwitterRetweetContribution(body, api);
    }
    if (url === "createGithubCommitContribution") {
      return createGithubCommitContribution(body, api);
    }
    if (url === "createGithubPRContribution") {
      return createGithubPullRequestContribution(body, api);
    }
    return {
      data: "Test"
    };
  },
  tagTypes: ["Contributions"],
  endpoints: (builder) => ({
    createOpenTaskContribution: builder.mutation<void, OpenTaskContribution>({
      query: (body) => {
        return {
          body,
          url: "createOpenTaskContribution"
        };
      }
    }),
    createDiscordGatheringContribution: builder.mutation<
      void,
      DiscordGatheringContribution
    >({
      query: (body) => {
        return {
          body,
          url: "createDiscordGatheringContribution"
        };
      }
    }),
    createTwitterRetweetContribution: builder.mutation<
      void,
      RetweetContribution
    >({
      query: (body) => {
        return {
          body,
          url: "createTwitterRetweetContribution"
        };
      }
    }),
    createGithubCommitContribution: builder.mutation<void, CommitContribution>({
      query: (body) => {
        return {
          body,
          url: "createGithubCommitContribution"
        };
      }
    }),
    createGithubPRContribution: builder.mutation<void, PullRequestContribution>({
      query: (body) => {
        return {
          body,
          url: "createGithubPRContribution"
        };
      }
    })
  })
});

export const {
  useCreateGithubPRContributionMutation,
  useCreateGithubCommitContributionMutation,
  useCreateTwitterRetweetContributionMutation,
  useCreateOpenTaskContributionMutation,
  useCreateDiscordGatheringContributionMutation
} = contributionsApi;
