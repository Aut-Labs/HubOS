import {
    BaseNFTModel,
    TaskContributionNFT,
    TaskContributionProperties
  } from "@aut-labs/sdk";
  
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
    constructor(data: PullRequestContribution<T> = {} as PullRequestContribution<T>) {
      super(data);
      this.properties = new PullRequestContributionProperties(
        data.properties as PullRequestContributionProperties
      ) as T;
    }
  
    contributionType? = "Pull Request";
  }