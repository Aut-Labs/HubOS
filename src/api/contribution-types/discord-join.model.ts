import {
  BaseNFTModel,
  TaskContributionNFT,
  TaskContributionProperties
} from "@aut-labs/sdk";

export class JoinDiscordContributionProperties extends TaskContributionProperties {
  guildId: string;
  inviteUrl: string;
  constructor(data: JoinDiscordContributionProperties) {
    super(data);
    this.guildId = data.guildId;
    this.inviteUrl = data.inviteUrl;
  }
}

export class JoinDiscordContribution<
  T = JoinDiscordContributionProperties
> extends TaskContributionNFT<T> {
  static getContributionNFT(
    contribution: JoinDiscordContribution
  ): BaseNFTModel<any> {
    const taskContribution = new JoinDiscordContribution(contribution);
    return {
      name: taskContribution.name,
      description: taskContribution.description,
      properties: {
        guildId: taskContribution.properties.guildId,
        inviteUrl: taskContribution.properties.inviteUrl
      }
    } as BaseNFTModel<any>;
  }

  constructor(
    data: JoinDiscordContribution<T> = {} as JoinDiscordContribution<T>
  ) {
    super(data);
    this.properties = new JoinDiscordContributionProperties(
      data.properties as JoinDiscordContributionProperties
    ) as T;
  }

  contributionType? = "Join Discord";
}
