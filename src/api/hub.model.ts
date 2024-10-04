import { HubArchetype, Role } from "@aut-labs/sdk";
import { DAutHub, HubProperties as BaseHubProperties } from "@aut-labs/d-aut";
import OpenSource from "@assets/icons/opensource.svg?react";
import Defi from "@assets/icons/defi.svg?react";
import Social from "@assets/icons/social.svg?react";
import Refi from "@assets/icons/refi.svg?react";
import Identity from "@assets/icons/identity.svg?react";

const mockArchetype = {
  default: HubArchetype.SIZE,
  parameters: {
    archetype: HubArchetype.SIZE,
    size: Number(20),
    reputation: Number(20),
    conviction: Number(20),
    performance: Number(20),
    growth: Number(20)
  }
}

interface MarketTemplate {
  title: string;
  market: number;
  icon: any;
}

export const MarketTemplates = [
  {
    title: "Open-Source & Infra",
    market: 1,
    icon: OpenSource
  },
  {
    title: "DeFi & Payments",
    market: 2,
    icon: Defi
  },
  {
    title: "ReFi & Governance",
    market: 3,
    icon: Refi
  },
  {
    title: "Social, Art & Gaming",
    market: 4,
    icon: Social
  },
  {
    title: "Identity & Reputation",
    market: 5,
    icon: Identity
  }
];

export class HubProperties extends BaseHubProperties {
  metadataUri: string;

  constructor(data: HubProperties) {
    super(data);
    this.metadataUri = data.metadataUri;
    this.archetype = data.archetype || mockArchetype;
  }
}

export class HubOSHub<T = HubProperties> extends DAutHub<T> {
  constructor(data: HubOSHub<T> = {} as HubOSHub<T>) {
    super(data);
    this.properties = new HubProperties(data.properties as HubProperties) as T;
  }

  get roles(): Role[] {
    return (this.properties as HubProperties).rolesSets[0].roles;
  }

  get marketTemplate(): MarketTemplate {
    const markeId = +(this.properties as HubProperties).market;
    return MarketTemplates.find((template) => template.market === markeId);
  }

  roleName(roleId: number): string {
    return this.roles.find((role) => +role.id === +roleId)?.roleName || "";
  }
}
