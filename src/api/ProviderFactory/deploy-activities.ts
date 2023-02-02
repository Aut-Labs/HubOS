import {
  CommunityCallABI,
  CommunityCallByteCode,
  PollsABI,
  PollsByteCode,
  TasksABI,
  TasksByteCode
} from "@aut-protocol/abi-types";
import { ethers } from "ethers";
import { EnableAndChangeNetwork } from "./web3.network";

export const deployPolls = async (
  communityAddress: string,
  discordBotAddress: string
) => {
  // await EnableAndChangeNetwork();
  const webProvider = new ethers.providers.Web3Provider(window.ethereum);

  const signer = webProvider.getSigner();
  const Contract = new ethers.ContractFactory(
    PollsABI,
    PollsByteCode.bytecode,
    signer
  );

  const activities = await Contract.deploy(communityAddress, discordBotAddress);
  await activities.deployed();
  return activities.address;
};

export const deployGatherings = async (
  communityAddress: string,
  discordBotAddress: string
) => {
  // await EnableAndChangeNetwork();
  const webProvider = new ethers.providers.Web3Provider(window.ethereum);

  const signer = webProvider.getSigner();
  const Contract = new ethers.ContractFactory(
    CommunityCallABI,
    CommunityCallByteCode.bytecode,
    signer
  );

  const activities = await Contract.deploy(communityAddress, discordBotAddress);
  await activities.deployed();
  return activities.address;
};

export const deployTasks = async (
  communityAddress: string,
  discordBotAddress: string
) => {
  // await EnableAndChangeNetwork();
  const webProvider = new ethers.providers.Web3Provider(window.ethereum);

  const signer = webProvider.getSigner();
  const Contract = new ethers.ContractFactory(
    TasksABI,
    TasksByteCode.bytecode,
    signer
  );

  const activities = await Contract.deploy(communityAddress, discordBotAddress);
  await activities.deployed();
  return activities.address;
};
