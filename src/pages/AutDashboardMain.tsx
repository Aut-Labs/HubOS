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
import QuestSubmissions from "./QuestSubmissions/QuestSubmissions";
import PeopleIcon from "@mui/icons-material/People";
import { useGetOnboardingProgressQuery } from "@api/onboarding.api";
import { PluginDefinitionType } from "@aut-labs/sdk/dist/models/plugin";
import Admins from "./Admins/Admins";
import Bot from "./Bot/Bot";
import { botActionRoutes } from "./Bot/routes";
import GatheringInitialStep from "./Bot/Gatherings/GatheringIntialStep";
import GatheringCalendarStep from "./Bot/Gatherings/GatheringCalendarStep";
import GatheringSuccessStep from "./Bot/Gatherings/GatheringSuccessStep";
import CreatePollInfoStep from "./EventFactory/Polls/CreatePollInfoStep/CreatePollInfoStep";
import CreatePollOptionsStep from "./EventFactory/Polls/CreatePollOptionsStep/CreatePollOptionsStep";
import CreatePollParticipantsStep from "./EventFactory/Polls/CreatePollParticipantsStep/CreatePollParticipantsStep";

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

    return {
      // submissionsItem: {
      //   title: "Quest Submissions",
      //   route: `/${communityData?.name}/quest-submissions`,
      //   exact: true,
      //   icon: PeopleIcon,
      //   badgeCounter: totalSubmissions,
      //   children: []
      // },
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
              <Route path="bot" element={<Bot />} />
              <Route path="bot/gathering" element={<GatheringInitialStep />} />
              <Route path="bot/poll/info" element={<CreatePollInfoStep />} />
              <Route
                path="bot/poll/options"
                element={<CreatePollOptionsStep />}
              />
              <Route
                path="bot/poll/participants"
                element={<CreatePollParticipantsStep />}
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
