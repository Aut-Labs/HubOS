import { MarketTemplates } from '@utils/misc';
import { BaseNFTModel, Role, RoleSet } from './api.model';

export const findRoleName = (roleId: string, rolesSets: RoleSet[]) => {
  const roleSet = rolesSets.find((s) => s.roles.some((r) => r.id.toString() === roleId));
  if (roleSet) {
    const role = roleSet?.roles.find((r) => r.id.toString() === roleId);
    return role?.roleName;
  }
};

export class CommunityProperties {
  market: number | string;

  rolesSets: RoleSet[];

  commitment: number;

  address?: string;

  isCoreTeam?: boolean;

  userData?: {
    role: string;
    roleName: string;
    commitment: string;
  };

  constructor(data: CommunityProperties) {
    if (!data) {
      this.rolesSets = [];
    } else {
      this.market = MarketTemplates[data.market]?.title;
      this.commitment = data.commitment;
      this.rolesSets = data.rolesSets;
      this.address = data.address;
      this.isCoreTeam = data.isCoreTeam;
      this.userData = data.userData || ({} as typeof this.userData);

      if (this.userData?.role) {
        this.userData.roleName = findRoleName(this.userData.role, this.rolesSets);
      }
    }
  }
}

export class Community extends BaseNFTModel<CommunityProperties> {
  constructor(data: Community = {} as Community) {
    super(data);
    this.properties = new CommunityProperties(data.properties);
  }
}

export const DefaultRoles: Role[] = [
  {
    id: 4,
    roleName: 'Core Team',
  },
  {
    id: 5,
    roleName: 'Advisor',
  },
  {
    id: 6,
    roleName: 'Investor',
  },
];
