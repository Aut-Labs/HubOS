import { BaseNFTModel } from './api.model';
import { Community } from './community.model';
import { ipfsCIDToHttpUrl } from './textile.api';

export class AutIDProperties {
  avatar: string;

  communities: Community[];

  timestamp: string;

  tokenId: string;

  address: string;

  role?: string;

  roleName?: string;

  commitment?: string;

  commitmentDescription?: string;

  isCoreTeam?: boolean;

  constructor(data: AutIDProperties) {
    if (!data) {
      this.communities = [];
    } else {
      this.timestamp = data.timestamp;
      this.avatar = ipfsCIDToHttpUrl(data.avatar);
      this.communities = (data.communities || []).map((community) => new Community(community));
      this.address = data.address;
      this.role = data.role;
      this.roleName = data.roleName;
      this.commitment = data.commitment;
      this.commitmentDescription = data.commitmentDescription;
      this.isCoreTeam = data.isCoreTeam;
    }
  }
}

export class AutID extends BaseNFTModel<AutIDProperties> {
  constructor(data: AutID = {} as AutID) {
    super(data);
    this.properties = new AutIDProperties(data.properties);
  }
}
