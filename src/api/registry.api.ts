import {
  CommunityRegistryContractEventType,
  Web3CommunityRegistryProvider,
} from "@skill-wallet/sw-abi-types";
import { Community } from "./community.model";
import { environment } from "./environment";
import { Web3ThunkProviderFactory } from "./ProviderFactory/web3-thunk.provider";
import { ipfsCIDToHttpUrl, storeAsBlob, storeImageAsBlob } from "./textile.api";

const communityRegistryThunkProvider = Web3ThunkProviderFactory(
  "CommunityRegistry",
  {
    provider: Web3CommunityRegistryProvider,
  }
);

export const createPartnersCommunity = communityRegistryThunkProvider(
  {
    type: "integrate/create/community",
    event: CommunityRegistryContractEventType.CommunityCreated,
  },
  () => {
    return Promise.resolve(environment.registryAdress);
  },
  async (
    contract,
    requestBody: { metadata: Community; contractType: number; daoAddr: string }
  ) => {
    const { metadata, contractType, daoAddr } = requestBody;
    console.log("Metadata -> ", metadata);
    console.log("ContractType -> ", contractType);
    console.log("DaoAddr -> ", daoAddr);
    if (metadata.image) {
      metadata.image = await storeImageAsBlob(metadata.image as File);
    }
    const cid = await storeAsBlob(metadata);
    console.log("Metadata url -> ", ipfsCIDToHttpUrl(cid));
    const response = await contract.createCommunity(
      contractType,
      daoAddr,
      metadata.properties.market as number,
      cid,
      metadata.properties.commitment
    );
    return response[0];
  }
);
