import { ethers } from "ethers";
// import {
//   HubCallContractEventType,
//   PollsContractEventType,
//   TasksContractEventType
// } from "@aut-labs/abi-types";
import { Task, TaskStatus } from "@store/model";
import axios from "axios";
import { dateToUnix } from "@utils/date-format";
import { sendDiscordNotification } from "@store/ui-reducer";
import { ActivityPoll, ActivityTypes } from "./api.model";
import { ipfsCIDToHttpUrl } from "./storage.api";
import { Web3ThunkProviderFactory } from "./ProviderFactory/web3-thunk.provider";
// import {
//   AsyncThunkConfig,
//   GetThunkAPI
// } from "./ProviderFactory/web3.thunk.type";
import { DiscordMessage } from "./discord.api";
import { environment } from "./environment";
import { addMinutes, set } from "date-fns";
import { HubOSHub } from "./hub.model";

const callThunkProvider = Web3ThunkProviderFactory("Call", {
  provider: null
});

const taskThunkProvider = Web3ThunkProviderFactory("Task", {
  provider: null
});

const pollsThunkProvider = Web3ThunkProviderFactory("Poll", {
  provider: null
});

const contractAddress = async (thunkAPI: any, type: ActivityTypes) => {
  const state = thunkAPI.getState();
  const hubAddress = state.hub.selectedHubAddress;
  // const contract = await Web3HubExtensionProvider(hubAddress);
  // const activities = (await contract.getActivitiesWhitelist()) as any[];
  const activities = [];
  // let { actAddr } =
  //   (activities || []).find(
  //     ({ actType }) => Number(actType.toString()) === type
  //   ) || {};
  // if (!actAddr) {
  //   switch (type) {
  //     case ActivityTypes.Polls:
  //       actAddr = await deployPolls(
  //         hubAddress,
  //         environment.discordBotAddress
  //       );
  //       break;
  //     case ActivityTypes.Gatherings:
  //       actAddr = await deployGatherings(
  //         hubAddress,
  //         environment.discordBotAddress
  //       );
  //       break;
  //     case ActivityTypes.Tasks:
  //       actAddr = await deployTasks(
  //         hubAddress,
  //         environment.discordBotAddress
  //       );
  //       break;
  //     default:
  //       throw new Error("Activity type does not exist");
  //   }
    // await contract.addActivitiesAddress(actAddr, type);
  // }
  // return Promise.resolve(actAddr);
  return '';
};

export const getPolls = pollsThunkProvider(
  {
    type: "aut-dashboard/polls/get"
  },
  (thunkApi) => contractAddress(thunkApi, ActivityTypes.Polls),
  async (contract, _) => {
    const lastId = Number((await contract.getIDCounter()).toString());
    return Promise.all(
      Array.from({ length: lastId + 1 }).map((_, index) => {
        const currentId = index;
        return contract
          .getById(currentId)
          .then(
            async ([
              timestamp,
              pollData,
              results,
              isFinalized,
              role,
              dueDate
            ]) => {
              const metadataUri = ipfsCIDToHttpUrl(pollData);
              const response = (await axios.get(metadataUri)).data;
              return {
                timestamp: timestamp.toString(),
                pollData: response,
                results: results.toString(),
                isFinalized: isFinalized.toString(),
                role: role.toString(),
                dueDate: dueDate.toString()
              } as unknown as ActivityPoll;
            }
          );
      })
    );
  }
);

export const getCalls = callThunkProvider(
  {
    type: "aut-dashboard/calls/get"
  },
  (thunkApi) => contractAddress(thunkApi, ActivityTypes.Polls),
  async (contract, _) => {
    // const lastId = Number((await contract.getIDCounter()).toString());
    // return Promise.all(
    //   Array.from({ length: lastId + 1 }).map((_, index) => {
    //     const currentId = index;
    //     return contract.getById(currentId).then(async ([timestamp, pollData, results, isFinalized, role, dueDate]) => {
    //       const metadataUri = ipfsCIDToHttpUrl(pollData);
    //       const response = (await axios.get(metadataUri)).data;
    //       return {
    //         timestamp: timestamp.toString(),
    //         pollData: response,
    //         results: results.toString(),
    //         isFinalized: isFinalized.toString(),
    //         role: role.toString(),
    //         dueDate: dueDate.toString(),
    //       } as unknown as ActivityPoll;
    //     });
    //   })
    // );
  }
);

