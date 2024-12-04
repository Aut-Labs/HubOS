import {
  DiscordMessage,
  DiscordPollInput,
  MessageEmbed,
  postDiscordNotification as sendNotification,
  postDiscordPoll
} from "@api/discord.api";
import { DAutHub } from "@aut-labs/d-aut";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const sendDiscordNotification = createAsyncThunk(
  "discord/notification",
  async (message: DiscordMessage, { dispatch, getState }) => {
    try {
      const state: any = getState();
      const communities = state.hub.communities as DAutHub[];
      const hubAddress = state.hub
        .selectedHubAddress as string;
      const hub = communities.find(
        (c) => c.properties.address === hubAddress
      );
      const { userInfo } = state.auth;
      const discordMsg = new MessageEmbed({
        author: {
          name: userInfo.nickname,
          image: userInfo.imageUrl
        },
        message,
        footer: {
          text: `${hub.name}@Āut`,
          image: hub.image as string
        }
      });
      // return await sendNotification(hub.discordWebhookUrl, discordMsg);
    } catch (error) {
      const message = "Could not send notification to discord";

      dispatch(openSnackbar({ message, severity: "error" }));
    }
  }
);

export const sendDiscordPoll = createAsyncThunk(
  "discord/poll",
  async (input: DiscordPollInput, { dispatch, getState }) => {
    try {
      const state = getState() as any;
      const communities = state.hub.communities as DAutHub[];
      const hubAddress = state.hub
        .selectedHubAddress as string;
      const hub = communities.find(
        (c) => c.properties.address === hubAddress
      );
      const { userInfo } = state.auth;

      const discordMsg = new MessageEmbed({
        author: {
          name: userInfo.nickname,
          image: userInfo.imageUrl
        },
        message: input.message,
        footer: {
          text: `${hub.name}@Āut`,
          image: hub.image as string
        }
      });
      return await postDiscordPoll("https://dev-api.olympics.hub/poll", {
        input: discordMsg,
        emojis: input.emojis,
        activitiesContractAddress: input.activitiesContractAddress,
        activitiesId: input.activitiesId
      });
    } catch (error) {
      const message = "Could not send notification to discord";

      dispatch(openSnackbar({ message, severity: "error" }));
    }
  }
);

const initialState = {
  snackbar: {
    open: false,
    message: "",
    severity: "success",
    duration: 2000
  },
  logs: [],
  previousRoute: "/",
  transactionState: null,
  title: ""
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    addLog(state, action) {
      if (Array.isArray(action.payload)) {
        state.logs = [...state.logs, ...action.payload];
      } else {
        state.logs.push(action.payload);
      }
    },
    openSnackbar(state, action) {
      state.snackbar.open = true;
      state.snackbar.message = action.payload.message;
      state.snackbar.severity = action.payload.severity || "success";
      state.snackbar.duration = action.payload.duration || 4000;
    },
    closeSnackbar(state) {
      state.snackbar = {
        ...state.snackbar,
        open: false
      };
    },
    updateTransactionState(state, action) {
      state.transactionState = action.payload;
    },
    setTitle(state, action) {
      state.title = action.payload;
    },
    setPreviusRoute(state, action) {
      state.previousRoute = action.payload;
    },
    resetUIState: () => initialState
  }
});

export const {
  openSnackbar,
  closeSnackbar,
  setTitle,
  addLog,
  setPreviusRoute,
  updateTransactionState
} = uiSlice.actions;

export const AppTitle = (state) => state.ui.title as string;

export default uiSlice.reducer;
