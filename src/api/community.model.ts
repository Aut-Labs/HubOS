import { Role, RoleSet } from "./api.model";
import { ReactComponent as OpenSource } from "@assets/icons/opensource.svg";
import { ReactComponent as Defi } from "@assets/icons/defi.svg";
import { ReactComponent as Social } from "@assets/icons/social.svg";
import { ReactComponent as Refi } from "@assets/icons/refi.svg";
import { ReactComponent as Identity } from "@assets/icons/identity.svg";

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

export const findRoleName = (roleId: string, rolesSets: RoleSet[]) => {
  const roleSet = (rolesSets || []).find((s) =>
    s.roles.some((r) => r.id.toString() === roleId)
  );
  if (roleSet) {
    const role = roleSet?.roles.find((r) => r.id.toString() === roleId);
    return role?.roleName;
  }
};

export interface CommunityDomains {
  note: string;
  domain: string;
}

export const DefaultRoles: Role[] = [
  {
    id: 4,
    roleName: "Core Team"
  },
  {
    id: 5,
    roleName: "Advisor"
  },
  {
    id: 6,
    roleName: "Investor"
  }
];
