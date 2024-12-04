import { AsyncThunk, createAsyncThunk } from "@reduxjs/toolkit";
import { ParseSWErrorMessage } from "@utils/error-parser";
import { updateTransactionState } from "@store/ui-reducer";
import { EnableAndChangeNetwork } from "./web3.network";
// import {
//   BaseThunkArgs,
//   ThunkArgs,
//   GetThunkAPI,
//   AsyncThunkConfig,
//   ProviderEvent,
//   AsyncThunkPayloadCreator
// } from "./web3.thunk.type";

const DefaultProviders = {
  updateTransactionStateAction: (state: string, dispatch) => {
    dispatch(updateTransactionState(state));
  }
};

export const Web3ThunkProviderFactory = <
  SWContractFunctions = any,
  SWContractEventTypes = any
>(
  type: string,
  stateActions: any
) => {
  return <Returned, ThunkArg = any>(
    args: any,
    contractAddress: (thunkAPI: any) => Promise<string>,
    thunk: any
  ): AsyncThunk<Returned, ThunkArg, any> => {
    stateActions = {
      ...DefaultProviders,
      ...stateActions
    };
    const typeName = `[${type}] ${args.type}`;
    return createAsyncThunk<Returned, ThunkArg, any>(
      typeName,
      // @ts-ignore
      async (arg, thunkAPI) => {
        try {
          const addressOrName =
            // @ts-ignore
            (await contractAddress(thunkAPI)) || (args as any)?.addressOrName;
          if (!addressOrName) {
            throw new Error(`Could not find addressOrName for ${type}`);
          }
          const contractProvider = await stateActions.provider(addressOrName, {
            event: (args as any).event,
            // @ts-ignore
            beforeRequest: () => EnableAndChangeNetwork(),
            transactionState: (state) => {
              if (stateActions.updateTransactionStateAction) {
                stateActions.updateTransactionStateAction(
                  state,
                  thunkAPI.dispatch
                );
              }
            }
          });
          // @ts-ignore
          return await thunk(contractProvider, arg, thunkAPI);
        } catch (error) {
          console.error(error);
          const message = ParseSWErrorMessage(error);
          if (stateActions.updateErrorStateAction) {
            stateActions.updateErrorStateAction(message, thunkAPI.dispatch);
          }
          return thunkAPI.rejectWithValue(message);
        }
      }
    );
  };
};
