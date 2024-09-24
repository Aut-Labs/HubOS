import { NetworkConfig } from "@api/ProviderFactory/network.config";
import { createSelector, createSlice } from "@reduxjs/toolkit";

export interface WalletProviderState {
  selectedNetwork: NetworkConfig;
  networksConfig: NetworkConfig[];
}

const initialState: WalletProviderState = {
  selectedNetwork: null,
  networksConfig: []
};

export const walletProviderSlice = createSlice({
  name: "walletProvider",
  initialState,
  reducers: {
    updateWalletProviderState(state, action) {
      Object.keys(action.payload).forEach((key: string) => {
        state[key] = action.payload[key];
      });
    },
    resetWalletProviderState: () => initialState
  }
});

export const { updateWalletProviderState } = walletProviderSlice.actions;

export const NetworksConfig = (state: any) =>
  state.walletProvider.networksConfig as NetworkConfig[];

export const selectedNetwork = (state: any) =>
  state.walletProvider.selectedNetwork as NetworkConfig;
export const SelectedNetwork = createSelector([selectedNetwork], (a) => a);

export const BlockExplorerUrl = createSelector(SelectedNetwork, (config) => {
  if (config) {
    return config.explorerUrls[0];
  }
});

export default walletProviderSlice.reducer;
