import { useEffect, memo, useMemo, useState } from "react";
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
  styled,
  useTheme
} from "@mui/material";
import { setTitle } from "@store/ui-reducer";
import { ipfsCIDToHttpUrl } from "@api/storage.api";
import LoadingProgressBar from "@components/LoadingProgressBar";
import AutLoading from "@components/AutLoading";
import { autUrls } from "@api/environment";
import AutTabs from "@components/AutTabs/AutTabs";
import { useSelector } from "react-redux";
import { HubData } from "@store/Hub/hub.reducer";
import { AutIDProperties, DAutAutID } from "@aut-labs/d-aut";
import useQueryHubMembers from "@hooks/useQueryHubMembers";
import HubOsTabs from "@components/HubOsTabs";
import HubMemberCard from "./HubMemberCard";
import { HubOSAutID } from "@api/aut.model";

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

const MemberCard = memo(
  ({ member, isFetching }: { member: DAutAutID; isFetching: boolean }) => {
    const urls = autUrls();
    return (
      <>
        <GridCardWrapper>
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
                  Hub Role
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
  const theme = useTheme();
  return (
    <Box
      sx={{
        marginTop: theme.spacing(3),
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
          md: "1fr 1fr",
          xl: "1fr 1fr 1fr",
          xxl: "1fr 1fr 1fr"
        },
        ml: {
          xs: theme.spacing(3),
          md: 0
        },
        mr: {
          xs: theme.spacing(3),
          md: theme.spacing(2)
        },
        gap: {
          xs: theme.spacing(2),
          md: theme.spacing(3),
          xl: theme.spacing(4),
          xxl: theme.spacing(4)
        }
      }}
    >
      {members?.map((member, index) => (
        <HubMemberCard key={`role-item-${member?.name}`} member={member} />
      ))}
    </Box>
  );
};

const Members = ({ members, isLoading }: { members: HubOSAutID<AutIDProperties>[], isLoading: boolean }) => {
  const dispatch = useAppDispatch();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  useEffect(() => {
    dispatch(setTitle(`Hub - Members & Roles in your Hub.`));
  }, [dispatch]);

  const hubData = useSelector(HubData);

  const tabs = useMemo(() => {
    const roles = hubData.roles;
    const initializedTabs = roles.reduce((tab, role) => {
      const key = role.roleName;
      tab[key] = [];
      return tab;
    }, {});

    const groupedMembers = members?.reduce((group, member) => {
      const joinedHub = member.joinedHub(hubData.properties.address);
      const roleName = hubData.roleName(+joinedHub?.role);
      if (!group[roleName]) {
        group[roleName] = [];
      }
      group[roleName].push(member);
      return group;
    }, initializedTabs);
    // set tab that has at least one member
    setSelectedTabIndex(
      Object.keys(groupedMembers).findIndex(
        (role) => groupedMembers[role].length > 0
      )
    );
    return generateMemberTabs(groupedMembers);
  }, [hubData, members]);

  return (
    <Container maxWidth="md" sx={{ py: "20px" }}>
      <LoadingProgressBar isLoading={isLoading} />
      {/* <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          position: "relative"
        }}
      >
        <Typography textAlign="center" color="white" variant="h3">
          Hub Members
        </Typography>
        <Box
          sx={{
            display: "flex",
            mt: 4,
            alignItems: "center",
            justifyContent: "flex-end"
          }}
        >
        </Box>
      </Box> */}

      {!isLoading && !members?.length && (
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
            There are no contributors in this hub yet...
          </Typography>
        </Box>
      )}

      {isLoading ? (
        <AutLoading width="130px" height="130px" />
      ) : (
        <HubOsTabs selectedTabIndex={selectedTabIndex} tabs={tabs} />
      )}
    </Container>
  );
}

export default memo(Members);
