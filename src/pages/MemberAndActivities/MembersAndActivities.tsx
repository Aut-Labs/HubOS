import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { RootState, useAppDispatch } from "@store/store.model";
import { Container } from "@mui/material";
import { useSelector } from "react-redux";
import { CommunityData, fetchLogs } from "@store/Community/community.reducer";
import { ResultState } from "@store/result-status";
import { setTitle } from "@store/ui-reducer";
import { fetchMembers } from "@api/community.api";
import { AutHeader } from "@components/AutHeader";
import { pxToRem } from "@utils/text-size";
import SwTabs from "../../components/tabs/SwTabs";
import ActivityAndLogs from "./ActivityAndLogs";
import Members from "./Members";
import { AutID } from "@api/aut.model";
import "./member-and-activities.scss";
import AutLoading from "@components/AutLoading";

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
            members: item
          },
          component: Members
        }
      ];
    }
    return prev;
  }, []);
};

function MembersAndActivities(props) {
  const dispatch = useAppDispatch();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const { members, logs, status } = useSelector(
    (state: RootState) => state.community
  );
  const community = useSelector(CommunityData);
  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    const { isCoreTeamMembers } = props;
    let memberTabs = [];
    if (!members || !logs) {
      return;
    }

    if (isCoreTeamMembers) {
      const allMembers = getAllMembers(members);
      memberTabs = [
        {
          label: "All",
          props: {
            total: allMembers?.length,
            members: allMembers
          },
          component: Members
        }
      ];
    } else {
      memberTabs = generateMemberTabs(members);
    }

    setTabs(memberTabs || []);

    // setTabs([
    //   ...(memberTabs || []),
    //   {
    //     label: "Activity & Logs",
    //     props: {
    //       total: logs?.length,
    //       logs
    //     },
    //     component: ActivityAndLogs
    //   }
    // ]);
  }, [members, logs, props]);

  useEffect(() => {
    const promises = [
      dispatch(fetchMembers(props.isCoreTeamMembers))
      // dispatch(fetchLogs(userInfo?.community))
    ];
    return () => promises.forEach((p) => p.abort());
  }, [
    dispatch,
    userInfo,
    props.isCoreTeamMembers,
    community?.properties?.address
  ]);

  useEffect(() => {
    dispatch(setTitle(`DAO Management - Members & Roles in your Community.`));
  }, [dispatch]);

  return (
    <Container
      maxWidth="lg"
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        boxSizing: "border-box",
        py: pxToRem(30)
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
            display: "flex",
            flexDirection: "column"
          }}
        >
          <AutHeader title="Your DAO Members" />
          <SwTabs
            tabPanelStyles={{
              border: "2px solid #439EDD"
            }}
            tabs={tabs}
          />
        </Box>
      )}
    </Container>
  );
}

export default MembersAndActivities;
