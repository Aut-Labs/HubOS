import { envionmentGenerator } from "@utils/env";

export enum EnvMode {
  Production = "production",
  Development = "development"
}

export const swEnvVariables = {
  // app config
  env: "VITE_NODE_ENV",
  graphApiUrl: "VITE_GRAPH_API_URL",
  apiUrl: "VITE_API_URL",
  networkEnv: "VITE_NETWORK_ENV",
  defaultChainId: "VITE_DEFAULT_CHAIN_ID",

  // IPFS storage
  ipfsApiKey: "VITE_IPFS_API_KEY",
  ipfsApiSecret: "VITE_IPFS_API_SECRET",
  ipfsGatewayUrl: "VITE_IPFS_GATEWAY_URL",

  // discord
  discordClientId: "VITE_DISCORD_CLIENT_ID",
  discordClientSecret: "VITE_DISCORD_CLIENT_SECRET",
  discordGrandType: "VITE_DISCORD_GRAND_TYPE",
  discordRedirectUri: "VITE_DISCORD_REDIRECT_URL",
  discordApiUrl: "VITE_DISCORD_API_URL",
  discordBotAddress: "VITE_DISCORD_BOT_ADDRESS",
  discordBotUrl: "VITE_DISCORD_BOT_API_URL",

  twitterClientId: "VITE_TWITTER_CLIENT_ID",
  githubClientId: "VITE_GITHUB_CLIENT_ID"
};

export const environment: typeof swEnvVariables =
  envionmentGenerator(swEnvVariables);

export const autUrls = () => {
  if (environment.env === EnvMode.Development) {
    return {
      tryAut: "https://try-internal.aut.id/",
      hubDashboard: "https://hub-internal.aut.id/",
      myAut: "https://my-internal.aut.id/",
      showcase: "https://showcase-internal.aut.id/",
      leaderboard: "https://leaderboard-internal.aut.id/",
      expander: "https://expander-internal.aut.id/"
    };
  }

  return {
    tryAut: "https://try.aut.id/",
    hubDashboard: "https://hub.aut.id/",
    myAut: "https://my.aut.id/",
    showcase: "https://showcase.aut.id/",
    leaderboard: "https://leaderboard.aut.id/",
    expander: "https://expander.aut.id/"
  };
};
