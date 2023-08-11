import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import {
  Chain,
  ChainProviderFn,
  WagmiConfig,
  configureChains,
  createConfig
} from "wagmi";
import { NetworkConfig } from "@api/ProviderFactory/network.config";
import { polygonMumbai } from "viem/dist/types/chains";

export const generateNetworkConfig = (network: NetworkConfig) => {
  const networkDefinition = {
    id: network.chainId,
    name: network.name,
    network: network.network,
    rpcUrls: {
      alchemy: {
        http: ["https://polygon-mumbai.g.alchemy.com/v2"]
      },
      default: {
        http: network.rpcUrls
      },
      public: {
        http: network.rpcUrls
      }
    },
    blockExplorers: {
      etherscan: {
        name: network.name,
        url: network.explorerUrls[0]
      },
      default: {
        name: network.name,
        url: network.explorerUrls[0]
      }
    },
    testnet: true
  };

  const ankrRPCUrls = {
    [networkDefinition.id]: network.rpcUrls
  };
  function publicProviderANKR<
    TChain extends Chain = Chain
  >(): ChainProviderFn<TChain> {
    return function (chain) {
      if (!ankrRPCUrls[chain.id]) return null;

      return {
        chain: chain as TChain,
        rpcUrls: { http: ankrRPCUrls[chain.id] }
      };
    };
  }

  const { chains, publicClient, webSocketPublicClient } = configureChains(
    [networkDefinition as any],
    [
      alchemyProvider({ apiKey: "G742dEaaWF0gE-SL0IlEFAJdlA_l7ezJ" }),
      publicProviderANKR(),
      jsonRpcProvider({
        rpc: (chain) => ({ http: chain.rpcUrls.alchemy.http[0] })
      })
    ]
  );

  const wagmiConfig = createConfig({
    autoConnect: true,
    logger: {
      warn: console.warn
    },
    connectors: [
      new MetaMaskConnector({
        chains
      }),
      new WalletConnectConnector({
        chains,
        options: {
          projectId: "938429658f5e53a8eaf88dc70e4a8367",
          qrModalOptions: {
            themeVariables: {
              // @ts-ignore
              "--wcm-z-index": 9999
            }
          }
        }
      })
    ],
    publicClient,
    webSocketPublicClient
  });

  return wagmiConfig;
};
