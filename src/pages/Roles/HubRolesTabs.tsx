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

  console.log("TABSS", tabs);

  return (
    <>
      <HubOsTabs tabs={tabs}></HubOsTabs>
    </>
  );
};

export default HubRoleTabs;
