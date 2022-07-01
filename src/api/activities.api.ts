import { ethers } from 'ethers';
import {
  PollsContractEventType,
  Web3CommunityCallProvider,
  Web3CommunityExtensionProvider,
  Web3PollsProvider,
} from '@skill-wallet/sw-abi-types';
import { Task, TaskStatus } from '@store/model';
import axios from 'axios';
import { dateToUnix } from '@utils/date-format';
import { sendDiscordNotification } from '@store/ui-reducer';
import { format } from 'date-fns';
import { ActivityTypes } from './api.model';
import { ipfsCIDToHttpUrl, storeAsBlob, storeMetadata } from './textile.api';
import { deployPolls } from './ProviderFactory/deploy-activities';
import { Web3ThunkProviderFactory } from './ProviderFactory/web3-thunk.provider';
import { Community } from './community.model';
import { AsyncThunkConfig, GetThunkAPI } from './ProviderFactory/web3.thunk.type';
import { DiscordMessage } from './discord.api';
import { environment } from './environment';

const callThunkProvider = Web3ThunkProviderFactory('Call', {
  provider: Web3CommunityCallProvider,
});

const taskThunkProvider = Web3ThunkProviderFactory('Task', {
  provider: null,
});

const pollsThunkProvider = Web3ThunkProviderFactory('Poll', {
  provider: Web3PollsProvider,
});

const contractAddress = async (thunkAPI: GetThunkAPI<AsyncThunkConfig>, skipDeploy = false) => {
  const state = thunkAPI.getState();
  const { community } = state.community;
  debugger;
  const contract = await Web3CommunityExtensionProvider(community.properties.address);
  const activities = (await contract.getActivitiesWhitelist()) as any[];
  let address;
  if (activities || activities.length > 0) {
    // for (let i = 0; i < activities.length; i++) {
    //   console.log(activities[i]);
    //   if (activities[i].actType.toString() === '1') {
    //     address = activities[i].actAddr;
    //   }
    // }
  }
  if (!address) {
    address = await deployPolls(community.properties.address, environment.discordBotAddress);
    await contract.addActivitiesAddress(address, 1);
  }
  console.log(address);
  return Promise.resolve(address);
};

export const getPolls = pollsThunkProvider(
  {
    type: 'aut-dashboard/polls/get',
  },
  contractAddress,
  async (contract, task, { getState, dispatch }) => {
    const state = getState();
  }
);

export const addActivityTask = taskThunkProvider(
  {
    type: 'aut-dashboard/activities/task/add',
    // event: ActivitiesContractEventType.ActivityCreated,
  },
  contractAddress,
  async (contract, task, { getState, dispatch }) => {
    const state = getState();
    const { userInfo } = state.auth;
    const { role, isCoreTeamMembersOnly, allParticipants, participants, description, title } = task;
    const community = state.community.community as Community;
    // const selectedRole = community.properties.skills.roles.find(({ roleName }) => roleName === role);

    const selectedRole = null;
    if (!selectedRole) {
      throw new Error('Role is missing!');
    }

    const metadata = {
      name: title,
      description,
      image: community.image,
      properties: {
        creator: userInfo.nickname,
        creatorAutId: window.ethereum.selectedAddress,
        role: selectedRole,
        roleId: role,
        participants,
        allParticipants,
        description,
        title,
        isCoreTeamMembersOnly,
      },
    };
    const uri = await storeMetadata(metadata);
    const result = await contract.createTask(selectedRole.id, uri);
    const discordMessage: DiscordMessage = {
      title: `New Community Task`,
      description: `${allParticipants ? 'All' : participants} **${selectedRole.roleName}** participants can claim the task`,
      fields: [
        {
          name: 'Title',
          value: title,
        },
        {
          name: 'Description',
          value: description,
        },
      ],
    };
    await dispatch(sendDiscordNotification(discordMessage));
    return result;
  }
);

