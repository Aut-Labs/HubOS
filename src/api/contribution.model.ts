import { BaseNFTModel, TaskContributionNFT } from "@aut-labs/sdk";
import { TaskType } from "./models/task-type";
import { OpenTaskContribution } from "./contribution-types/open-task.model";
import { DiscordGatheringContribution } from "./contribution-types/discord-gathering.model";
import { RetweetContribution } from "./contribution-types/retweet.model";
import { QuizTaskContribution } from "./contribution-types/quiz.model.model";
import { CommitContribution } from "./contribution-types/github-commit.model";
import { PullRequestContribution } from "./contribution-types/github-pr.model";
import { JoinDiscordContribution } from "./contribution-types/discord-join.model";

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
      return new CommitContribution(data);
    case "GitHubOpenPR":
      return new PullRequestContribution(data);
    case "DiscordPolls":
    case "TwitterFollow":
    case "TwitterComment":
      // throw new Error("Task type not implemented");
      return new TaskContributionNFT(data);

    default:
      throw new Error("Task type not found");
  }
};
