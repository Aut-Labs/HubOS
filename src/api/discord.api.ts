import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Community } from "./community.model";
import { environment } from "./environment";
import { AutID } from "./aut.model";
import { createApi } from "@reduxjs/toolkit/dist/query/react";
import AutSDK, { PluginDefinition, SocialBotRegistry } from "@aut-labs/sdk";
import { addMinutes, set } from "date-fns";
import { dateToUnix } from "@utils/date-format";
import { PluginDefinitionType } from "@aut-labs/sdk/dist/models/plugin";

export interface TaskData {
  role: string;
  description: string;
  name: string;
}

export interface GuildVerificationData {
  accessToken: string;
  guildId: string;
}

export interface ClaimRoleData {
  accessToken: string;
  daoAddress: string;
  autId: AutID;
}

export const oauthGetToken = (code: string) => {
  const params = new URLSearchParams();
  params.append("client_id", environment.discordClientId);
  params.append("client_secret", environment.discordClientSecret);
  params.append("grant_type", "authorization_code");
  params.append("redirect_uri", environment.discordRedirectUri);
  params.append("scope", "identify");
  params.append("code", code);
  return fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: params
  })
    .then((response) => response.json())
    .then((data) => data.access_token);
};

export const getUser = (accessToken: string) => {
  return axios
    .get(`${environment.discordApiUrl}/users/@me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    .then((res) => res.data);
};

export const getServerDetails = (inviteLink: string) => {
  const serverCode = inviteLink.match(/discord\.gg\/(.+)/i)[1];
  return axios
    .get(`https://discord.com/api/invites/${serverCode}`)
    .then((res) => res.data);
};

export const getUserGuilds = (accessToken: string) => {
  return axios
    .get(`${environment.discordApiUrl}/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    .then((res) => res.data);
};

export const verifyDiscordServerOwnership = createAsyncThunk(
  "discord/verify",
  async (
    guildVerificationData: GuildVerificationData,
    { rejectWithValue, getState }
  ) => {
    const guilds = await getUserGuilds(guildVerificationData.accessToken);
    const guild = guilds.find((g) => g.id === guildVerificationData.guildId);
    const isAdmin = guild && (guild.permissions & 0x8) === 0x8;
    if (!isAdmin) {
      return rejectWithValue("User is not an admin.");
    }
    return true;
  }
);

//
export const claimDiscordServerRole = createAsyncThunk(
  "discord/getRole",
  async (claimRoleData: ClaimRoleData, { rejectWithValue, getState }) => {
    try {
      const result = await axios
        .post(`${environment.discordBotUrl}/guilds/getRole`, claimRoleData)
        .then((res) => res.data);
    } catch (e) {
      return rejectWithValue(`Fail. ${e}`);
    }
    return true;
  }
);

export interface DiscordMessageInputField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordPollMessage {
  input: MessageEmbed;
  emojis: string[];
  activitiesContractAddress: string;
  activitiesId: number;
}

export interface DiscordPollInput {
  message: DiscordMessage;
  emojis: string[];
  activitiesContractAddress: string;
  activitiesId: number;
}

export interface DiscordMessage {
  title: string;
  url?: string;
  description: string;
  color?: string;
  fields?: DiscordMessageInputField[];
  image?: string;
}

export enum DiscordMessageType {
  Notification,
  Poll
}
export class MessageEmbed {
  author: {
    name: string;
    image: string;
  };

  message: DiscordMessage;

  footer: {
    text: string;
    image: string;
  };

  constructor(data: MessageEmbed) {
    this.author = data.author;
    this.footer = data.footer;
    this.message = data.message;
  }
}

export const postDiscordNotification = (
  webhookUrl: string,
  input: MessageEmbed
) => {
  const { footer, author, message } = input;
  return axios
    .post(webhookUrl, {
      embeds: [
        {
          ...message,
          author: {
            name: author.name,
            icon_url: author.image
          },
          footer: {
            text: footer.text,
            icon_url: footer.image
          }
        }
      ]
    })
    .then((res) => res.data);
};

export const postDiscordPoll = (
  webhookUrl: string,
  { input, emojis, activitiesContractAddress, activitiesId }: DiscordPollMessage
) => {
  const { footer, author, message } = input;
  return axios
    .post(webhookUrl, {
      message: {
        ...message,
        author: {
          name: author.name,
          icon_url: author.image
        },
        footer: {
          text: footer.text,
          icon_url: footer.image
        }
      },
      emojis,
      activitiesContractAddress,
      activitiesId
    })
    .then((res) => res.data);
};

const getVoiceChannels = async (body: any, api: any) => {
  try {
    const channels = await axios.get(
      `${environment.discordBotUrl}/guilds/voiceChannels/${body.guildId}`
    );
    return {
      data: channels.data
    };
  } catch (error) {
    return {
      error
    };
  }
};

const getTextChannels = async (body: any, api: any) => {
  try {
    const channels = await axios.get(
      `${environment.discordBotUrl}/guilds/textChannels/${body}`
    );
    return {
      data: channels.data
    };
  } catch (error) {
    return {
      error
    };
  }
};

const getGatherings = async (body: any, api: any) => {
  try {
    const gatherings = await axios.get(
      `${environment.discordBotUrl}/gatherings/${body}`
    );
    return {
      data: gatherings.data
    };
  } catch (error) {
    return {
      error
    };
  }
};

const getPolls = async (body: any, api: any) => {
  try {
    const polls = await axios.get(`${environment.discordBotUrl}/polls/${body}`);
    return {
      data: polls.data
    };
  } catch (error) {
    return {
      error
    };
  }
};

const createGathering = async (body: any, api: any) => {
  const endDate = new Date();
  //add 15 minutes to date
  endDate.setTime(
    new Date(body.startDate).getTime() + body.duration * 60 * 1000
  );
  body.endDate = endDate;
  body.roles = [body.role];

  try {
    const result = await axios.post(
      `${environment.discordBotUrl}/gatherings`,
      body
    );
    return {
      data: null
    };
  } catch (error) {
    return {
      error
    };
  }
};

const getGuildId = async (body: any, api: any) => {
  const { community } = api.getState();
  const selectedCommunity = community.communities.find(
    (c: Community) =>
      c.properties.address === community.selectedCommunityAddress
  );
  const discordLink = selectedCommunity?.properties.socials.find(
    (l) => l.type === "discord"
  ).link;
  const serverCode = discordLink.match(/discord\.gg\/(.+)/i)[1];

  try {
    const serverIdResponse = await axios.get(
      `https://discord.com/api/invites/${serverCode}`
    );
    const guildId = serverIdResponse.data.guild.id;
    return {
      data: guildId
    };
  } catch (error) {
    return {
      error
    };
  }
};