export const takeActivityTask = taskThunkProvider(
  {
    type: 'aut-dashboard/activities/task/take',
    // event: ActivitiesContractEventType.TaskTaken,
  },
  contractAddress,
  async (contract, requestData) => {
    await contract.takeTask(+requestData.activityId);
    return {
      ...requestData,
      taker: window.ethereum.selectedAddress,
      status: TaskStatus.Taken,
    };
  }
);

export const finalizeActivityTask = taskThunkProvider(
  {
    type: 'aut-dashboard/activities/task/finalize',
    // event: ActivitiesContractEventType.TaskFinalized,
  },
  contractAddress,
  async (contract, requestData) => {
    await contract.finilizeTask(+requestData.activityId);
    return {
      ...requestData,
      taker: window.ethereum.selectedAddress,
      status: TaskStatus.Finished,
    };
  }
);

export const submitActivityTask = taskThunkProvider(
  {
    type: 'aut-dashboard/activities/task/submit',
    // event: ActivitiesContractEventType.TaskSubmitted,
  },
  contractAddress,
  async (contract, { task, values }) => {
    const metadata = {
      title: task.title,
      description: values.description,
    };
    const uri = await storeAsBlob(metadata);
    await contract.submitTask(+task.activityId, uri);
    return {
      ...task,
      taker: window.ethereum.selectedAddress,
      status: TaskStatus.Submitted,
    };
  }
);

export const addGroupCall = taskThunkProvider(
  {
    type: 'aut-dashboard/activities/group-call/add',
    // event: ActivitiesContractEventType.ActivityCreated,
  },
  contractAddress,
  async (contract, callData, { getState, dispatch }) => {
    const state = getState();
    const { startDate, startTime, duration, allParticipants, participants, role } = callData;
    const community = state.community.community as Community;
    // const selectedRole = community.properties.skills.roles.find(({ roleName }) => roleName === role);

    const selectedRole = null;
    if (!selectedRole) {
      throw new Error('Role is missing!');
    }

    const start = new Date(startDate);
    const time = new Date(startTime);
    start.setHours(time.getHours());
    start.setMinutes(time.getMinutes());
    start.setSeconds(0);
    const metadata = {
      startTime: dateToUnix(start),
      duration,
      roleId: selectedRole.id,
      allParticipants,
      participants,
    };
    const uri = await storeAsBlob(metadata);
    const result = await contract.createActivity(ActivityTypes.CommunityCall, selectedRole.id, uri);
    const discordMessage: DiscordMessage = {
      title: 'New Community Call',
      description: `${allParticipants ? 'All' : participants} **${selectedRole.roleName}** participants can join the call`,
      fields: [
        {
          name: 'Date',
          value: format(start, 'PPPP'),
          inline: true,
        },
        {
          name: 'Time',
          value: format(time, 'hh:mm a'),
          inline: true,
        },
        {
          name: 'Duration',
          value: duration,
          inline: true,
        },
      ],
    };
    await dispatch(sendDiscordNotification(discordMessage));
    return result;
  }
);

export const publishPoll = (poll) => {
  return axios.post(`${environment.discordBotUrl}/poll`, poll).then((res) => res);
};

export const addPoll = pollsThunkProvider(
  {
    type: 'aut-dashboard/activities/poll/add',
    event: PollsContractEventType.PollCreated,
  },
  contractAddress,
  async (contract, callData, { getState, dispatch }) => {
    console.log(contract.contract);
    const state = getState();
    const { title, description, duration, options, emojis, role, allRoles } = callData;

    const community = state.community.community as Community;
    const selectedRole = community.properties.rolesSets[0].roles.find(({ roleName }) => roleName === role);
    let roleId = 0;
    let roleName = 'All';
    if (!allRoles) {
      roleId = selectedRole.id;
      roleName = selectedRole.roleName;
    }

    if (roleId === undefined || roleId === null) {
      throw new Error('RoleId missing!');
    }

    const metadata = {
      role: roleId,
      roleName,
      title,
      description,
      duration,
      options,
      emojis,
    };
    const uri = await storeAsBlob(metadata);
    console.log('polluri', uri);
    let daysToAdd = 0;
    switch (duration) {
      case '1d':
        daysToAdd = 1;
        break;
      case '1w':
        daysToAdd = 7;
        break;
      case '1m':
        daysToAdd = 30;
        break;
      default:
        daysToAdd = 1;
    }

    const date = new Date();
    const endTime = date.setDate(date.getDate() + daysToAdd);
    const endTimeBlock = Math.floor(endTime / 1000);
    console.log(roleId, endTimeBlock, uri);
    console.log('ce', await contract.communityExtension());
    const result = await contract.create(1, endTimeBlock, `ipfs://${uri}`);

    console.log(result);

    // publishPoll({
    //   ...metadata,
    //   activitiesAddress: contract.contract.address,
    //   activityId: result[0].toString(),
    // });

    return undefined;
  }
);

