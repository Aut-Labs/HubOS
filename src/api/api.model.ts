import { TokenInput } from 'nft.storage/dist/src/lib/interface';

/* eslint-disable no-shadow */
export enum ActivityTypes {
  Polls = 1,
  Gatherings,
  Tasks,
}

export enum CommunityEventTypes {
  Ongoing,
  Upcoming,
  Past,
}

export class BaseNFTModel<Properties> implements Omit<TokenInput, 'image'> {
  name: string;

  description: string;

  image: File | string;

  properties: Properties;

  constructor(data: BaseNFTModel<Properties>) {
    this.name = data.name;
    this.description = data.description;
    this.image = data.image as string;
    this.properties = data.properties;
  }
}

export interface ActivityTask {
  name: string;
  description: string;
  image: File;
  properties: {
    creator: string;
    creatorAutId: string;
    role: string;
    roleId: number;
    participants: number;
    allParticipants: boolean;
    description: string;
    title: string;
    isCoreTeamMembersOnly: boolean;
  };
}

export interface ActivityPoll {
  timestamp: number;
  pollData: ActivityPollData;
  results: string;
  isFinalized: boolean;
  role: number;
  dueDate: number;
}

export interface ActivityPollData {
  title: string;
  description: string;
  duration: string;
  options: {
    option: string;
    emoji: string;
  }[];
  role: string;
  roleName?: string;
  allRoles: boolean;
}
export interface CommunityContractError {
  code: number;
  message: string;
  data: {
    code: number;
    data: any;
    message: string;
  };
}

export interface AutTask {
  tokenId: string;
  nickname: string;
  imageUrl: string;
  timestamp: string;
}
export interface Role {
  roleName: string;
  id: number;
}
export interface RoleSet {
  roleSetName: string;
  roles: Role[];
}
