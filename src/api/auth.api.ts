import axios from "axios";
import { environment } from "./environment";

export const AUTH_TOKEN_KEY = "user-access-token";

export const authoriseWithWeb3 = async (provider: any): Promise<boolean> => {
  try {
    const [account] = await provider.request({
      method: "eth_requestAccounts"
    });

    const responseNonce = await axios.get(
      `${environment.apiUrl}/autID/user/nonce/${account}`
    );

    const nonce = responseNonce.data.nonce;

    const signature = await provider.request({
      method: "personal_sign",
      params: [nonce, account]
    });

    const jwtResponse = await axios.post(
      `${environment.apiUrl}/autID/user/getToken`,
      {
        address: account,
        signature
      }
    );
    localStorage.setItem(AUTH_TOKEN_KEY, jwtResponse.data.token);
    const isAuthorised = !!jwtResponse.data.token;
    return isAuthorised;
  } catch (error) {
    return false;
  }
};
