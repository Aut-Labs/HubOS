import {
  BaseNFTModel,
  TaskContributionNFT,
  TaskContributionProperties
} from "@aut-labs/sdk";

export class DiscordPollContributionProperties extends TaskContributionProperties {
  channelId: string;
  duration: string;
  guildId: string;
  options: string[];

  constructor(data: DiscordPollContributionProperties) {
    super(data);
    this.channelId = data.channelId;
    this.duration = data.duration;
    this.guildId = data.guildId;
    this.options = data.options || [];
  }
}

export class DiscordPollContribution<
  T = DiscordPollContributionProperties
> extends TaskContributionNFT<T> {
  static getContributionNFT(
    contribution: DiscordPollContribution
  ): BaseNFTModel<any> {
    const taskContribution = new DiscordPollContribution(contribution);
    return {
      name: taskContribution.name,
      description: taskContribution.description,
      properties: {
        duration: taskContribution.properties.duration,
        channelId: taskContribution.properties.channelId,
        guildId: taskContribution.properties.guildId,
        options: taskContribution.properties.options
      }
    } as BaseNFTModel<any>;
  }

  constructor(
    data: DiscordPollContribution<T> = {} as DiscordPollContribution<T>
  ) {
    super(data);
    this.properties = new DiscordPollContributionProperties(
      data.properties as DiscordPollContributionProperties
    ) as T;
  }

  contributionType? = "Discord Polls";
}
