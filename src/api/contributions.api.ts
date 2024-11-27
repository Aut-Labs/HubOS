import AutSDK, {
  BaseNFTModel,
  findLogEvent,
  getOverrides,
  Hub,
  TaskContributionNFT
} from "@aut-labs/sdk";
import { BaseQueryApi, createApi } from "@reduxjs/toolkit/query/react";
import { TaskFactoryContractEventType } from "@aut-labs/abi-types";
import { DiscordGatheringContribution } from "./contribution-types/discord-gathering.model";
import { OpenTaskContribution } from "./contribution-types/open-task.model";
import { RetweetContribution } from "./contribution-types/retweet.model";
import { QuizTaskContribution } from "./contribution-types/quiz.model.model";
import { encryptMessage } from "./aut.api";
import { AuthSig } from "@aut-labs/connector/lib/esm/aut-sig";
import { ContributionCommit } from "@hooks/useQueryContributionCommits";
import { CommitContribution } from "./contribution-types/github-commit.model";
import { PullRequestContribution } from "./contribution-types/github-pr.model";

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

const getTaskManager = async (api: BaseQueryApi) => {
  const sdk = await AutSDK.getInstance();
  const state: any = api.getState() as any;

  let hubService = hubServiceCache[state.hub.selectedHubAddress];
  if (!hubService) {
    hubService = sdk.initService<Hub>(Hub, state.hub.selectedHubAddress);
  }

  return hubService.getTaskManager();
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
  {
    contribution,
    autSig
  }: { contribution: OpenTaskContribution; autSig: AuthSig },
  api: BaseQueryApi
) => {
  const nft = OpenTaskContribution.getContributionNFT(contribution);
  return createContribution(contribution, nft, api);
};

const createTwitterRetweetContribution = async (
  {
    contribution,
    autSig
  }: { contribution: RetweetContribution; autSig: AuthSig },
  api: BaseQueryApi
) => {
  debugger;
  const nft = RetweetContribution.getContributionNFT(contribution);
  return createContribution(contribution, nft, api);
};

const createDiscordGatheringContribution = async (
  {
    contribution,
    autSig
  }: { contribution: DiscordGatheringContribution; autSig: AuthSig },
  api: BaseQueryApi
) => {
  const nft = DiscordGatheringContribution.getContributionNFT(contribution);
  return createContribution(contribution, nft, api);
};

const createQuizContribution = async (
  {
    contribution,
    autSig
  }: { contribution: QuizTaskContribution; autSig: AuthSig },
  api: BaseQueryApi
) => {
  const state: any = api.getState() as any;
  const questionsWithoutAnswers = [];
  const questions = contribution.properties.questions;
  for (let i = 0; i < questions.length; i++) {
    const { question, answers } = questions[i];
    const questionWithoutAnswer = {
      question,
      answers: answers.map((answer) => ({
        value: answer.value
      }))
    };
    questionsWithoutAnswers.push(questionWithoutAnswer);
  }
  const hubAddress = state.hub.selectedHubAddress;
  const hash = await encryptMessage({
    autSig,
    message: JSON.stringify(questions),
    hubAddress
  });
  contribution.properties.hash = hash;
  contribution.properties.questions = questionsWithoutAnswers;

  const nft = QuizTaskContribution.getContributionNFT(contribution);
  return createContribution(contribution, nft, api);
};

const giveContribution = async (
  {
    contribution,
    submission
  }: {
    contribution: TaskContributionNFT;
    submission: ContributionCommit;
  },
  api: BaseQueryApi
) => {
  try {
    const sdk = await AutSDK.getInstance();
    const overrides = await getOverrides(sdk.signer, 3000);
    const taskManager = await getTaskManager(api);

    const response = await taskManager.giveContribution(
      contribution.properties.id,
      submission.who,
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

const createGithubCommitContribution = async (
  {
    contribution,
    autSig
  }: { contribution: CommitContribution; autSig: AuthSig },
  api: BaseQueryApi
) => {
  debugger;
  const nft = CommitContribution.getContributionNFT(contribution);
  return createContribution(contribution, nft, api);
};

const createGithubPullRequestContribution = async (
  {
    contribution,
    autSig
  }: { contribution: PullRequestContribution; autSig: AuthSig },
  api: BaseQueryApi
) => {
  const nft = PullRequestContribution.getContributionNFT(contribution);
  return createContribution(contribution, nft, api);
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
    if (url === "createQuizContribution") {
      return createQuizContribution(body, api);
    }
    if (url === "giveContribution") {
      return giveContribution(body, api);
    }
    return {
      data: "Test"
    };
  },
  tagTypes: ["Contributions"],
  endpoints: (builder) => ({
    createOpenTaskContribution: builder.mutation<
      void,
      {
        autSig: AuthSig;
        contribution: OpenTaskContribution;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "createOpenTaskContribution"
        };
      }
    }),
    createDiscordGatheringContribution: builder.mutation<
      void,
      {
        autSig: AuthSig;
        contribution: DiscordGatheringContribution;
      }
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
      {
        autSig: AuthSig;
        contribution: RetweetContribution;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "createTwitterRetweetContribution"
        };
      }
    }),
    createGithubCommitContribution: builder.mutation<
      void,
      {
        autSig: AuthSig;
        contribution: CommitContribution;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "createGithubCommitContribution"
        };
      }
    }),
    createGithubPRContribution: builder.mutation<
      void,
      {
        autSig: AuthSig;
        contribution: PullRequestContribution;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "createGithubPRContribution"
        };
      }
    }),
    createQuizContribution: builder.mutation<
      void,
      {
        autSig: AuthSig;
        contribution: QuizTaskContribution;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "createQuizContribution"
        };
      }
    }),
    giveContribution: builder.mutation<
      void,
      {
        submission: ContributionCommit;
        contribution: TaskContributionNFT;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "giveContribution"
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
  useCreateDiscordGatheringContributionMutation,
  useCreateQuizContributionMutation,
  useGiveContributionMutation
} = contributionsApi;
