import { AutIDContractEventType, Web3AutIDProvider } from '@skill-wallet/sw-abi-types';
import axios from 'axios';
import { environment } from './environment';
import { EnableAndChangeNetwork } from './ProviderFactory/web3.network';
import { Web3ThunkProviderFactory } from "./ProviderFactory/web3-thunk.provider";

export const getUsersData = () => {
  const params = {
    startDate: '1622592571001',
    perMonth: true,
  };
  const headers = {
    key: '193485710394857',
  };
  return axios
    .get(`${environment.apiUrl}/analytics/activeUsers`, {
      params,
      headers,
    })
    .then((res) => res.data);
};

export const getCoreTeamMemberNames = async (communityAddress) => {
  return axios.get(`${environment.apiUrl}/community/${communityAddress}/coreTeamMembers`).then((res) => res.data);
};

export const addCoreTeamName = async (communityAddress, memberAddress, memberName) => {
  return axios
    .post(`${environment.apiUrl}/community/${communityAddress}/coreTeamMembers`, {
      memberAddress,
      memberName,
    })
    .then((res) => res.data)
    .catch(() => false);
};

export const getPartnersAgreementByKey = async (partnerKey) => {
  return axios.get(`${environment.apiUrl}/community/key/${partnerKey}`);
};

export const addDiscordUrl = async (partnerKey, discordWebhook) => {
  return axios
    .post(`${environment.apiUrl}/community/key/${partnerKey}/discordWebhook`, {
      discordWebhook,
    })
    .then(() => discordWebhook);
};

export const getAutAddress = (): Promise<string> => {
  return axios.get(`${environment.apiUrl}/Aut/config`, {}).then((res) => res.data.AutAddress);
};

export const partnerAgreementAccess = (partnerKey: string): Promise<boolean> => {
  return axios
    .post(
      `${environment.apiUrl}/Aut/access`,
      {},
      {
        headers: {
          authorization: partnerKey,
        },
      }
    )
    .then((res) => res.data)
    .catch(() => false);
};

export const activatePaCommunity = (data) => {
  const event = new CustomEvent('activateAutCommunity', {
    detail: data,
  });
  window.dispatchEvent(event);
  return new Promise((resolve, reject) => {
    const handleResponse = ({ detail }: any) => {
      resolve(detail);
      window.removeEventListener('activateAutCommunitySuccess', handleResponse);
    };
    const handleError = ({ detail }: any) => {
      reject(detail || 'Could not activate community, please try again');
      window.removeEventListener('activateAutCommunityError', handleError);
    };
    window.addEventListener('activateAutCommunitySuccess', handleResponse);
    window.addEventListener('activateAutCommunityError', handleError);
  });
};

// @OTOD: Milena to implement method for fetching logs
export const getLogs = (): Promise<any[]> => {
  return new Promise((resolve) => {
    resolve([
      {
        img: '',
        title: 'SW 1',
        sign: '@',
        source: '',
        role: 'Role',
        timestamp: new Date(),
      },
      {
        img: '',
        title: 'SW 1',
        sign: '@',
        source: '',
        role: 'Role',
        timestamp: new Date(),
      },
      {
        img: '',
        title: 'SW 1',
        sign: '@',
        role: 'Role',
        source: '',
        timestamp: new Date(),
      },
      {
        img: '',
        title: 'SW 1',
        sign: '@',
        source: '',
        role: 'Role',
        timestamp: new Date(),
      },
      {
        img: '',
        title: 'SW 1',
        sign: '@',
        source: '',
        role: 'Role',
        timestamp: new Date(),
      },
      {
        img: '',
        title: 'SW 1',
        sign: '@',
        source: '',
        role: 'Role',
        timestamp: new Date(),
      },
    ]);
  });
};

export const AutExists = async () => {
  try {
    const AutAddress = await getAutAddress();

    const contract = await Web3AutIDProvider(AutAddress, { beforeRequest: () => EnableAndChangeNetwork() });

    if (window.ethereum.selectedAddress) {
      const { selectedAddress } = window.ethereum;
      const tokenId = await contract.getAutIDByOwner(selectedAddress);
      if (tokenId) {
        return true;
      }
    }
    return false;
  } catch (e) {
    return false;
  }
};


const autIDThunkProvider = Web3ThunkProviderFactory(
  "AutID",
  {
    provider: Web3AutIDProvider,
  }
);

export const addDiscordToAutID = autIDThunkProvider(
  {
    type: "autID/integrate/discord",
    event: AutIDContractEventType.DiscordIDConnectedToAutID,
  },
  () => {
    return Promise.resolve('0xCeb3300b7de5061c633555Ac593C84774D160309');
  },
  async (
    contract,
    discordId
  ) => {
    const result = await contract.addDiscordIDToAutID(discordId);
    return result;
  }
);