const activateDiscordBotPlugin = async (body: any, api: any) => {
  const state = api.getState();
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const addressResult = await axios.get(`${environment.discordBotUrl}/address`);
  //check admins list
  const sdk = AutSDK.getInstance();
  try {
    const result = await sdk.daoExpander.addAdmin(addressResult.data.address);
    if (result.isSuccess) {
      // return {
      //   data: null
      // };
      const sdk = AutSDK.getInstance();
      const pluginData =
        state.pluginRegistryApi.queries["getAllPluginDefinitionsByDAO(null)"];
      const plugin: PluginDefinition = pluginData.find(
        (d: PluginDefinition) =>
          d.pluginDefinitionId === PluginDefinitionType.SocialBotPlugin
      );
    } else {
      return { error: result.errorMessage };
    }
  } catch (error) {
    return { error };
  }
};

// const checkIfBotIsActive = async (body: any, api: any) => {
//   const botActiveRequest = await axios.get(
//     `${environment.discordBotUrl}/check/${body.guildId}`
//   );
//   return {
//     data: true
//   };
// };

export const createPoll = async (body: any, api: any) => {
  const state = api.getState();
  const { options, title, description, channelId } = state.poll.pollData;
  // const { community } = state.community;
  const { guildId, duration, allParticipants, participants, role } = body;

  try {
    // const optionsMapped = options.map((o) => {
    //   const { option, emoji } = o;
    //   //cut the emoji string from option string
    //   const optionWithoutEmoji = option.replace(emoji, "");
    //   return {
    //     option: optionWithoutEmoji.trim(),
    //     emoji
    //   };
    // });

    // const communities = community.communities as Community[];
    // const communityAddress = community.selectedCommunityAddress as string;
    // const community = communities.find(
    //   (c) => c.properties.address === communityAddress
    // );
    // const selectedRole = community.properties.rolesSets[0].roles.find(
    //   ({ roleName }) => roleName === role
    // );

    const startDate = new Date();
    startDate.setSeconds(0);
    // set(startDatetime, {
    //   hours: time.getHours(),
    //   minutes: time.getMinutes(),
    //   seconds: 0
    // });

    const endDate = new Date(startDate);
    addMinutes(endDate, 1);
    // switch (duration) {
    //   case "15m":
    //     addMinutes(endDate, 15);
    //     break;
    //   case "30m":
    //     addMinutes(endDate, 30);
    //     break;
    //   case "45m":
    //     addMinutes(endDate, 45);
    //     break;
    //   default:
    //     addMinutes(endDate, 60);
    // }
    //add option for multiple roles
    const pollRequestModel = {
      guildId,
      startDate,
      channelId,
      endDate,
      roles: [role],
      allCanAttend: allParticipants,
      options,
      title,
      description
    };

    const result = await axios.post(
      `${environment.discordBotUrl}/poll`,
      pollRequestModel
    );
    // const uri = await storeAsBlob(metadata);

    // const result = await contract.create(
    //   selectedRole.id,
    //   metadata.startTime,
    //   metadata.endTime,
    //   uri
    // );

    // const discordMessage: DiscordMessage = {
    //   title: "New Community Call",
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
    return {
      data: true
    };
  } catch (e) {
    return {
      error: e
    };
  }
};