export const addActivityTask = taskThunkProvider(
  {
    type: "aut-dashboard/activities/task/add"
    // event: TasksContractEventType.TaskCreated
  },
  (thunkApi) => contractAddress(thunkApi, ActivityTypes.Tasks),
  async (contract, task, { getState, dispatch }) => {
    const state = getState();
    const { userInfo } = state.auth;
    const {
      role,
      isCoreTeamMembersOnly,
      allParticipants,
      participants,
      description,
      title
    } = task;
    const hubs = state.hub.hubs as HubOSHub[];
    const hubAddress = state.hub.selectedHubAddress as string;
    // const hub = communities.find(
    //   (c) => c.properties.address === hubAddress
    // );

    // const selectedRole = hub.properties.skills.roles.find(({ roleName }) => roleName === role);

    const selectedRole = null;
    if (!selectedRole) {
      throw new Error("Role is missing!");
    }

    // const metadata = {
    //   name: title,
    //   description,
    //   image: hub.image,
    //   properties: {
    //     creator: userInfo.nickname,
    //     creatorAutId: window.ethereum.selectedAddress,
    //     role: selectedRole,
    //     roleId: role,
    //     participants,
    //     allParticipants,
    //     description,
    //     title,
    //     isCoreTeamMembersOnly
    //   }
    // };
    // const uri = await storeMetadata(metadata);
    // const result = await contract.create(selectedRole.id, uri);
    const discordMessage: DiscordMessage = {
      title: `New Hub Task`,
      description: `${allParticipants ? "All" : participants} **${
        selectedRole.roleName
      }** participants can claim the task`,
      fields: [
        {
          name: "Title",
          value: title
        },
        {
          name: "Description",
          value: description
        }
      ]
    };
    await dispatch(sendDiscordNotification(discordMessage));
    // return result;
  }
);

export const takeActivityTask = taskThunkProvider(
  {
    type: "aut-dashboard/activities/task/take"
    // event: TasksContractEventType.TaskTaken
  },
  (thunkApi) => contractAddress(thunkApi, ActivityTypes.Tasks),
  async (contract, requestData) => {
    await contract.take(+requestData.activityId);
    return {
      ...requestData,
      taker: window.ethereum.selectedAddress,
      status: TaskStatus.Taken
    };
  }
);

export const finalizeActivityTask = taskThunkProvider(
  {
    type: "aut-dashboard/activities/task/finalize"
    // event: TasksContractEventType.TaskFinalized
  },
  (thunkApi) => contractAddress(thunkApi, ActivityTypes.Tasks),
  async (contract, requestData) => {
    await contract.finalize(+requestData.activityId);
    return {
      ...requestData,
      taker: window.ethereum.selectedAddress,
      status: TaskStatus.Finished
    };
  }
);

export const submitActivityTask = taskThunkProvider(
  {
    type: "aut-dashboard/activities/task/submit"
    // event: TasksContractEventType.TaskSubmitted
  },
  (thunkApi) => contractAddress(thunkApi, ActivityTypes.Tasks),
  async (contract, { task, values }) => {
    const metadata = {
      title: task.title,
      description: values.description
    };
    // const uri = await storeAsBlob(metadata);
    // await contract.submit(+task.activityId, uri);
    return {
      ...task,
      taker: window.ethereum.selectedAddress,
      status: TaskStatus.Submitted
    };
  }
);

export const addGroupCall = callThunkProvider(
  {
    type: "aut-dashboard/activities/group-call/add"
    // event: HubCallContractEventType.HubCallCreated
  },
  (thunkApi) => contractAddress(thunkApi, ActivityTypes.Gatherings),
  async (contract, callData, { getState, dispatch }) => {
    const state = getState();
    const {
      startDate,
      startTime,
      duration,
      allParticipants,
      participants,
      role
    } = callData;

    const hubs = state.hub.hubs as HubOSHub[];
    const hubAddress = state.hub.selectedHubAddress as string;
    // const hub = communities.find(
    //   (c) => c.properties.address === hubAddress
    // );
    // const selectedRole = hub.properties.rolesSets[0].roles.find(
    //   ({ roleName }) => roleName === role
    // );

    const startDatetime = new Date(startDate);
    const time = new Date(startTime);
    set(startDatetime, {
      hours: time.getHours(),
      minutes: time.getMinutes(),
      seconds: 0
    });

    const endDatetime = new Date(startDatetime);
    switch (duration) {
      case "15m":
        addMinutes(endDatetime, 15);
        break;
      case "30m":
        addMinutes(endDatetime, 30);
        break;
      case "45m":
        addMinutes(endDatetime, 45);
        break;
      default:
        addMinutes(endDatetime, 60);
    }

    const metadata = {
      startTime: dateToUnix(startDatetime),
      endTime: dateToUnix(endDatetime),
      duration,
      // roleId: selectedRole.id,
      allParticipants,
      participants
    };

    // const uri = await storeAsBlob(metadata);

    // const result = await contract.create(
    //   selectedRole.id,
    //   metadata.startTime,
    //   metadata.endTime,
    //   uri
    // );

    // const discordMessage: DiscordMessage = {
    //   title: "New Hub Call",
    //   // description: `${allParticipants ? "All" : participants} **${
    //   //   selectedRole.roleName
    //   // }** participants can join the call`,
    //   fields: [
    //     {
    //       name: "Date",
    //       value: format(startDatetime, "PPPP"),
    //       inline: true
    //     },
    //     {
    //       name: "Time",
    //       value: format(time, "hh:mm a"),
    //       inline: true
    //     },
    //     {
    //       name: "Duration",
    //       value: duration,
    //       inline: true
    //     }
    //   ]
    // };
    // await dispatch(sendDiscordNotification(discordMessage));
    // return result;
  }
);

