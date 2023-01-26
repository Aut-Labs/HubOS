import { NetworkConfig } from "@api/ProviderFactory/network.config";
import { createSelector, createSlice } from "@reduxjs/toolkit";
import { ethers } from "ethers";

export enum ConnectorTypes {
  WalletConnect = "walletConnect",
  Metamask = "metamask"
}

export interface WalletProviderState {
  signer: ethers.providers.JsonRpcSigner;
  selectedWalletType: "injected" | "walletConnect";
  selectedNetwork: string;
  networksConfig: NetworkConfig[];
  isOpen: boolean;
  wallets: any;
}

const initialState: WalletProviderState = {
  signer: null,
  selectedWalletType: null,
  selectedNetwork: null,
  isOpen: false,
  networksConfig: [],
  wallets: {}
};

export const walletProviderSlice = createSlice({
  name: "walletProvider",
  initialState,
  reducers: {
    setSigner(state, action) {
      state.signer = action.payload;
    },
    setWallet(state, action) {
      state.selectedWalletType = action.payload;
    },
    setProviderIsOpen(state, action) {
      state.isOpen = action.payload;
    },
    setNetwork(state, action) {
      state.selectedNetwork = action.payload as string;
    },
    setNetworks(state, action) {
      state.networksConfig = action.payload;
    },
    resetWalletProviderState: () => initialState
  }
});

export const {
  setSigner,
  setWallet,
  setNetwork,
  setNetworks,
  setProviderIsOpen
} = walletProviderSlice.actions;

export const NetworkSelectorIsOpen = (state: any) =>
  state.walletProvider.isOpen as boolean;
export const SelectedWalletType = (state: any) =>
  state.walletProvider.selectedWalletType as string;
export const NetworkSigner = (state: any) =>
  state.walletProvider.signer as ethers.providers.JsonRpcSigner;
export const NetworksConfig = (state: any) =>
  state.walletProvider.networksConfig as NetworkConfig[];
export const NetworkWalletConnectors = (state: any) =>
  state.walletProvider.wallets as any;
export const SelectedNetwork = (state: any) =>
  state.walletProvider.selectedNetwork as string;
export const SelectedNetworkConfig = createSelector(
  NetworksConfig,
  SelectedNetwork,
  (networks, networkName) => networks.find((r) => r.network === networkName)
);
export const NetworkConnector = (connectorName: string) =>
  createSelector(NetworkWalletConnectors, (x1) => x1[connectorName]);

export default walletProviderSlice.reducer;