export const publishPoll = (poll) => {
  return axios
    .post(`${environment.discordBotUrl}/poll`, poll)
    .then((res) => res);
};

export const checkBotActive = async (body: any, api: any) => {
  try {
    const botActiveRequest = await axios.get(
      `${environment.discordBotUrl}/guilds/check/${body}`
    );
    const botActive = botActiveRequest.data.active;
    return {
      data: botActive
    };
  } catch (error) {
    return {
      error
    };
  }
};

export const activateDiscordBot = async (body: any, api: any) => {
  try {
    const state = api.getState();

    const daoAddress = state?.community?.selectedCommunityAddress;
    const daoData = state?.community.communities.find(
      (c) => c.properties.address === daoAddress || new Community()
    );
    const { serverId: guildId } = daoData.properties.socials.find(
      (s) => s.type === "discord"
    ).metadata;
    debugger;
    const apiUrl = `${environment.discordBotUrl}/guilds`;
    const roles = daoData?.properties.rolesSets[0].roles.map((role) => {
      return { name: role.roleName, id: role.id };
    });
    const requestObject = {
      daoAddress,
      roles: roles,
      guildId
    };
    await axios.post(apiUrl, requestObject);
    const discordBotLink =
      "https://discord.com/api/oauth2/authorize?client_id=1129037421615529984&permissions=8&scope=bot%20applications.commands";
    window.open(discordBotLink, "_blank");
    // setLoading(true);
    // let count = 0;
    const isActive = await new Promise((resolve, reject) => {
      let intervalRef;
      let timeoutCount = 0;
      try {
        intervalRef = setInterval(async () => {
          if (timeoutCount > 10) {
            reject("Timeout");
          }
          const botActiveRequest = await axios.get(
            `${environment.discordBotUrl}/guilds/check/${guildId}`
          );
          const botActive = botActiveRequest.data.active;
          if (botActive) {
            // setLoading(false);
            // setBotActive(botActive);
            clearInterval(intervalRef);
            debugger;
            resolve(botActive);
          }

          timeoutCount++;
        }, 2000);
      } catch (e) {
        clearInterval(intervalRef);
        reject(e);
      }
    });
    debugger;
    return {
      data: isActive
    };
  } catch (error) {
    debugger;
    return {
      error
    };
  }
};

