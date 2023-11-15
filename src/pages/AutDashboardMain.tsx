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
import BotGatherings from "./Bot/BotGatherings";
import { botActionRoutes } from "./Bot/routes";
import GatheringInitialStep from "./Bot/Gatherings/GatheringIntialStep";
import GatheringCalendarStep from "./Bot/Gatherings/GatheringCalendarStep";
import GatheringSuccessStep from "./Bot/Gatherings/GatheringSuccessStep";
import CreatePollInfoStep from "./EventFactory/Polls/CreatePollInfoStep/CreatePollInfoStep";
import CreatePollOptionsStep from "./EventFactory/Polls/CreatePollOptionsStep/CreatePollOptionsStep";
import CreatePollParticipantsStep from "./EventFactory/Polls/CreatePollParticipantsStep/CreatePollParticipantsStep";
import CallInformationStep from "./EventFactory/GroupCall/CallInformationStep/CallInformationStep";
import CalendarStep from "./EventFactory/GroupCall/CalendarStep/CalendarStep";
import BotPluginsPage from "./Bot/BotPluginsPage";
import CreatePollSuccessStep from "./EventFactory/Polls/SuccessStep/CreatePollSuccessStep";
import CommunityEdit from "./CommunityEdit/CommunityEdit";
import { ReactComponent as ManageIcon } from "@assets/manage.svg";
import Archetype from "./Archetype/Archetype";
import DAut from "./Modules/Plugins/DAut/DAut";
import {
  useGetArchetypeAndStatsQuery,
  useGetCommunityQuery
} from "@api/community.api";
import BotPolls from "./Bot/BotPolls";
import { AllTasks } from "./Modules/Plugins/Task/Shared/AllTasks";

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
          },
          {
            title: "Tasks",
            route: "tasks",
            exact: true,
            icon: StackIcon
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
              {/* <Route path="bot" element={<Bot />} /> */}
              {/* <Route path="bot" element={<BotPluginsPage />} /> */}
              <Route path="bot/plugins" element={<BotPluginsPage />} />
              <Route path="bot/polls" element={<BotPolls />} />
              <Route path="bot/gatherings" element={<BotGatherings />} />
              <Route path="bot/gathering" element={<GatheringInitialStep />} />
              <Route path="bot/poll/info" element={<CreatePollInfoStep />} />
              {/* <Route path="bot/gathering" element={<CalendarStep />} /> */}
              <Route
                path="bot/poll/options"
                element={<CreatePollOptionsStep />}
              />
              <Route
                path="bot/poll/participants"
                element={<CreatePollParticipantsStep />}
              />
              <Route
                path="bot/poll/success"
                element={<CreatePollSuccessStep />}
              />
              <Route
                path="bot/gathering/success"
                element={<GatheringSuccessStep />}
              />
              {/* <Route
                path="bot/gathering/calendar"
                element={<GatheringCalendarStep />}
              /> */}
              <Route path="members" element={<Members />} />
              <Route path="community" element={<Members />} />
              <Route path="edit-community" element={<CommunityEdit />} />
              <Route path="your-archetype" element={<Archetype />} />
              <Route path="modules/dAut" element={<DAut />} />
              <Route path="tasks" element={<AllTasks />} />
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