export const publishPoll = (poll) => {
  return axios
    .post(`${environment.discordBotUrl}/poll`, poll)
    .then((res) => res);
};

export const addPoll = pollsThunkProvider(
  {
    type: "aut-dashboard/activities/poll/add"
    // event: PollsContractEventType.PollCreated
  },
  (thunkApi) => contractAddress(thunkApi, ActivityTypes.Polls),
  async (contract, callData, { getState }) => {
    const state = getState();
    const { title, description, duration, options, emojis, role, allRoles } =
      callData;
    const hubs = state.hub.hubs as HubOSHub[];
    const hubAddress = state.hub.selectedHubAddress as string;
    // const hub = communities.find(
    //   (c) => c.properties.address === hubAddress
    // );
    // const selectedRole = hub.properties.rolesSets[0].roles.find(
    //   ({ roleName }) => roleName === role
    // );
    // let roleId = 0;
    // let roleName = "All";
    // if (!allRoles) {
    //   roleId = selectedRole.id;
    //   roleName = selectedRole.roleName;
    // }

    // if (roleId === undefined || roleId === null) {
    //   throw new Error("RoleId missing!");
    // }

    // const metadata = {
    //   role: roleId,
    //   roleName,
    //   title,
    //   description,
    //   duration,
    //   options,
    //   emojis
    // };
    // const uri = await storeAsBlob(metadata);
    let daysToAdd = 0;
    switch (duration) {
      case "1d":
        daysToAdd = 1;
        break;
      case "1w":
        daysToAdd = 7;
        break;
      case "1m":
        daysToAdd = 30;
        break;
      default:
        daysToAdd = 1;
    }

    const date = new Date();
    const endTime = date.setDate(date.getDate() + daysToAdd);
    const endTimeBlock = Math.floor(endTime / 1000);
    // const result = await contract.create(roleId, endTimeBlock, uri);

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
    type: "aut-dashboard/activities/tasks/getall"
  },
  (thunkAPI: any) => contractAddress(thunkAPI, ActivityTypes.Tasks),
  async (contract, type: ActivityTypes) => {
    if (contract.contract.address === ethers.ZeroAddress) {
      return [];
    }
    // const activityIds = await contract.getActivitiesByType(type);
    // const tasks = [];

    // for (let i = 0; i < activityIds.length; i += 1) {
    //   const tokenCID = await contract.tokenURI(activityIds[i]);
    //   const response = await axios.get(tokenCID);
    //   const task: any = await contract.getTaskByActivityId(activityIds[i]);
    //   tasks.push({
    //     activityId: task.activityId.toString(),
    //     title: response.data.name,
    //     createdOn: task.createdOn.toString(),
    //     status: task.status,
    //     creator: task.creator.toString(),
    //     taker: task.taker.toString(),
    //     description: response.data.properties.description,
    //     isCoreTeamMembersOnly: response.data.properties.isCoreTeamMembersOnly,
    //   });
    // }

    // return tasks;
  }
);

export const getTaskById = taskThunkProvider(
  {
    type: "aut-dashboard/activities/tasks/get"
  },
  (thunkApi) => contractAddress(thunkApi, ActivityTypes.Tasks),
  async (contract, activityID: string, { getState }) => {
    const {
      auth: { userInfo },
      tasks: { tasks, selectedTask }
    } = getState();

    let task = selectedTask;

    if (selectedTask?.activityId === activityID) {
      task = {
        task: selectedTask,
        taker: selectedTask.owner
      };
    } else {
      task = null;
    }

    if (!task) {
      const existingTask: Task = tasks.find(
        (t: Task) => t.activityId === activityID
      );
      if (existingTask?.owner) {
        task = {
          task: existingTask,
          taker: existingTask.owner
        };
      } else if (
        existingTask?.taker?.toLowerCase() ===
        window.ethereum.selectedAddress?.toLowerCase()
      ) {
        task = {
          task: existingTask,
          taker: {
            tokenId: userInfo?.tokenId,
            imageUrl: userInfo?.imageUrl,
            nickname: userInfo?.nickname
          }
        };
      } else {
        task = null;
      }
    }

    if (task) {
      return task;
    }

    const tokenCID = null;
    const response = await axios.get(tokenCID);
    task = await contract.getById(+activityID);
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
        isCoreTeamMembersOnly: response.data.properties.isCoreTeamMembersOnly
      }
    };

    if (taskDetails.task.status > 0) {
      const autContract = null;
      const takerTokenId = await autContract.getAutIdByOwner(
        taskDetails.task.taker
      );
      const jsonUriCID = await autContract.tokenURI(takerTokenId);
      const response = await axios.get(ipfsCIDToHttpUrl(jsonUriCID, true));
      taskDetails.taker = {
        tokenId: takerTokenId.toString(),
        imageUrl: response.data.image,
        nickname: response.data.properties.username,
        timestamp: undefined
      };
    }
    return taskDetails;
  }
);
