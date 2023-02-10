import { Route, Routes } from "react-router-dom";
import SidebarDrawer from "@components/Sidebar/Sidebar";
import Dashboard from "./Dashboard/Dashboard";
import MembersAndActivities from "./MemberAndActivities/MembersAndActivities";
import YourStack from "./MyStack/MyStack";
import { useGetAllPluginDefinitionsByDAOQuery } from "@api/plugin-registry.api";
import { Suspense, memo, useMemo } from "react";
import { ReactComponent as SubStackIcon } from "@assets/aut/sub-stack.svg";
import { ReactComponent as StackIcon } from "@assets/aut/stack.svg";
import AutLoading from "@components/AutLoading";
import { onboardingRoutes } from "./MyStack/Onboarding/Plugins/routes";

const AutDashboardMain = () => {
  const { data: plugins, isLoading } = useGetAllPluginDefinitionsByDAOQuery(
    null,
    {
      // pollingInterval: 4000,
      refetchOnMountOrArgChange: true,
      skip: false
    }
  );

  const installedPlugins = useMemo(() => {
    return (plugins || []).filter((p) => !!p.pluginAddress);
  }, [plugins]);

  const onboardingPlugins = useMemo(() => {
    return installedPlugins.reduce(
      (prev, curr) => {
        if (curr.active) {
          if (!prev.menuItem) {
            prev.menuItem = {
              title: curr.metadata.properties.stack.type,
              route: `my-stack/${curr.metadata.properties.stack.type}`,
              icon: SubStackIcon,
              exact: true,
              children: []
            };
          }
          const response = onboardingRoutes(curr);
          prev.menuItem.children.push(response.menuItem);
          prev.routes.push(...response.routes);
        }
        return prev;
      },
      {
        menuItem: null,
        routes: []
      }
    );
  }, [installedPlugins]);

  const myStack = useMemo(() => {
    const children = [];

    if (onboardingPlugins.menuItem) {
      children.push(onboardingPlugins.menuItem);
    }

    return {
      menuItem: {
        title: "Your Stack",
        route: "my-stack",
        exact: true,
        icon: StackIcon,
        children
      },
      routes: [...onboardingPlugins.routes]
    };
  }, [onboardingPlugins]);

  return (
    <>
      {isLoading ? (
        <AutLoading />
      ) : (
        <SidebarDrawer addonMenuItems={[myStack.menuItem]}>
          <Suspense fallback={<AutLoading />}>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="members" element={<MembersAndActivities />} />
              <Route path="my-stack" element={<YourStack />} />
              {myStack.routes.map((r) => r)}
            </Routes>
          </Suspense>
        </SidebarDrawer>
      )}
    </>
  );
};

export default memo(AutDashboardMain);
