import { Route, Routes } from "react-router-dom";
import SidebarDrawer from "@components/Sidebar/Sidebar";
import Dashboard from "./Dashboard/Dashboard";
import { Suspense, memo } from "react";
import AutLoading from "@components/AutLoading";
import { useSelector } from "react-redux";
import { HubData } from "@store/Hub/hub.reducer";
import Admins from "./Admins/Admins";
import Archetype from "./Archetype/Archetype";
import DAut from "./Modules/Plugins/DAut/DAut";
import { styled } from "@mui/material";
import backgroundImage from "@assets/hubos/bg-aut-blue.png";
import HubEdit from "./HubEdit/HubEdit";
import Members from "./Members/Members";
import TaskManager from "./TaskManager";
import DiscordBot from "./DiscordBot/DiscordBot";
import Contributions from "./Modules/Plugins/Task/Contributions/Contributions";
import CreateOpenTask from "./Modules/Plugins/Task/Open/CreateOpenTask";
import useQueryTaskTypes from "@hooks/useQueryTaskTypes";
import CreateGathering from "./DiscordBot/CreateGathering";
import CreateXLikeTask from "./TwitterTasks/CreateXLikeTask";
import CreateXFollowTask from "./TwitterTasks/CreateXFollowTask";
import CreateGithubCommitTask from "./GithubTasks/CreateGithubCommitTask";
import useQueryHubMembers from "@hooks/useQueryHubMembers";
import CreateXRetweetTask from "./TwitterTasks/CreateXRetweetTask";
import CreateXCommentTask from "./TwitterTasks/CreateXCommentTask";
import CreatePoll from "./DiscordBot/CreatePoll";
import CreateGithubOpenPRTask from "./GithubTasks/CreateGithubPRTask";
import CreateQuizTask from "./Modules/Plugins/Task/Quiz/CreateQuizTask";
import CreateJoinDiscordTask from "./Modules/Plugins/Task/JoinDiscord/CreateJoinDiscordTask";
import useQueryHubPeriod from "@hooks/useQueryHubPeriod";

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
  const { data: periodData } = useQueryHubPeriod();

  console.log(periodData, "periodData");
  const { data: members, loading: isLoadingMembers } = useQueryHubMembers({
    skip: !hubData?.properties?.address,
    variables: {
      skip: 0,
      take: 1000,
      where: {
        joinedHubs_: {
          hubAddress: hubData.properties.address
        }
      }
    }
  });

  const {
    data,
    loading: isLoading,
    refetch
  } = useQueryTaskTypes({
    variables: {
      skip: 0,
      take: 1000
    }
  });
  return (
    <>
      <AutContainer>
        <SidebarDrawer addonMenuItems={[]}>
          <Suspense fallback={<AutLoading width="130px" height="130px" />}>
            <Routes>
              <Route index element={<Dashboard members={members} />} />
              <Route path="admins" element={<Admins />} />
              <Route path="edit-hub" element={<HubEdit />} />
              <Route path="archetype" element={<Archetype />} />
              <Route path="modules/dAut" element={<DAut />} />
              <Route
                path="discord-bot"
                element={<DiscordBot data={data} />}
              ></Route>
              <Route
                path="members"
                element={
                  <Members members={members} isLoading={isLoadingMembers} />
                }
              />
              <Route
                path="task-manager"
                element={
                  <TaskManager
                    isLoading={isLoading}
                    data={data}
                    refetch={refetch}
                  />
                }
              />
              <Route path="contributions/*" element={<Contributions />} />
              <Route path="create-open-task" element={<CreateOpenTask />} />
              <Route
                path="create-join-discord"
                element={<CreateJoinDiscordTask />}
              />
              <Route path="create-quiz" element={<CreateQuizTask />} />
              <Route
                path="create-github-commit"
                element={<CreateGithubCommitTask />}
              />{" "}
              <Route
                path="create-github-open-pull-request"
                element={<CreateGithubOpenPRTask />}
              />
              <Route
                path="create-discord-gatherings"
                element={<CreateGathering />}
              />
              <Route path="create-discord-polls" element={<CreatePoll />} />
              <Route
                path="create-twitter-follow"
                element={<CreateXFollowTask />}
              />
              <Route
                path="create-twitter-comment"
                element={<CreateXCommentTask />}
              />
              <Route
                path="create-twitter-retweet"
                element={<CreateXRetweetTask />}
              />
              <Route path="create-twitter-like" element={<CreateXLikeTask />} />
              <Route path="create-open-task" element={<CreateOpenTask />} />
            </Routes>
          </Suspense>
        </SidebarDrawer>
      </AutContainer>
    </>
  );
};

export default memo(AutDashboardMain);
