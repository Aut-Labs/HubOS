import {
  BaseNFTModel,
  TaskContributionNFT,
  TaskContributionProperties
} from "@aut-labs/sdk";

export class JoinDiscordTaskContributionProperties extends TaskContributionProperties {
  inviteUrl: string;
  constructor(data: JoinDiscordTaskContributionProperties) {
    super(data);
    this.inviteUrl = data.inviteUrl;
  }
}

export class JoinDiscordContribution<
  T = JoinDiscordTaskContributionProperties
> extends TaskContributionNFT<T> {
  static getContributionNFT(
    contribution: JoinDiscordContribution
  ): BaseNFTModel<any> {
    const taskContribution = new JoinDiscordContribution(contribution);
    return {
      name: taskContribution.name,
      description: taskContribution.description,
      properties: {
        inviteUrl: taskContribution.properties.inviteUrl,
      }
    } as BaseNFTModel<any>;
  }
  constructor(
    data: JoinDiscordContribution<T> = {} as JoinDiscordContribution<T>
  ) {
    super(data);
    this.properties = new JoinDiscordTaskContributionProperties(
      data.properties as JoinDiscordTaskContributionProperties
    ) as T;
  }
}
