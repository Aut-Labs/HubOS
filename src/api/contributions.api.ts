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
import { JoinDiscordContribution } from "./contribution-types/discord-join.model";
import { DiscordPollContribution } from "./contribution-types/discord-poll-model";
import { create } from "@mui/material/styles/createTransitions";

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
  // const result = await createContribution(contribution, nft, api);

  try {
    const gatheringPayload = {
      guildId: contribution.properties.guildId,
      channelId: contribution.properties.channelId,
      title: contribution.name,
      description: contribution.description,
      startDate: new Date(contribution.properties.startDate * 1000), // Convert unix to Date
      endDate: new Date(contribution.properties.endDate * 1000),
      roles: [contribution.properties.role],
      allCanAttend: false,
      weight: contribution.properties.points,
      taskId: contribution.properties.taskId
    };
    const response = await fetch(
      "http://localhost:4005/api/discord/gathering",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(gatheringPayload)
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create Discord gathering");
    }

    const gathering = await response.json();
    return { gathering } as any;
  } catch (error) {
    console.error("Discord gathering creation failed:", error);
    return { gatheringError: error.message } as any;
  }
};

const createDiscordPollContribution = async (
  {
    contribution,
    autSig
  }: { contribution: DiscordPollContribution; autSig: AuthSig },
  api: BaseQueryApi
) => {
  const nft = DiscordPollContribution.getContributionNFT(contribution);
  // const result = await createContribution(contribution, nft, api);
  debugger;
  try {
    const pollPayload = {
      guildId: contribution.properties.guildId,
      channelId: contribution.properties.channelId,
      title: contribution.name,
      options: contribution.properties.options,
      description: contribution.description,
      startDate: new Date(contribution.properties.startDate * 1000), // Convert unix to Date
      endDate: new Date(contribution.properties.endDate * 1000),
      roles: [contribution.properties.role],
      allCanAttend: false,
      weight: contribution.properties.points,
      taskId: contribution.properties.taskId
    };
    const response = await fetch("http://localhost:4005/api/discord/poll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(pollPayload)
    });

    if (!response.ok) {
      throw new Error("Failed to create Discord gathering");
    }

    const poll = await response.json();
    return { poll } as any;
  } catch (error) {
    console.error("Discord poll creation failed:", error);
    return { pollError: error.message } as any;
  }
};

const createJoinDiscordContribution = async (
  {
    contribution,
    autSig
  }: { contribution: JoinDiscordContribution; autSig: AuthSig },
  api: BaseQueryApi
) => {
  const nft = JoinDiscordContribution.getContributionNFT(contribution);
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
    if (url === "createJoinDiscordContribution") {
      return createJoinDiscordContribution(body, api);
    }
    if (url === "createDiscordPollContribution") {
      return createDiscordPollContribution(body, api);
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
    createDiscordPollContribution: builder.mutation<
      void,
      {
        autSig: AuthSig;
        contribution: DiscordPollContribution;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "createDiscordPollContribution"
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
    createJoinDiscordContribution: builder.mutation<
      void,
      {
        autSig: AuthSig;
        contribution: JoinDiscordContribution;
      }
    >({
      query: (body) => {
        return {
          body,
          url: "createJoinDiscordContribution"
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
  useCreateDiscordPollContributionMutation,
  useCreateJoinDiscordContributionMutation,
  useCreateQuizContributionMutation,
  useGiveContributionMutation
} = contributionsApi;
