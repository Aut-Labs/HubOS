import { Navigate, Route, Routes } from "react-router-dom";
import SidebarDrawer from "@components/Sidebar/Sidebar";
import Dashboard from "./Dashboard/Dashboard";
import Members from "./Members/Members";
import YourStack from "./MyStack/MyStack";
import { useGetAllPluginDefinitionsByDAOQuery } from "@api/plugin-registry.api";
import { Suspense, memo, useMemo } from "react";
import { ReactComponent as StackIcon } from "@assets/aut/stack.svg";
import AutLoading from "@components/AutLoading";
import { pluginRoutes } from "./MyStack/Shared/routes";

const AutDashboardMain = () => {
  const { data: plugins, isLoading } = useGetAllPluginDefinitionsByDAOQuery(
    null,
    {
      refetchOnMountOrArgChange: false,
      skip: false
    }
  );

  console.log("plugins: ", plugins);

  const myStack = useMemo(() => {
    const { allRoutes, menuItems } = pluginRoutes(plugins || []);
    return {
      menuItem: {
        title: "My Stack",
        route: "my-stack",
        exact: true,
        icon: StackIcon,
        children: menuItems
      },
      routes: allRoutes
    };
  }, [plugins]);

  return (
    <>
      {isLoading ? (
        <AutLoading />
      ) : (
        <SidebarDrawer addonMenuItems={[myStack.menuItem]}>
          <Suspense fallback={<AutLoading />}>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="members" element={<Members />} />
              <Route path="my-stack" element={<YourStack />} />
              {myStack.routes.map((r) => r)}
              <Route path="*" element={<Navigate to="/aut-dashboard" />} />
            </Routes>
          </Suspense>
        </SidebarDrawer>
      )}
    </>
  );
};

export default memo(AutDashboardMain);
