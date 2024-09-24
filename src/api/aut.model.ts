import {
  DAutAutID,
  AutIDProperties as BaseAutIDProperties
} from "@aut-labs/d-aut";
import { HubOSHub } from "./hub.model";

export class AutIDProperties extends BaseAutIDProperties {
  ethDomain: string;
  hubs: HubOSHub[] = [];
  constructor(data: AutIDProperties) {
    super(data);
    this.ethDomain = data.ethDomain;
    this.hubs = data.hubs.map((hub) => new HubOSHub(hub));
  }
}

export class HubOSAutID<T = AutIDProperties> extends DAutAutID<T> {
  constructor(data: HubOSAutID<T> = {} as HubOSAutID<T>) {
    super(data);
    this.properties = new AutIDProperties(
      data.properties as AutIDProperties
    ) as T;
  }

  selectedHub(hubAddress: string) {
    if (!(this.properties as AutIDProperties).hubs) return null;
    return (this.properties as AutIDProperties).hubs.find(
      (hub) =>
        hub.properties.address?.toLowerCase() === hubAddress?.toLowerCase()
    );
  }

  joinedHub(hubAddress: string) {
    if (!(this.properties as AutIDProperties).hubs) return null;
    return (this.properties as AutIDProperties).joinedHubs.find(
      (hub) => hub.hubAddress?.toLowerCase() === hubAddress?.toLowerCase()
    );
  }

  isAutIDOwner(address: string) {
    return (
      (this.properties as AutIDProperties).address?.toLowerCase() ===
      address?.toLowerCase()
    );
  }
}
