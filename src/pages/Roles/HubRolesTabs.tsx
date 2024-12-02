import HubOsTabs from "@components/HubOsTabs";
import { HubRoleList } from "./HubRoleList";

const HubRoleTabs = ({ roles }) => {
  const tabs = roles.map((role) => {
    return {
      label: role?.roleName,
      props: {
        members: role?.members || []
      },
      component: HubRoleList
    };
  });

  return (
    <>
      <HubOsTabs tabs={tabs}></HubOsTabs>
    </>
  );
};

export default HubRoleTabs;