export const getAllTasks = taskThunkProvider(
  {
    type: 'aut-dashboard/activities/tasks/getall',
  },
  (thunkAPI: GetThunkAPI<AsyncThunkConfig>) => contractAddress(thunkAPI, true),
  async (contract, type: ActivityTypes) => {
    if (contract.contract.address === ethers.constants.AddressZero) {
      return [];
    }
    const activityIds = await contract.getActivitiesByType(type);
    const tasks = [];

    for (let i = 0; i < activityIds.length; i += 1) {
      const tokenCID = await contract.tokenURI(activityIds[i]);
      const response = await axios.get(tokenCID);
      const task: any = await contract.getTaskByActivityId(activityIds[i]);
      tasks.push({
        activityId: task.activityId.toString(),
        title: response.data.name,
        createdOn: task.createdOn.toString(),
        status: task.status,
        creator: task.creator.toString(),
        taker: task.taker.toString(),
        description: response.data.properties.description,
        isCoreTeamMembersOnly: response.data.properties.isCoreTeamMembersOnly,
      });
    }

    return tasks;
  }
);

export const getTaskById = taskThunkProvider(
  {
    type: 'aut-dashboard/activities/tasks/get',
  },
  contractAddress,
  async (contract, activityID: string, { getState }) => {
    const {
      auth: { userInfo },
      tasks: { tasks, selectedTask },
    } = getState();

    let task = selectedTask;

    if (selectedTask?.activityId === activityID) {
      task = {
        task: selectedTask,
        taker: selectedTask.owner,
      };
    } else {
      task = null;
    }

    if (!task) {
      const existingTask: Task = tasks.find((t: Task) => t.activityId === activityID);
      if (existingTask?.owner) {
        task = {
          task: existingTask,
          taker: existingTask.owner,
        };
      } else if (existingTask?.taker?.toLowerCase() === window.ethereum.selectedAddress?.toLowerCase()) {
        task = {
          task: existingTask,
          taker: {
            tokenId: userInfo?.tokenId,
            imageUrl: userInfo?.imageUrl,
            nickname: userInfo?.nickname,
          },
        };
      } else {
        task = null;
      }
    }

    if (task) {
      return task;
    }

    const tokenCID = await contract.tokenURI(+activityID);
    const response = await axios.get(tokenCID);
    task = await contract.getTaskByActivityId(+activityID);
    const taskDetails = {
      taker: {},
      task: {
        task: undefined,
        activityId: task.activityId.toString(),
        title: response.data.name,
        createdOn: task.createdOn.toString(),
        status: task.status,
        creator: task.creator.toString(),
        taker: task.taker.toString(),
        description: response.data.properties.description,
        isCoreTeamMembersOnly: response.data.properties.isCoreTeamMembersOnly,
      },
    };

    if (taskDetails.task.status > 0) {
      const autContract = null;
      const takerTokenId = await autContract.getAutIdByOwner(taskDetails.task.taker);
      const jsonUriCID = await autContract.tokenURI(takerTokenId);
      const response = await axios.get(ipfsCIDToHttpUrl(jsonUriCID, true));
      taskDetails.taker = {
        tokenId: takerTokenId.toString(),
        imageUrl: ipfsCIDToHttpUrl(response.data.image, false),
        nickname: response.data.properties.username,
        timestamp: undefined,
      };
    }
    return taskDetails;
  }
);
