import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { RootState, useAppDispatch } from '@store/store.model';
import { CircularProgress, Container, styled } from '@mui/material';
import { useSelector } from 'react-redux';
import { fetchLogs } from '@store/Community/community.reducer';
import { ResultState } from '@store/result-status';
import { setTitle } from '@store/ui-reducer';
import { fetchMembers } from '@api/community.api';
import { AutHeader } from '@components/AutHeader';
import { pxToRem } from '@utils/text-size';
import SwTabs from '../../components/tabs/SwTabs';
import ActivityAndLogs from './ActivityAndLogs';
import Members from './Members';
import { AutID } from '@api/aut.model';
import './member-and-activities.scss';
import AutLoading from '@components/AutLoading';

const CardTilt = styled('div')(({ theme }) => ({
  borderRadius: 0,
  border: '1px solid white',
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  position: 'relative',
  width: 'calc(100%)',
  height: 'calc(100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // marginLeft: "15px",
  // marginTop: "15px",
  backgroundColor: 'black',
  '@keyframes sw-card-tilt': {
    '0%': {
      transform: ' perspective(1200px) rotate3d(0, -0.5, 0, 0deg)',
      transformstyle: 'preserve-3d',
    },
    '25%': {
      transform: 'perspective(1200px) rotate3d(0, -1, 0, 15deg)',
      transformstyle: 'preserve-3d',
    },
    '50%': {
      transform: 'perspective(1200px) rotate3d(0, -0.5, 0, 0deg)',
      transformstyle: 'preserve-3d',
    },
    '75%': {
      transform: 'perspective(1200px) rotate3d(0, -1, 0, 15deg)',
      transformstyle: 'preserve-3d',
    },
    '100%': {
      transform: 'perspective(1200px) rotate3d(0, -1, 0, 0deg)',
      transformstyle: 'preserve-3d',
    },
  },
  animation: `sw-card-tilt 3s linear infinite`,
  animationDirection: 'normal',
}));

const AutIdCard = () => {
  return (
    <CardTilt>
      <img
        alt="id"
        style={{
          width: '100%',
          height: '100%',
        }}
        src="https://infura-ipfs.io/ipfs/bafybeiaok5esvbdym2othwvxt2wcsanrd4bmyu64p7f25gg7dvtp6bbodq"
      />
    </CardTilt>
  );
};

const getAllMembers = (members: { [role: string]: AutID[] }) => {
  return Object.keys(members).reduce((prev, curr) => {
    const item = members[curr];
    if (Array.isArray(item)) {
      prev = [...prev, ...item];
    }
    return prev;
  }, []);
};

const generateMemberTabs = (members: { [role: string]: AutID[] }) => {
  return Object.keys(members).reduce((prev, curr) => {
    const item = members[curr];
    if (Array.isArray(item)) {
      prev = [
        ...prev,
        {
          label: curr,
          props: {
            total: item?.length,
            members: item,
          },
          component: Members,
        },
      ];
    }
    return prev;
  }, []);
};

function MembersAndActivities(props) {
  const dispatch = useAppDispatch();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const { members, logs, status } = useSelector((state: RootState) => state.community);
  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    // @TODO: Make more reusable in case in the future there are more view that will have
    // members and activities
    const { isCoreTeamMembers } = props;
    let memberTabs = [];
    if (!members || !logs) {
      return;
    }

    if (isCoreTeamMembers) {
      const allMembers = getAllMembers(members);
      memberTabs = [
        {
          label: 'All',
          props: {
            total: allMembers?.length,
            members: allMembers,
          },
          component: Members,
        },
      ];
    } else {
      memberTabs = generateMemberTabs(members);
    }

    setTabs([
      ...(memberTabs || []),
      {
        label: 'Activity & Logs',
        props: {
          total: logs?.length,
          logs,
        },
        component: ActivityAndLogs,
      },
    ]);
  }, [members, logs, props]);

  useEffect(() => {
    const promises = [dispatch(fetchMembers(props.isCoreTeamMembers)), dispatch(fetchLogs(userInfo?.community))];
    return () => promises.forEach((p) => p.abort());
  }, [dispatch, userInfo, props.isCoreTeamMembers]);

  useEffect(() => {
    dispatch(setTitle(`DAO Management - Members & Roles in your Community.`));
  }, [dispatch]);

  return (
    <Container
      maxWidth="lg"
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        boxSizing: 'border-box',
        py: pxToRem(30),
      }}
    >
      {status === ResultState.Loading ? (
        <div className="sw-loading-spinner">
          <AutLoading />
        </div>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <AutHeader title="Your DAO Members" />
          <SwTabs
            tabPanelStyles={{
              border: '2px solid #439EDD',
            }}
            tabs={tabs}
          />
        </Box>
      )}
    </Container>
  );
}

export default MembersAndActivities;
