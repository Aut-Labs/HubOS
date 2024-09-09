import { useEffect, memo, useMemo } from "react";
import Box from "@mui/material/Box";
import { useAppDispatch } from "@store/store.model";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Stack,
  Typography,
  styled
} from "@mui/material";
import { setTitle } from "@store/ui-reducer";
import { useGetAllMembersQuery } from "@api/community.api";
import { ipfsCIDToHttpUrl } from "@api/storage.api";
import LoadingProgressBar from "@components/LoadingProgressBar";
import AutLoading from "@components/AutLoading";
import { autUrls } from "@api/environment";
import AutTabs from "@components/AutTabs/AutTabs";
import { useSelector } from "react-redux";
import { CommunityData } from "@store/Community/community.reducer";
import { DAutAutID } from "@aut-labs/d-aut";

const generateMemberTabs = (members: { [role: string]: DAutAutID[] }) => {
  return Object.keys(members || []).reduce((prev, curr) => {
    const item = members[curr];
    if (Array.isArray(item)) {
      prev = [
        ...prev,
        {
          label: curr,
          props: {
            members: item
          },
          component: MembersList
        }
      ];
    }
    return prev;
  }, []);
};

const GridBox = styled(Box)(({ theme }) => {
  return {
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "1fr",
    gridGap: "30px",
    [theme.breakpoints.up("sm")]: {
      gridTemplateColumns: "repeat(2,minmax(0,1fr))"
    },
    [theme.breakpoints.up("md")]: {
      gridTemplateColumns: "repeat(3,minmax(0,1fr))"
    },
    [theme.breakpoints.up("lg")]: {
      gridTemplateColumns: "repeat(4,minmax(0,1fr))"
    }
  };
});

const GridCard = styled(Card)(({ theme }) => {
  return {
    minHeight: "340px",
    width: "100%"
  };
});

const GridCardWrapper = styled("div")(({ theme }) => {
  return {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: theme.transitions.create(["transform"]),
    "&:hover": {
      transform: "scale(1.019)"
    }
  };
});

const MemberType = styled(Chip)(({ theme }) => {
  return {
    position: "absolute",
    top: "-14px",
    minWidth: "120px",
    height: "28px"
  };
});

const MemberCard = memo(
  ({ member, isFetching }: { member: DAutAutID; isFetching: boolean }) => {
    const urls = autUrls();
    return (
      <>
        <GridCardWrapper>
          {/* <MemberType
            label={member.properties?.isAdmin ? "Admin" : "Member"}
            color="primary"
          /> */}
          <GridCard
            sx={{
              bgcolor: "nightBlack.main",
              borderColor: "divider",
              borderRadius: "16px",
              boxShadow: 3
            }}
            variant="outlined"
          >
            <CardHeader
              sx={{
                m: 0,
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                ".MuiCardHeader-avatar": {
                  m: 0,
                  mt: 2
                },
                ".MuiCardHeader-content": {
                  display: "none"
                }
              }}
              avatar={
                <Avatar
                  variant="square"
                  sx={{
                    borderColor: "divider",
                    borderWidth: "2px",
                    borderStyle: "solid",
                    width: "140px",
                    height: "140px"
                  }}
                  srcSet={ipfsCIDToHttpUrl(member.image as string)}
                />
              }
            />
            <CardContent>
              <Stack direction="column">
                <Typography
                  fontFamily="FractulAltBold"
                  color="offWhite.main"
                  variant="subtitle2"
                >
                  {member.name}
                </Typography>
                <Typography variant="caption" color="primary">
                  ĀutID
                </Typography>
              </Stack>
              <Stack direction="column">
                <Typography
                  fontFamily="FractulAltBold"
                  color="offWhite.main"
                  variant="subtitle2"
                >
                  {/* {member?.properties.role?.roleName} */}
                </Typography>
                <Typography variant="caption" color="primary">
                  DAO Role
                </Typography>
              </Stack>
              <Stack direction="column">
                <Typography
                  fontFamily="FractulAltBold"
                  color="offWhite.main"
                  variant="subtitle2"
                >
                  {/* {`${member?.properties?.commitment || 0} - ${
                    member?.properties?.commitmentDescription
                  }`} */}
                </Typography>
                <Typography variant="caption" color="primary">
                  Commitment level
                </Typography>
              </Stack>
            </CardContent>
            <CardActions
              sx={{
                justifyContent: "center",
                borderTop: "1px solid",
                borderColor: "divider"
              }}
            >
              <Button
                target="_blank"
                href={`${urls.myAut}${
                  member.name || member.properties.address
                }`}
                color="offWhite"
              >
                View profile
              </Button>
            </CardActions>
          </GridCard>
        </GridCardWrapper>
      </>
    );
  }
);

const MembersList = ({ members = [] }: { members: DAutAutID[] }) => {
  return (
    <>
      {members.length ? (
        <GridBox sx={{ flexGrow: 1, mt: 6 }}>
          {members.map((member, index) => (
            <MemberCard
              key={`member-plugin-${index}`}
              member={member}
              isFetching={false}
            />
          ))}
        </GridBox>
      ) : (
        <Box
          sx={{
            display: "flex",
            p: "10px 30px 30px 30px",
            mt: "48px",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Typography color="rgb(107, 114, 128)" variant="subtitle2">
            There are no contributors with this role yet...
          </Typography>
        </Box>
      )}
    </>
  );
};

function Members() {
  const dispatch = useAppDispatch();

  const { data, isLoading, isFetching } = useGetAllMembersQuery(null, {
    refetchOnMountOrArgChange: true,
    skip: false
  });

  useEffect(() => {
    dispatch(setTitle(`DAO - Members & Roles in your Community.`));
  }, [dispatch]);

  const community = useSelector(CommunityData);
  const initializedTabs = community?.properties.rolesSets[0].roles.reduce(
    (tab, role) => {
      const key = role.roleName;
      tab[key] = [];
      return tab;
    },
    {}
  );

  const tabs = useMemo(() => {
    const groupedMembers = data?.reduce((group, member) => {
      // const key = member.properties.role.roleName;
      // if (!group[key]) {
      //   group[key] = [];
      // }
      // group[key].push(member);
      return group;
    }, initializedTabs);

    return generateMemberTabs(groupedMembers);
  }, [data]);

  return (
    <Container maxWidth="lg" sx={{ py: "20px" }}>
      <LoadingProgressBar isLoading={isFetching} />
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
          {/* <Button
            startIcon={<IosShareIcon />}
            variant="outlined"
            size="medium"
            color="offWhite"
          >
            Invite contributors
          </Button> */}
        </Box>
      </Box>

      {/* {!isLoading && !data?.length && (
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
            There are no contributors in this community yet...
          </Typography>
        </Box>
      )} */}

      {isLoading ? (
        <AutLoading width="130px" height="130px" />
      ) : (
        <AutTabs
          // tabStyles={{
          //   border: "2px solid #439EDD"
          // }}
          tabs={tabs}
        />
      )}
    </Container>
  );
}

export default memo(Members);
