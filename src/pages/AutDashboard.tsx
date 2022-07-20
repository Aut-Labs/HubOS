import { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import SidebarDrawer from '@components/Sidebar';
import { useSelector } from 'react-redux';
import { fetchCommunity } from '@api/community.api';
import { RootState, useAppDispatch } from '@store/store.model';
import NotFound from '@components/NotFound';
import MembersAndActivities from 'src/pages/MemberAndActivities/MembersAndActivities';
import Dashboard from './Dashboard/Dashboard';
import Roles from './Roles/Roles';
import EventFactory from './EventFactory/EventFactory';
import CreateTask from './EventFactory/CreateTask/CreateTask';
import GroupCall from './EventFactory/GroupCall/GroupCall';
import Polls from './EventFactory/Polls/Polls';
import SuccessStep from './EventFactory/CreateTask/SuccessStep/SuccessStep';
import Tasks from './EventFactory/Tasks/Tasks';
import YourTasks from './EventFactory/Tasks/YourTasks';
import TaskDetails from './EventFactory/Tasks/TaskDetails';
import TaskSubmit from './EventFactory/Tasks/TaskSubmit';
import TaskFinalise from './EventFactory/Tasks/TaskFinalise';
import Integrations from './ThirdPartyIntegrations/Integrations';
import Contracts from './Contracts/Contracts';
import DaoIntegration from './ThirdPartyIntegrations/DaoIntegration/DaoIntegration';
import DiscordIntegration from './ThirdPartyIntegrations/DiscordIntegration/DiscordIntegration';
import AutCommunityShare from './AutCommunityShare/AutCommunityShare';
import UserProfile from './UserProfile/UserProfile';
import CommunityEdit from './CommunityEdit/CommunityEdit';

const AutDashboard = (props) => {
  const dispatch = useAppDispatch();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (userInfo?.community) {
      const promise = dispatch(fetchCommunity(userInfo?.community));
      return () => promise.abort();
    }
  }, [dispatch, userInfo]);

  return (
    <>
      <SidebarDrawer>
        <Switch>
          {/* Aut Dashboard */}
          <Route exact path="/aut-dashboard" component={Dashboard} {...props} />
          <Route path="/aut-dashboard/edit-community/:communityAddress" component={CommunityEdit} {...props} />

          {/* Core Team Routes */}
          {/* <Route exact path="/aut-dashboard/core-team" component={CoreTeam} {...props} /> */}
          <Route exact path="/aut-dashboard/members" render={() => <MembersAndActivities {...props} />} />
          <Route exact path="/aut-dashboard/members/:memberAddress" component={UserProfile} />
          <Route exact path="/aut-dashboard/roles" render={() => <Roles {...props} isCoreTeam />} />
          <Route exact path="/aut-dashboard/share" component={AutCommunityShare} {...props} />

          {/* Aut Dashboard > Integration and contracts */}
          <Route exact path="/aut-dashboard/integrations-and-contracts" component={Integrations} {...props} />
          <Route exact path="/aut-dashboard/integrations-and-contracts/dao-integration" component={DaoIntegration} {...props} />
          <Route exact path="/aut-dashboard/integrations-and-contracts/discord-integration" component={DiscordIntegration} {...props} />
          <Route exact path="/aut-dashboard/integrations-and-contracts/contracts" component={Contracts} {...props} />

          {/* Aut Dashboard > Event factory */}
          <Route exact path="/aut-dashboard/event-factory" component={EventFactory} {...props} />
          <Route path="/aut-dashboard/event-factory/create-task" component={CreateTask} {...props} />
          <Route path="/aut-dashboard/event-factory/group-call" component={GroupCall} {...props} />
          <Route path="/aut-dashboard/event-factory/polls" component={Polls} {...props} />
          <Route path="/aut-dashboard/event-factory/create-task-success" component={SuccessStep} {...props} />

          {/* Aut Dashboard > Tasks */}
          <Route exact path="/aut-dashboard/tasks" component={Tasks} {...props} />
          <Route exact path="/aut-dashboard/your-tasks" component={YourTasks} {...props} />
          <Route exact path="/aut-dashboard/tasks/:taskActivityId" component={TaskDetails} {...props} />
          <Route exact path="/aut-dashboard/tasks/finalise/:taskActivityId" component={TaskFinalise} {...props} />
          <Route path="/aut-dashboard/tasks/:taskActivityId/submit" component={TaskSubmit} {...props} />

          <Route component={NotFound} />
        </Switch>
      </SidebarDrawer>
    </>
  );
};

export default AutDashboard;
