import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { RootState, useAppDispatch } from '@store/store.model';
import { CircularProgress, Container, styled } from '@mui/material';
import { useSelector } from 'react-redux';
import { fetchLogs } from '@store/Community/community.reducer';
import { ResultState } from '@store/result-status';
import { setTitle } from '@store/ui-reducer';
import { fetchMembers } from '@api/community.api';
import './member-and-activities.scss';
import { AutHeader } from '@components/AutHeader';
import { pxToRem } from '@utils/text-size';
import { AutList } from '@api/api.model';
import { ReactComponent as LineVertical } from '@assets/line-vertical.svg';
import { ReactComponent as LineHorizontal } from '@assets/line-horizontal.svg';
import LineTo from 'react-lineto';
import SwTabs from '../tabs/SwTabs';
import ActivityAndLogs from './ActivityAndLogs';
import Members from './Members';

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

const getAllMembers = (members: { [role: string]: AutList[] }) => {
  return Object.keys(members).reduce((prev, curr) => {
    const item = members[curr];
    if (Array.isArray(item)) {
      prev = [...prev, ...item];
    }
    return prev;
  }, []);
};

const generateMemberTabs = (members: { [role: string]: AutList[] }) => {
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

const LayerOne = () => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      <LineVertical
        style={{
          position: 'absolute',
          left: 0,
        }}
        height="100%"
      />
    </div>
  );
};

const LayerTwo = () => {
  return (
    <div
      style={{
        position: 'absolute',
        maxWidth: pxToRem(575),
        maxHeight: pxToRem(680),
        width: `calc(100%)`,
        height: `calc(100%)`,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        <LineVertical
          style={{
            position: 'absolute',
            left: 0,
          }}
          height="100%"
        />
        <LineHorizontal
          style={{
            position: 'absolute',
            top: 0,
          }}
          width="100%"
        />

        <LineVertical
          style={{
            position: 'absolute',
            right: 0,
          }}
          height="100%"
        />
      </div>
    </div>
  );
};

const LayerThree = () => {
  return (
    <div
      style={{
        position: 'absolute',
        maxWidth: pxToRem(435),
        maxHeight: pxToRem(535),
        width: `calc(100%)`,
        height: `calc(100%)`,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        <LineVertical
          style={{
            position: 'absolute',
            left: 0,
          }}
          height="100%"
        />
        <LineHorizontal
          style={{
            position: 'absolute',
            top: 0,
          }}
          width="100%"
        />

        <LineVertical
          style={{
            position: 'absolute',
            right: 0,
          }}
          height="100%"
        />
      </div>
    </div>
  );
};

const LeftBorder = ({ className } = {} as any) => {
  return (
    <LineVertical
      className={className}
      style={{
        position: 'absolute',
        left: 0,
      }}
      height="100%"
    />
  );
};

const RightBorder = () => {
  return (
    <LineVertical
      style={{
        position: 'absolute',
        right: 0,
      }}
      height="100%"
    />
  );
};

const TopBorder = () => {
  return (
    <LineHorizontal
      style={{
        position: 'absolute',
        top: 0,
      }}
      width="100%"
    />
  );
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
    dispatch(setTitle('DAO Management - Sublime Here'));
  }, []);

  return (
    <Container
      maxWidth="lg"
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        boxSizing: 'border-box',
      }}
    >
      {/* <div
        style={{
          position: "relative",
          width: "50%",
          height: "100%",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            maxHeight: pxToRem(840),
          }}
        >
          <LeftBorder className="left-a" />

          <div
            style={{
              position: "absolute",
              maxWidth: pxToRem(575),
              maxHeight: pxToRem(680.87),
              width: `calc(100% - ${pxToRem(200)})`,
              height: `calc(100% - ${pxToRem(200)})`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
              }}
            >
              <LeftBorder />
              <TopBorder />
              <RightBorder />

              <div
                style={{
                  position: "absolute",
                  maxWidth: pxToRem(435),
                  maxHeight: pxToRem(534.94),
                  width: `calc(100% - ${pxToRem(150)})`,
                  height: `calc(100% - ${pxToRem(150)})`,
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, calc(-50%))`,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <LeftBorder className="left-b" />
                  <TopBorder />
                  <RightBorder />

                  <div
                    style={{
                      position: "absolute",
                      maxWidth: pxToRem(354),
                      maxHeight: pxToRem(600),
                      width: `calc(100%)`,
                      height: `calc(100% + ${pxToRem(50)})`,
                      top: "calc(50% + 30px)",
                      left: "50%",
                      transform: "translate(-50%, -40%)",
                    }}
                  >
                    <AutIdCard />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <LineTo
          fromAnchor="bottom"
          toAnchor="bottom"
          from="left-a"
          to="left-b"
        />
      </div> */}
      {status === ResultState.Loading ? (
        <div className="sw-loading-spinner">
          <CircularProgress
            sx={{
              justifyContent: 'center',
              alignContent: 'center',
            }}
          />
        </div>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            my: pxToRem(50),
          }}
        >
          <AutHeader
            title="Members"
            titleStyles={{
              m: 0,
            }}
            subtitle={
              <>
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                <br />
                eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
              </>
            }
          />
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
