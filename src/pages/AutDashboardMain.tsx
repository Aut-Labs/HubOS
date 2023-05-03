import { Navigate, Route, Routes } from "react-router-dom";
import SidebarDrawer from "@components/Sidebar/Sidebar";
import Dashboard from "./Dashboard/Dashboard";
import Members from "./Members/Members";
import { useGetAllPluginDefinitionsByDAOQuery } from "@api/plugin-registry.api";
import { Suspense, memo, useMemo } from "react";
import { ReactComponent as StackIcon } from "@assets/aut/stack.svg";
import AutLoading from "@components/AutLoading";
import { pluginRoutes } from "./Modules/Shared/routes";
import Modules from "./Modules/Modules";
import { useSelector } from "react-redux";
import { IsAdmin } from "@store/Community/community.reducer";
import { useGetAllModuleDefinitionsQuery } from "@api/module-registry.api";

const AutDashboardMain = () => {
  const isAdmin = useSelector(IsAdmin);
  const { data: plugins, isLoading } = useGetAllPluginDefinitionsByDAOQuery(
    null,
    {
      refetchOnMountOrArgChange: false,
      skip: false
    }
  );

  const { data: modules, isLoading: isLoadingModules } =
    useGetAllModuleDefinitionsQuery(null, {
      refetchOnMountOrArgChange: false,
      skip: false
    });

  const modulesRoutes = useMemo(() => {
    const { allRoutes, menuItems } = pluginRoutes(
      plugins || [],
      modules || [],
      isAdmin
    );
    return {
      menuItem: {
        title: "Modules",
        route: "modules",
        exact: true,
        icon: StackIcon,
        children: menuItems
      },
      routes: allRoutes
    };
  }, [plugins, modules, isAdmin]);

  return (
    <>
      {isLoading || isLoadingModules ? (
        <AutLoading />
      ) : (
        <SidebarDrawer addonMenuItems={[modulesRoutes.menuItem]}>
          <Suspense fallback={<AutLoading />}>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="members" element={<Members />} />
              <Route path="modules" element={<Modules />} />
              {modulesRoutes.routes.map((r) => r)}
              <Route path="*" element={<Navigate to="/aut-dashboard" />} />
            </Routes>
          </Suspense>
        </SidebarDrawer>
      )}
    </>
  );
};

export default memo(AutDashboardMain);
