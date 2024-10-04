import { Route, Routes } from "react-router-dom";
import SidebarDrawer from "@components/Sidebar/Sidebar";
import Dashboard from "./Dashboard/Dashboard";
import { Suspense, memo } from "react";
import AutLoading from "@components/AutLoading";
// import { pluginRoutes } from "./Modules/Shared/routes";
import { useSelector } from "react-redux";
import { HubData } from "@store/Hub/hub.reducer";
import Admins from "./Admins/Admins";
import Archetype from "./Archetype/Archetype";
import DAut from "./Modules/Plugins/DAut/DAut";
import { useGetArchetypeAndStatsQuery } from "@api/hub.api";
import { styled } from "@mui/material";
import backgroundImage from "@assets/hubos/bg-main.png";
import HubEdit from "./HubEdit/HubEdit";
import Members from "./Members/Members";
import TaskManager from "./TaskManager";
import DiscordBot from "./DiscordBot/DiscordBot";
import { AllTasks } from "./Modules/Plugins/Task/Shared/AllTasks";
import CreateOpenTask from "./Modules/Plugins/Task/Open/CreateOpenTask";

const AutContainer = styled("div")(() => ({
  display: "flex",
  height: "100%",
  backgroundImage: `url(${backgroundImage})`,
  backgroundBlendMode: "hard-light",
  backgroundSize: "cover",
  backgroundRepeat: "repeat-y"
}));

const AutDashboardMain = () => {
  const hubData = useSelector(HubData);
  // const { data: plugins, isLoading } = useGetAllPluginDefinitionsByDAOQuery(
  //   null,
  //   {
  //     refetchOnMountOrArgChange: false,
  //     skip: false
  //   }
  // );

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

  const modules = [];
  const isLoadingModules = false;

  // const { data: modules, isLoading: isLoadingModules } =
  //   useGetAllModuleDefinitionsQuery(null, {
  //     refetchOnMountOrArgChange: false,
  //     skip: false
  //   });

  // const modulesRoutes = useMemo(() => {
  //   const { allRoutes, menuItems } = pluginRoutes(
  //     plugins || [],
  //     modules || [],
  //     isAdmin,
  //     0,
  //     ""
  //   );

  //   console.log(allRoutes, menuItems, "allRoutes");

  //   return {
  //     menuItem: {
  //       title: "Hub",
  //       icon: ManageIcon,
  //       route: `hub`,
  //       children: [
  //         {
  //           title: "Onboard new members",
  //           route: "modules",
  //           exact: true,
  //           icon: StackIcon,
  //           children: menuItems
  //         },
  //         {
  //           title: "Tasks",
  //           route: "tasks",
  //           exact: true,
  //           icon: StackIcon
  //         }
  //       ]
  //     },
  //     routes: allRoutes
  //   };
  // }, [plugins, modules, isAdmin]);

  return (
    <>
      <AutContainer>
        {isLoadingModules ? (
          <AutLoading width="130px" height="130px" />
        ) : (
          <SidebarDrawer
            addonMenuItems={[]}
            // addonMenuItems={
            //   modulesRoutes?.routes?.length
            //     ? [modulesRoutes.menuItem]
            //     : [modulesRoutes.menuItem]
            // }
          >
            <Suspense fallback={<AutLoading width="130px" height="130px" />}>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="admins" element={<Admins />} />
                <Route path="edit-hub" element={<HubEdit />} />
                <Route path="archetype" element={<Archetype />} />
                <Route path="modules/dAut" element={<DAut />} />
                <Route path="members" element={<Members />} />
                <Route path="discord-bot" element={<DiscordBot />} />
                <Route path="task-manager" element={<TaskManager />} />
                <Route path="contributions" element={<AllTasks />} />
                <Route path="create-open-task" element={<CreateOpenTask />} />
                {/* <Route path="tasks" element={<AllTasks />} /> */}
                {/* {modulesRoutes?.routes?.length && (
                <Route
                  path="quest-submissions"
                  element={<QuestSubmissions />}
                />
              )} */}
                {/* <Route path="modules" element={<Modules />} />
              {modulesRoutes.routes.map((r) => r)}
              <Route
                path="*"
                element={<Navigate to={`/${hubData.name}`} />}
              /> */}
              </Routes>
            </Suspense>
          </SidebarDrawer>
        )}
      </AutContainer>
    </>
  );
};

export default memo(AutDashboardMain);
