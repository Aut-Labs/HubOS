import { AutSocial } from "./api.model";

export const socialUrls = {
  discord: {
    hidePrefix: true,
    placeholder: "inviteLInk",
    prefix: ""
  },
  ens: {
    prefix: "",
    placeholder: ""
  },
  twitter: {
    prefix: "",
    placeholder: ""
  },
  github: {
    prefix: "",
    placeholder: ""
  }
};

export const DefaultSocials: AutSocial[] = [
  {
    type: "discord",
    link: "",
    metadata: {}
  },
  {
    type: "ens",
    link: "",
    metadata: {}
  },
  {
    type: "twitter",
    link: "",
    metadata: {}
  },
  {
    type: "github",
    link: "",
    metadata: {}
  }
];
