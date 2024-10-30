import {
    BaseNFTModel,
    TaskContributionNFT,
    TaskContributionProperties
  } from "@aut-labs/sdk";

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