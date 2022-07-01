import { combineReducers } from 'redux';
import taskReducer from '@store/Activity/task.reducer';
import communityReducer from './Community/community.reducer';
import authSliceReducer from '../auth/auth.reducer';
import uiSliceReducer from './ui-reducer';
import tasksReducer from './Activity/tasks.reducer';
import callReducer from './Activity/call.reducer';
import pollReducer from './Activity/poll.reducer';
import autDashboardReducer from './AutDashboard/aut-dashboard.reducer';

export const reducers = combineReducers({
  community: communityReducer,
  dashboard: autDashboardReducer,
  auth: authSliceReducer,
  ui: uiSliceReducer,
  task: taskReducer,
  tasks: tasksReducer,
  call: callReducer,
  poll: pollReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'RESET_APP') {
    state = undefined;
  }
  return reducers(state, action);
};

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
