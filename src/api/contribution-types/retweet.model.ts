import {
  BaseNFTModel,
  TaskContributionNFT,
  TaskContributionProperties
} from "@aut-labs/sdk";

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

  contributionType? = "Retweet";
}
