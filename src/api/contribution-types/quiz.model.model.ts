import {
  BaseNFTModel,
  TaskContributionNFT,
  TaskContributionProperties
} from "@aut-labs/sdk";

interface QuizQuestionsAndAnswers {
  question: string;
  questionType: string;
  answers: {
    value: string;
    correct: boolean;
  }[];
}

export class QuizTaskContributionProperties extends TaskContributionProperties {
  questions: QuizQuestionsAndAnswers[];
  hash: string;
  constructor(data: QuizTaskContributionProperties) {
    super(data);
    this.questions = data.questions;
    this.hash = data.hash;
  }
}

export class QuizTaskContribution<
  T = QuizTaskContributionProperties
> extends TaskContributionNFT<T> {
  static getContributionNFT(
    contribution: QuizTaskContribution
  ): BaseNFTModel<any> {
    const taskContribution = new QuizTaskContribution(contribution);
    return {
      name: taskContribution.name,
      description: taskContribution.description,
      properties: {
        questions: taskContribution.properties.questions,
      }
    } as BaseNFTModel<any>;
  }
  constructor(data: QuizTaskContribution<T> = {} as QuizTaskContribution<T>) {
    super(data);
    this.properties = new QuizTaskContributionProperties(
      data.properties as QuizTaskContributionProperties
    ) as T;
  }

  contributionType? = "Quiz";
}
