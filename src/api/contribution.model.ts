import { BaseNFTModel } from "@aut-labs/sdk";
import { TaskType } from "./models/task-type";
import { OpenTaskContribution } from "./contribution-types/open-task.model";
import { DiscordGatheringContribution } from "./contribution-types/discord-gathering.model";
import { RetweetContribution } from "./contribution-types/retweet.model";
import { JoinDiscordContribution } from "./contribution-types/join-discord.model";
import { QuizTaskContribution } from "./contribution-types/quiz.model.model";

export const ContributionFactory = (
  metadata: BaseNFTModel<any>,
  contribution: any,
  taskTypes: TaskType[]
) => {
  const taskType = taskTypes.find(
    (taskType) => taskType.taskId === contribution.taskId
  );

  if (!taskType) {
    throw new Error("Task type not found");
  }
  const taskName = taskType.metadata.properties.type;
  const data = {
    ...metadata,
    properties: {
      ...metadata.properties,
      ...contribution
    },
  }
  switch (taskName) {
    case "OpenTask":
      return new OpenTaskContribution(data);
    case "DiscordGatherings":
      return new DiscordGatheringContribution(data);
    case "TwitterRetweet":
      return new RetweetContribution(data);
    case "JoinDiscord":
      return new JoinDiscordContribution(data);
    case "Quiz":
      return new QuizTaskContribution(data);
    case "TwitterLike":
    case "GitHubCommit":
    case "GitHubOpenPR":
    case "DiscordPolls":
    case "TwitterFollow":
    case "TwitterComment":
      throw new Error("Task type not implemented");

    default:
      throw new Error("Task type not found");
  }
};
