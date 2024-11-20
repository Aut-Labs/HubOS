import {
  BaseNFTModel,
  TaskContributionNFT,
  TaskContributionProperties
} from "@aut-labs/sdk";
import { duration } from "@mui/material";

export class RetweetContributionProperties extends TaskContributionProperties {
  tweetUrl: string;
  constructor(data: RetweetContributionProperties) {
    super(data);
    this.tweetUrl = data.tweetUrl;
  }
}

export class RetweetContribution<
  T = RetweetContributionProperties
> extends TaskContributionNFT<T> {
  static getContributionNFT(
    contribution: RetweetContribution
  ): BaseNFTModel<any> {
    const taskContribution = new RetweetContribution(contribution);
    return {
      name: taskContribution.name,
      description: taskContribution.description,
      properties: {
        tweetUrl: taskContribution.properties.tweetUrl
      }
    } as BaseNFTModel<any>;
  }
  constructor(data: RetweetContribution<T> = {} as RetweetContribution<T>) {
    super(data);
    this.properties = new RetweetContributionProperties(
      data.properties as RetweetContributionProperties
    ) as T;
  }
}
export class CommitContributionProperties extends TaskContributionProperties {
  branch: string;
  repository: string;
  organisation: string;
  constructor(data: CommitContributionProperties) {
    super(data);
    this.branch = data.branch;
    this.repository = data.repository;
    this.organisation = data.organisation;
  }
}

export class CommitContribution<
  T = CommitContributionProperties
> extends TaskContributionNFT<T> {
  static getContributionNFT(
    contribution: CommitContribution
  ): BaseNFTModel<any> {
    const taskContribution = new CommitContribution(contribution);
    return {
      name: taskContribution.name,
      description: taskContribution.description,
      properties: {
        branch: taskContribution.properties.branch,
        repository: taskContribution.properties.repository,
        organisation: taskContribution.properties.organisation
      }
    } as BaseNFTModel<any>;
  }
  constructor(data: CommitContribution<T> = {} as CommitContribution<T>) {
    super(data);
    this.properties = new CommitContributionProperties(
      data.properties as CommitContributionProperties
    ) as T;
  }
}

export class PullRequestContributionProperties extends TaskContributionProperties {
  branch: string;
  repository: string;
  organisation: string;
  constructor(data: PullRequestContributionProperties) {
    super(data);
    this.branch = data.branch;
    this.repository = data.repository;
    this.organisation = data.organisation;
  }
}

export class PullRequestContribution<
  T = PullRequestContributionProperties
> extends TaskContributionNFT<T> {
  static getContributionNFT(
    contribution: PullRequestContribution
  ): BaseNFTModel<any> {
    const taskContribution = new PullRequestContribution(contribution);
    return {
      name: taskContribution.name,
      description: taskContribution.description,
      properties: {
        branch: taskContribution.properties.branch,
        repository: taskContribution.properties.repository,
        organisation: taskContribution.properties.organisation
      }
    } as BaseNFTModel<any>;
  }
  constructor(
    data: PullRequestContribution<T> = {} as PullRequestContribution<T>
  ) {
    super(data);
    this.properties = new PullRequestContributionProperties(
      data.properties as PullRequestContributionProperties
    ) as T;
  }
}

export class OpenTaskContributionProperties extends TaskContributionProperties {
  attachmentRequired: boolean;
  textRequired: boolean;
  attachmentType: string;
  constructor(data: OpenTaskContributionProperties) {
    super(data);
    this.attachmentRequired = data.attachmentRequired;
    this.textRequired = data.textRequired;
    this.attachmentType = data.attachmentType;
  }
}

export class OpenTaskContribution<
  T = OpenTaskContributionProperties
> extends TaskContributionNFT<T> {
  static getContributionNFT(
    contribution: OpenTaskContribution
  ): BaseNFTModel<any> {
    const taskContribution = new OpenTaskContribution(contribution);
    return {
      name: taskContribution.name,
      description: taskContribution.description,
      properties: {
        attachmentRequired: taskContribution.properties.attachmentRequired,
        textRequired: taskContribution.properties.textRequired,
        attachmentType: taskContribution.properties.attachmentType
      }
    } as BaseNFTModel<any>;
  }
  constructor(data: OpenTaskContribution<T> = {} as OpenTaskContribution<T>) {
    super(data);
    this.properties = new OpenTaskContributionProperties(
      data.properties as OpenTaskContributionProperties
    ) as T;
  }
}

export class JoinDiscordTaskContributionProperties extends TaskContributionProperties {
  constructor(data: JoinDiscordTaskContributionProperties) {
    super(data);
  }
}

export class JoinDiscordTaskContribution<
  T = JoinDiscordTaskContributionProperties
> extends TaskContributionNFT<T> {
  constructor(data: OpenTaskContribution<T> = {} as OpenTaskContribution<T>) {
    super(data);
    this.properties = new JoinDiscordTaskContributionProperties(
      data.properties as JoinDiscordTaskContributionProperties
    ) as T;
  }
}

export class QuizTaskContributionProperties extends TaskContributionProperties {
  constructor(data: QuizTaskContributionProperties) {
    super(data);
  }
}

export class QuizTaskContribution<
  T = QuizTaskContributionProperties
> extends TaskContributionNFT<T> {
  constructor(data: OpenTaskContribution<T> = {} as OpenTaskContribution<T>) {
    super(data);
    this.properties = new QuizTaskContributionProperties(
      data.properties as QuizTaskContributionProperties
    ) as T;
  }
}

export class DiscordGatheringContributionProperties extends TaskContributionProperties {
  channelId: string;
  duration: number;

  constructor(data: DiscordGatheringContributionProperties) {
    super(data);
    this.taskId = data.taskId;
    this.role = data.role;
    this.startDate = data.startDate;
    this.channelId = data.channelId;
    this.points = data.points;
    this.quantity = data.quantity;
    this.uri = data.uri;
  }
}

export class DiscordGatheringContribution<
  T = DiscordGatheringContributionProperties
> extends TaskContributionNFT<T> {
  static getContributionNFT(
    contribution: DiscordGatheringContribution
  ): BaseNFTModel<any> {
    const taskContribution = new DiscordGatheringContribution(contribution);
    return {
      name: taskContribution.name,
      description: taskContribution.description,
      image: "",
      properties: {
        taskId: taskContribution.properties.taskId,
        role: taskContribution.properties.role,
        startDate: taskContribution.properties.startDate,
        duration: taskContribution.properties.duration,
        channelId: taskContribution.properties.channelId,
        points: taskContribution.properties.points,
        quantity: taskContribution.properties.quantity,
        uri: taskContribution.properties.uri
      }
    } as BaseNFTModel<any>;
  }

  constructor(
    data: DiscordGatheringContribution<T> = {} as DiscordGatheringContribution<T>
  ) {
    super(data);
    this.properties = new DiscordGatheringContributionProperties(
      data.properties as DiscordGatheringContributionProperties
    ) as T;
  }
}
