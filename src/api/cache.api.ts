import axios from "axios";
import { environment } from "./environment";

interface CacheModel {
  address: string;
  daoAddress: string;
  onboardingPluginAddress: string;
  questId: number;
  list: any[];
}

export const getCache = async (userAddress: string): Promise<CacheModel> => {
  const res = await axios.get(
    `${environment.apiUrl}/autID/cache/getCache/${userAddress}`
  );
  return res?.data || null;
};

export const updateCache = async (cache: CacheModel): Promise<CacheModel> => {
  const res = await axios.post(
    `${environment.apiUrl}/autID/cache/addOrUpdateCache`,
    cache
  );
  return res?.data || null;
};

export const deleteCache = async (cache: CacheModel): Promise<void> => {
  const res = await axios.delete(
    `${environment.apiUrl}/autID/cache/deleteCache/${cache.address}`
  );
  return res?.data || null;
};
