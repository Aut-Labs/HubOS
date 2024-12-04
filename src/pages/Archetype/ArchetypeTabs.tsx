import HubOsTabs from "@components/HubOsTabs";
import { ArchetypePie } from "./ArchetypePie";

const ArchetypeTabs = ({ archetype }) => {
  const tabs = [
    {
      label: "Archetype",
      props: {
        archetype: archetype || {}
      },
      component: ArchetypePie
    }
  ];

  return (
    <>
      <HubOsTabs tabs={tabs}></HubOsTabs>
    </>
  );
};

export default ArchetypeTabs;
