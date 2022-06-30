import { BaseNFTModel } from "./api.model";
import { Community } from "./community.model";
import { ipfsCIDToHttpUrl } from "./textile.api";

export class AutIDProperties {
  avatar: string;

  communities: Community[];

  timestamp: string;

  constructor(data: AutIDProperties) {
    if (!data) {
      this.communities = [];
    } else {
      this.timestamp = data.timestamp;
      this.avatar = ipfsCIDToHttpUrl(data.avatar);
      this.communities = data.communities.map(
        (community) => new Community(community)
      );
    }
  }
}

export class AutID extends BaseNFTModel<AutIDProperties> {
  constructor(data: AutID = {} as AutID) {
    super(data);
    this.properties = new AutIDProperties(data.properties);
  }
}
