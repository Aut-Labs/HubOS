/* eslint-disable max-len */
import { takeActivityTask, getAllTasks } from '@api/activities.api';
import { ActivityTypes } from '@api/api.model';
import { Container } from '@mui/material';
import { resetActivityTaskState } from '@store/Activity/task.reducer';
import { TaskTypes, Task } from '@store/model';
import { useAppDispatch } from '@store/store.model';
import { memo, useEffect, useState } from 'react';
import TasksList from './Tasks/TasksList';

const EventFactory = () => {
  const dispatch = useAppDispatch();
  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    setTabs([
      {
        label: 'Polls',
        hideTop: true,
        props: {
          status: TaskTypes.Open,
        },
        component: TasksList,
      },
      {
        label: 'Community Calls',
        hideTop: true,
        props: {
          status: TaskTypes.Ongoing,
        },
        component: TasksList,
      },
      {
        label: 'Closed Tasks',
        hideTop: true,
        props: {
          status: TaskTypes.Closed,
        },
        component: TasksList,
      },
    ]);
    dispatch(getAllTasks(ActivityTypes.CoreTeamTask));
    return () => {
      dispatch(resetActivityTaskState());
    };
  }, [dispatch]);
  return <Container maxWidth="lg" className="sw-integration-dashboard" />;
};

export default memo(EventFactory);
