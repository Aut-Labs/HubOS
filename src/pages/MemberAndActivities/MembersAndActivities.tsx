import { useEffect, memo, useMemo } from "react";
import Box from "@mui/material/Box";
import { useAppDispatch } from "@store/store.model";
import { Button, CircularProgress, Container, Typography } from "@mui/material";
import { setTitle } from "@store/ui-reducer";
import { useGetAllMembersQuery } from "@api/community.api";
import { pxToRem } from "@utils/text-size";
import SwTabs from "../../components/tabs/SwTabs";
import Members from "./Members";
import { DAOMember } from "@api/aut.model";
import IosShareIcon from "@mui/icons-material/IosShare";

const generateMemberTabs = (members: DAOMember[]) => {
  const membersByRole = members.reduce((group, member) => {
    const roleName = member.properties.role?.roleName;
    group[roleName] = group[roleName] ?? [];
    group[roleName].push(member);
    return group;
  }, {});

  return Object.keys(membersByRole).reduce((prev, roleName) => {
    if (Array.isArray(membersByRole[roleName])) {
      prev = [
        ...prev,
        {
          label: roleName,
          props: {
            total: membersByRole[roleName]?.length,
            members: membersByRole[roleName]
          },
          component: Members
        }
      ];
    }
    return prev;
  }, []);
};

function MembersAndActivities() {
  const dispatch = useAppDispatch();

  const { data, isLoading } = useGetAllMembersQuery(null, {
    refetchOnMountOrArgChange: true,
    skip: false
  });

  const tabs = useMemo(() => {
    if (!data?.length) return [];
    return generateMemberTabs(data);
  }, [data]);

  useEffect(() => {
    dispatch(setTitle(`DAO - Members & Roles in your Community.`));
  }, [dispatch]);

  return (
    <Container maxWidth="lg" sx={{ mt: pxToRem(20) }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          position: "relative"
        }}
      >
        <Typography textAlign="center" color="white" variant="h3">
          DAO Members
        </Typography>
        <Box
          sx={{
            display: "flex",
            mt: 4,
            alignItems: "center",
            justifyContent: "flex-end"
          }}
        >
          <Button
            startIcon={<IosShareIcon />}
            variant="outlined"
            size="medium"
            color="offWhite"
          >
            Invite members
          </Button>
        </Box>
      </Box>

      {!isLoading && !data?.length && (
        <Box
          sx={{
            display: "flex",
            gap: "20px",
            mt: 12,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Typography color="rgb(107, 114, 128)" variant="subtitle2">
            There are no members on this community yet...
          </Typography>
        </Box>
      )}

      {isLoading ? (
        <CircularProgress className="spinner-center" size="60px" />
      ) : (
        <SwTabs
          tabPanelStyles={{
            border: "2px solid #439EDD"
          }}
          tabs={tabs}
        />
      )}
    </Container>
  );
}

export default memo(MembersAndActivities);
