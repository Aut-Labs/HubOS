import {
  BaseNFTModel,
  TaskContributionNFT,
  TaskContributionProperties
} from "@aut-labs/sdk";

export class DiscordGatheringContributionProperties extends TaskContributionProperties {
  channelId: string;
  duration: number;
  guildId: string;
  roles: string[];

  constructor(data: DiscordGatheringContributionProperties) {
    super(data);
    this.channelId = data.channelId;
    this.duration = data.duration;
    this.guildId = data.guildId;
    this.roles = data.roles;
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
      properties: {
        duration: taskContribution.properties.duration,
        channelId: taskContribution.properties.channelId,
        guildId: taskContribution.properties.guildId,
        roles: taskContribution.properties.roles
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

  contributionType? = "Discord Gatherings";
}
