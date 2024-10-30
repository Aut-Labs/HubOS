import {
  BaseNFTModel,
  TaskContributionNFT,
  TaskContributionProperties
} from "@aut-labs/sdk";

export class QuizTaskContributionProperties extends TaskContributionProperties {
  constructor(data: QuizTaskContributionProperties) {
    super(data);
  }
}

export class QuizTaskContribution<
  T = QuizTaskContributionProperties
> extends TaskContributionNFT<T> {
  constructor(data: QuizTaskContribution<T> = {} as QuizTaskContribution<T>) {
    super(data);
    this.properties = new QuizTaskContributionProperties(
      data.properties as QuizTaskContributionProperties
    ) as T;
  }
}
