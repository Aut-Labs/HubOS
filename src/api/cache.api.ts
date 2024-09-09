import axios from "axios";
import { environment } from "./environment";

export enum CacheTypes {
  UserPhases = "UserPhases",
  AnswerStore = "AnswerStore"
}

export interface CacheModel {
  cacheKey: string;
  address: string;
  novaAddress: string;
  onboardingQuestAddress: string;
  questId: number;
  list: any[];
  createdAt?: Date;
}

export const getCache = async (
  cacheKey: string,
  address: string
): Promise<CacheModel> => {
  // if (!AUTH_TOKEN_KEY || !isAuthenticated) {
  //   localStorage.removeItem(AUTH_TOKEN_KEY);
  //   return;
  // }
  // const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const res = await axios.get(
    `${environment.apiUrl}/aut/cache/getCache/${cacheKey}?address=${address}`
    // {
    //   headers: {
    //     Authorization: token
    //   }
    // }
  );
  return res?.data || null;
};

export const updateCache = async (
  cache: Partial<CacheModel>
): Promise<CacheModel> => {
  // const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const res = await axios.post(
    `${environment.apiUrl}/aut/cache/addOrUpdateCache/${cache.cacheKey}`,
    cache
    // {
    //   headers: {
    //     Authorization: token
    //   }
    // }
  );
  return res?.data || null;
};

export const deleteCache = async (
  cacheKey: string,
  address: string
): Promise<void> => {
  // const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const res = await axios.delete(
    `${environment.apiUrl}/aut/cache/deleteCache/${cacheKey}?address=${address}`
    // {
    //   headers: {
    //     Authorization: token
    //   }
    // }
  );
  return res?.data || null;
};
