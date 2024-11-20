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
