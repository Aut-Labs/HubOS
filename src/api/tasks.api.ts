import axios from "axios";
import { environment } from "./environment";
import { AUTH_TOKEN_KEY } from "./auth.api";

export const saveQestions = async (
  userAddress: string,
  taskAddress: string,
  uuid: string,
  questions: any[]
): Promise<void> => {
  // const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const res = await axios.post(
    `${environment.apiUrl}/autID/quiz`,
    {
      address: userAddress,
      taskAddress,
      uuid,
      questions
    }
    // {
    //   headers: {
    //     Authorization: token
    //   }
    // }
  );
  return res?.data || null;
};

export const deleteQestions = async (
  userAddress: string,
  taskAddress: string,
  uuid: string,
  questions: any[]
): Promise<void> => {
  // const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const res = await axios.post(
    `${environment.apiUrl}/autID/removeQuiz`,
    {
      address: userAddress,
      taskAddress,
      uuid,
      questions
    }
    // {
    //   headers: {
    //     Authorization: token
    //   }
    // }
  );
  return res?.data || null;
};

export const getQestions = async (taskAddress: string): Promise<any[]> => {
  // const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const res = await axios.get(
    `${environment.apiUrl}/autID/quiz/all`

    // {
    //   headers: {
    //     Authorization: token
    //   }
    // }
  );
  return res?.data || [];
};

export const finaliseQuizTask = async (
  userAddress: string,
  taskAddress: string,
  onboardingPluginAddress: string,
  taskId: number,
  questionsAndAnswers: any[]
): Promise<{
  isFinalized: boolean;
  txHash: string;
  error: string;
}> => {
  // const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const res = await axios.post(
    `${environment.apiUrl}/taskVerifier/quiz`,
    {
      address: userAddress,
      onboardingPluginAddress,
      questionsAndAnswers,
      taskAddress,
      taskId
    }
    // {
    //   headers: {
    //     Authorization: token
    //   }
    // }
  );
  return res?.data || null;
};

export const finaliseTransactionTask = async (
  userAddress: string,
  taskAddress: string,
  onboardingPluginAddress: string,
  taskId: number
): Promise<{
  isFinalized: boolean;
  txHash: string;
  error: string;
}> => {
  // const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const res = await axios.post(
    `${environment.apiUrl}/taskVerifier/transaction`,
    {
      address: userAddress,
      onboardingPluginAddress,
      taskAddress,
      taskId
    }
    // {
    //   headers: {
    //     Authorization: token
    //   }
    // }
  );
  return res?.data || null;
};

export const finaliseJoinDiscordTask = async (
  userAddress: string,
  taskAddress: string,
  onboardingPluginAddress: string,
  taskId: number,
  discordAccessToken: string
): Promise<{
  isFinalized: boolean;
  txHash: string;
  error: string;
}> => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const res = await axios.post(
    `${environment.apiUrl}/taskVerifier/discordJoin`,
    {
      address: userAddress,
      onboardingPluginAddress,
      bearerToken: `Bearer ${discordAccessToken}`,
      taskAddress,
      taskId
    }
    // {
    //   headers: {
    //     Authorization: token
    //   }
    // }
  );
  return res?.data || null;
};
