import { CommunityCallByteCode, PollsABI, PollsByteCode } from '@skill-wallet/sw-abi-types';
import { ethers } from 'ethers';
import { EnableAndChangeNetwork } from './web3.network';

export const deployPolls = async (communityAddress: string, discordBotAddress: string) => {
  await EnableAndChangeNetwork();
  const webProvider = new ethers.providers.Web3Provider(window.ethereum);

  const signer = webProvider.getSigner();
  console.log(CommunityCallByteCode.bytecode);
  const Contract = new ethers.ContractFactory(PollsABI, PollsByteCode.bytecode, signer);

  const activities = await Contract.deploy(communityAddress, discordBotAddress);
  await activities.deployed();
  return activities.address;
};
