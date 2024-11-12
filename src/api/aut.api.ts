import axios from "axios";
import { environment } from "./environment";
import { NetworkConfig } from "./ProviderFactory/network.config";
import { AuthSig } from "@aut-labs/connector/lib/esm/aut-sig";

export const getAppConfig = (): Promise<NetworkConfig[]> => {
  return axios
    .get(`${environment.apiUrl}/aut/config/network/${environment.networkEnv}`)
    .then((r) => r.data);
};

interface EncryptRequest {
  autSig: AuthSig;
  message: string;
  hubAddress: string;
}

export const encryptMessage = (body: EncryptRequest): Promise<string> => {
  return axios
    .post(`${environment.apiUrl}/task/encrypt`, body)
    .then((r) => r.data);
};
