import { addPoll } from '@api/activities.api';
import { createSlice } from '@reduxjs/toolkit';
import { ResultState } from '@store/result-status';

export interface PollState {
  status: ResultState;
  errorMessage: string;
  pollData: {
    title: string;
    description: string;
    options: any[];
    duration: string;
    role: string;
    allRoles: boolean;
  };
}

const initialState: PollState = {
  status: ResultState.Idle,
  errorMessage: '',
  pollData: {
    title: '',
    description: '',
    duration: '',
    options: [
      {
        option: '',
        emoji: null,
      },
      {
        option: '',
        emoji: null,
      },
    ],
    role: null,
    allRoles: null,
  },
};

export const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    pollUpdateData(state, action) {
      state.pollData = {
        ...state.pollData,
        ...action.payload,
      };
    },
    pollUpdateStatus(state, action) {
      state.status = action.payload;
    },
    resetPollState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(addPoll.pending, (state) => {
        state.status = ResultState.Updating;
      })
      .addCase(addPoll.fulfilled, (state) => {
        state.status = ResultState.Idle;
      })
      .addCase(addPoll.rejected, (state, action) => {
        state.status = ResultState.Failed;
        state.errorMessage = action.payload as string;
      });
  },
});

export const { pollUpdateData, pollUpdateStatus, resetPollState } = pollSlice.actions;

export const CreatePollStatus = (state: any) => state.poll.status as ResultState;
export const CreatePollError = (state: any) => state.poll.errorMessage as string;
export const CreatePollData = (state: any) => state.poll.pollData as typeof initialState.pollData;

export default pollSlice.reducer;
