import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Community } from "./community.model";
import { environment } from "./environment";
import { AutID } from "./aut.model";
import { createApi } from "@reduxjs/toolkit/dist/query/react";

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
        .post(`http://localhost:4006/getRole`, claimRoleData)
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

const getChannels = async (body: any, api: any) => {
  const channels = await axios.get(
    `http://localhost:4006/guild/channels/${body.guildId}`
  );
  return {
    data: channels.data
  };
};

const getGatherings = async (body: any, api: any) => {
  const gatherings = await axios.get(
    `http://localhost:4006/gatherings/${body}`
  );
  return {
    data: gatherings.data
  };
};

const createGathering = async (body: any, api: any) => {
  const endDate = new Date();
  //add 15 minutes to date
  endDate.setTime(
    new Date(body.startDate).getTime() + body.duration * 60 * 1000
  );
  body.endDate = endDate;
  body.roles = [body.role];
  const result = await axios.post(`http://localhost:4006/gathering`, body);
  return {
    data: null
  };
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
  const serverIdResponse = await axios.get(
    `https://discord.com/api/invites/${serverCode}`
  );
  const guildId = serverIdResponse.data.guild.id;
  return {
    data: guildId
  };
};

export const botApi = createApi({
  reducerPath: "botApi",
  baseQuery: async (args, api, extraOptions) => {
    const { url, body } = args;
    if (url === "getChannels") {
      return getChannels(body, api);
    }
    if (url === "createGathering") {
      return createGathering(body, api);
    }
    if (url === "getGatherings") {
      return getGatherings(body, api);
    }
    if (url === "getGuildId") {
      return getGuildId(body, api);
    }
    return {
      data: "Test"
    };
  },
  tagTypes: ["Discord", "Gatherings", "Guild"],
  endpoints: (builder) => ({
    createGathering: builder.mutation({
      query: (body) => {
        return {
          body,
          url: "createGathering"
        };
      },
      invalidatesTags: []
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
    getChannels: builder.query<
      [{ id: string; name: string }],
      { guildId: string }
    >({
      query: (body) => {
        return {
          body,
          url: "getChannels"
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
    })
  })
});

export const {
  useCreateGatheringMutation,
  useGetChannelsQuery,
  useGetGatheringsQuery,
  useGetGuildIdQuery
} = botApi;
