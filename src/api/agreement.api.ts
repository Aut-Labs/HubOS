import { Web3ThunkProviderFactory } from './ProviderFactory/web3-thunk.provider';

const partnersAgreementThunkProvider = Web3ThunkProviderFactory('PartnersAgreement', {
  provider: null,
});

export const getPAUrl = partnersAgreementThunkProvider(
  {
    type: 'partner/url/get',
  },
  (thunkAPI) => {
    return null;
    // const { partner } = thunkAPI.getState();
    // const paCommunity = partner?.paCommunity;
    // return Promise.resolve(paCommunity.partnersAgreementAddress);
  },
  async (contract) => {
    const urls = await contract.getURLs();
    return urls?.length > 0 ? urls[urls.length - 1] : undefined;
  }
);

export const addPAUrl = partnersAgreementThunkProvider(
  {
    type: 'partner/url/add',
    // event: PartnersAgreementContractEventType.UrlAdded,
  },
  (thunkAPI) => {
    return null;
    const { partner } = thunkAPI.getState();
    const paCommunity = partner?.paCommunity;
    return Promise.resolve(paCommunity.partnersAgreementAddress);
  },
  async (contract, daoUrl, { dispatch }) => {
    await contract.addURL(daoUrl);
    return dispatch(getPAUrl(null));
  }
);

export const getPAContracts = partnersAgreementThunkProvider(
  {
    type: 'partner/contracts/get',
  },
  (thunkAPI) => {
    return null;
    const { partner } = thunkAPI.getState();
    const paCommunity = partner?.paCommunity;
    return Promise.resolve(paCommunity.partnersAgreementAddress);
  },
  async (contract) => {
    const contracts = await contract.getImportedAddresses();
    return contracts;
  }
);

export const addPAContracts = partnersAgreementThunkProvider(
  {
    type: 'partner/contracts/add',
    // event: PartnersAgreementContractEventType.PartnersContractAdded,
  },
  (thunkAPI) => {
    return null;
    const { partner } = thunkAPI.getState();
    const paCommunity = partner?.paCommunity;
    return Promise.resolve(paCommunity.partnersAgreementAddress);
  },
  async (contract, payload, { dispatch }) => {
    const { newItems } = payload;
    for (const item of newItems) {
      await contract.addNewContractAddressToAgreement(item.address);
    }
    return dispatch(getPAContracts(null));
  }
);
