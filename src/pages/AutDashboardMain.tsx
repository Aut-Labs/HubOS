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
import { CommunityData, IsAdmin } from "@store/Community/community.reducer";
import { useGetAllModuleDefinitionsQuery } from "@api/module-registry.api";
import Admins from "./Admins/Admins";
import CommunityEdit from "./CommunityEdit/CommunityEdit";
import { ReactComponent as ManageIcon } from "@assets/manage.svg";
import Archetype from "./Archetype/Archetype";
import DAut from "./Modules/Plugins/DAut/DAut";
import { useGetArchetypeAndStatsQuery } from "@api/community.api";

const AutDashboardMain = () => {
  const communityData = useSelector(CommunityData);
  const isAdmin = useSelector(IsAdmin);
  const { data: plugins, isLoading } = useGetAllPluginDefinitionsByDAOQuery(
    null,
    {
      refetchOnMountOrArgChange: false,
      skip: false
    }
  );

  const { data: archetype } = useGetArchetypeAndStatsQuery(null, {
    refetchOnMountOrArgChange: false,
    skip: false
  });

  console.log(archetype, "archetype");

  // const { questOnboarding } = useGetAllPluginDefinitionsByDAOQuery(null, {
  //   selectFromResult: ({ data }) => ({
  //     questOnboarding: (data || []).find(
  //       (p) =>
  //         PluginDefinitionType.QuestOnboardingPlugin === p.pluginDefinitionId
  //     )
  //   })
  // });

  // const { data: onboardingProgress } = useGetOnboardingProgressQuery(
  //   questOnboarding?.pluginAddress,
  //   {
  //     pollingInterval: 15000,
  //     refetchOnMountOrArgChange: true
  //   }
  // );

  // const totalSubmissions = useMemo(() => {
  //   if (onboardingProgress?.quests) {
  //     return onboardingProgress?.quests.reduce((prev, curr) => {
  //       prev += curr.tasksAndSubmissions.submissions.length;
  //       return prev;
  //     }, 0);
  //   }

  //   return 0;
  // }, [onboardingProgress]);

  const { data: modules, isLoading: isLoadingModules } =
    useGetAllModuleDefinitionsQuery(null, {
      refetchOnMountOrArgChange: false,
      skip: false
    });

  const modulesRoutes = useMemo(() => {
    const { allRoutes, menuItems } = pluginRoutes(
      plugins || [],
      modules || [],
      isAdmin,
      0,
      ""
    );

    console.log(allRoutes, menuItems, "allRoutes");

    return {
      menuItem: {
        title: "Community",
        icon: ManageIcon,
        route: `community`,
        children: [
          {
            title: "Onboard new members",
            route: "modules",
            exact: true,
            icon: StackIcon,
            children: menuItems
          }
        ]
      },
      routes: allRoutes
    };
  }, [plugins, modules, isAdmin]);

  return (
    <>
      {isLoading || isLoadingModules ? (
        <AutLoading width="130px" height="130px" />
      ) : (
        <SidebarDrawer
          addonMenuItems={
            modulesRoutes?.routes?.length
              ? [modulesRoutes.menuItem]
              : [modulesRoutes.menuItem]
          }
        >
          <Suspense fallback={<AutLoading width="130px" height="130px" />}>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="admins" element={<Admins />} />
              <Route path="community" element={<Members />} />
              <Route path="edit-community" element={<CommunityEdit />} />
              <Route path="your-archetype" element={<Archetype />} />
              <Route path="modules/dAut" element={<DAut />} />
              {/* {modulesRoutes?.routes?.length && (
                <Route
                  path="quest-submissions"
                  element={<QuestSubmissions />}
                />
              )} */}
              <Route path="modules" element={<Modules />} />
              {modulesRoutes.routes.map((r) => r)}
              <Route
                path="*"
                element={<Navigate to={`/${communityData.name}`} />}
              />
            </Routes>
          </Suspense>
        </SidebarDrawer>
      )}
    </>
  );
};

export default memo(AutDashboardMain);