export const botApi = createApi({
  reducerPath: "botApi",
  baseQuery: async (args, api, extraOptions) => {
    const { url, body } = args;
    if (url === "getTextChannels") {
      return getTextChannels(body, api);
    }
    if (url === "getVoiceChannels") {
      return getVoiceChannels(body, api);
    }
    if (url === "createGathering") {
      return createGathering(body, api);
    }
    if (url === "getGatherings") {
      return getGatherings(body, api);
    }
    if (url === "getPolls") {
      return getPolls(body, api);
    }
    if (url === "getGuildId") {
      return getGuildId(body, api);
    }
    if (url === "activateDiscordBotPlugin") {
      return activateDiscordBotPlugin(body, api);
    }
    if (url === "createPoll") {
      return createPoll(body, api);
    }
    if (url === "activateDiscordBot") {
      debugger;
      return activateDiscordBot(body, api);
    }
    if (url === "checkBotActive") {
      return checkBotActive(body, api);
    }
    return {
      data: "Test"
    };
  },
  tagTypes: ["Discord", "Gatherings", "Polls", "Guild", "BotActive"],
  endpoints: (builder) => ({
    activateDiscordBotPlugin: builder.mutation<void, { moduleId: string }>({
      query: (body) => {
        return {
          body,
          url: "activateDiscordBotPlugin"
        };
      },
      invalidatesTags: []
    }),
    createGathering: builder.mutation({
      query: (body) => {
        return {
          body,
          url: "createGathering"
        };
      },
      invalidatesTags: ["Gatherings"]
    }),
    createPoll: builder.mutation({
      query: (body) => {
        return {
          body,
          url: "createPoll"
        };
      },
      invalidatesTags: ["Polls"]
    }),
    activateDiscordBot: builder.mutation<{ isActive: boolean }, any>({
      query: (body) => {
        return {
          body,
          url: "activateDiscordBot"
        };
      },
      invalidatesTags: ["BotActive"]
    }),
    getGuildId: builder.query<{ guildId: string }, void>({
      query: (body) => {
        return {
          body,
          url: "getGuildId"
        };
      },
      providesTags: ["Guild"]
    }),
    getTextChannels: builder.query<
      [{ id: string; name: string }],
      { guildId: string }
    >({
      query: (body) => {
        return {
          body,
          url: "getTextChannels"
        };
      },
      providesTags: ["Discord"]
    }),
    getVoiceChannels: builder.query<
      [{ id: string; name: string }],
      { guildId: string }
    >({
      query: (body) => {
        return {
          body,
          url: "getVoiceChannels"
        };
      },
      providesTags: ["Discord"]
    }),
    getGatherings: builder.query<
      [{ title: string; description: string; duration: string; roles: string }],
      { guildId: string }
    >({
      query: (body) => {
        return {
          body,
          url: "getGatherings"
        };
      },
      providesTags: ["Gatherings"]
    }),
    getPolls: builder.query<
      [{ title: string; description: string; endDate: string; roles: string }],
      { guildId: string }
    >({
      query: (body) => {
        return {
          body,
          url: "getPolls"
        };
      },
      providesTags: ["Polls"]
    }),
    checkBotActive: builder.query<{ active: boolean }, { guildId: string }>({
      query: (body) => {
        return {
          body,
          url: "checkBotActive"
        };
      },
      providesTags: ["BotActive"]
    })
  })
});

export const {
  useCreatePollMutation,
  useActivateDiscordBotPluginMutation,
  useCreateGatheringMutation,
  useGetVoiceChannelsQuery,
  useGetTextChannelsQuery,
  useGetGatheringsQuery,
  useGetPollsQuery,
  useGetGuildIdQuery,
  useCheckBotActiveQuery,
  useActivateDiscordBotMutation
} = botApi;
