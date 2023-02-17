/* eslint-disable max-len */
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Typography,
  styled
} from "@mui/material";
import { CommunityData } from "@store/Community/community.reducer";
import { useDispatch, useSelector } from "react-redux";
import { setTitle } from "@store/ui-reducer";
import { memo, useEffect } from "react";
import { UserInfo } from "@auth/auth.reducer";
import CopyAddress from "@components/CopyAddress";

import { ipfsCIDToHttpUrl } from "@api/storage.api";

const AutTable = styled("table")(({ theme }) => ({
  width: "100%",

  tr: {
    "&:first-of-type": {
      td: {
        borderTop: `1px solid ${theme.palette.divider}`
      }
    }
  },

  td: {
    padding: "20px 0",
    height: "32px",
    borderTop: "0",

    [theme.breakpoints.down("md")]: {
      padding: "10px 5px"
    },

    "&:not(:first-of-type)": {
      paddingLeft: "30px",
      [theme.breakpoints.down("md")]: {
        paddingLeft: "15px"
      }
    },
    borderBottom: `1px solid ${theme.palette.divider}`
  },

  th: {
    height: "32px",
    padding: "20px 0px",

    [theme.breakpoints.down("md")]: {
      padding: "10px 5px"
    },
    "&:not(:first-of-type)": {
      paddingLeft: "30px",
      [theme.breakpoints.down("md")]: {
        paddingLeft: "15px"
      }
    },
    borderBottom: `1px solid ${theme.palette.divider}`
  }
}));

const userStats = [
  {
    title: "Your Interactions",
    value: "0"
  },
  {
    title: "Your Open Tasks",
    value: "0"
  },
  {
    title: "Total Completed Tasks",
    value: "100"
  }
];

export const CommitmentMessages = (value: number) => {
  switch (+value) {
    case 1:
      return `Just lurking 👀`;
    case 2:
    case 3:
    case 4:
      return "gm gm ☕";
    case 5:
    case 6:
    case 7:
      return "Trusted seed 🌱";
    case 8:
    case 9:
    case 10:
      return `Soulbound ⛓️`;
    default:
      return `Minimum Commitment Level for new Members.`;
  }
};

const getGreeting = () => {
  const hour = new Date().getHours();
  const welcomeTypes = ["Good morning", "Good afternoon", "Good evening"];
  let welcomeText = "";
  if (hour < 12) welcomeText = welcomeTypes[0];
  else if (hour < 18) welcomeText = welcomeTypes[1];
  else welcomeText = welcomeTypes[2];
  return welcomeText;
};

function CommunityStatsValues(value, type) {
  switch (type) {
    case "commitment":
      return (
        <>
          <Typography
            variant="subtitle2"
            color="white"
            textAlign="end"
            fontWeight="normal"
            sx={{ pb: "5px", pr: "30px" }}
          >
            {`${value} - ${CommitmentMessages(value)}`}
          </Typography>
          {/* <Typography
            variant="subtitle2"
            color="white"
            textAlign="end"
            fontWeight="normal"
            sx={{ pb: "5px", pr: "30px" }}
          >
            {`${value}/10`}
          </Typography>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              paddingRight: "30px"
            }}
          >
            <Typography
              variant="caption"
              textAlign="center"
              color="white"
              style={{
                margin: "0"
              }}
            >
              {CommitmentMessages(+value)}
            </Typography>
          </div> */}
        </>
      );
    case "address":
      return (
        <div
          style={{
            paddingRight: "30px",
            paddingBottom: "5px",
            display: "flex",
            justifyContent: "flex-end"
          }}
        >
          <CopyAddress address={value} variant="subtitle2" />
        </div>
      );

    default:
      return (
        <Typography
          variant="subtitle2"
          color="white"
          textAlign="end"
          fontWeight="normal"
          sx={{ pb: "5px", pr: "30px" }}
        >
          {value}
        </Typography>
      );
  }
}

const Dashboard = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector(UserInfo);
  const community = useSelector(CommunityData);
  // const match = useRouteMatch();

  useEffect(() => {
    dispatch(
      setTitle(
        userInfo?.name
          ? `${getGreeting()}, ${userInfo?.name}`
          : `${getGreeting()}`
      )
    );
  }, [dispatch, userInfo]);

  const communityStats = [
    {
      title: "Beta Ranking",
      type: "number",
      value: "1"
    },
    {
      title: "Total Members",
      type: "number",
      value: "20"
    },
    {
      title: "Minimum Commitment",
      type: "commitment",
      value: community?.properties?.commitment
    },
    {
      title: "Nova Address",
      type: "address",
      value: community?.properties?.address
    },
    {
      title: "Legacy DAO",
      type: "address",
      value: community?.properties?.address
    }
  ];

  return (
    <Container
      maxWidth="sm"
      sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}
    >
      <Card
        sx={{
          maxWidth: {
            xs: "80%",
            md: "600px",
            xxl: "800px"
          },
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          background: "transparent",
          border: "none",
          boxShadow: "none"
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              sx={{
                height: {
                  xs: "120px",
                  xxl: "300px"
                },
                width: "100%"
              }}
              variant="square"
              srcSet={ipfsCIDToHttpUrl(community?.image as string)}
            />
          }
          sx={{
            alignItems: "flex-start",
            flexDirection: {
              xs: "column",
              md: "row"
            },
            ".MuiAvatar-root": {
              backgroundColor: "transparent"
            }
          }}
          title={
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gridGap: "4px"
                }}
              >
                <Typography variant="h3" color="white">
                  {community.name}
                </Typography>
                {/* <IconButton
                      component={Link}
                      to={`${match.url}/edit-community`}
                    >
                      <SvgIcon component={EditPencil} />
                    </IconButton> */}
              </Box>
              <CopyAddress
                address={community.properties.address}
                variant="subtitle2"
              />
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography color="white" variant="body" sx={{ mb: "20px" }}>
                  {community.properties.market}
                </Typography>
                <Typography color="white" variant="body">
                  {community.description}
                </Typography>
              </Box>
            </>
          }
        />
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <AutTable aria-label="table" cellSpacing="0">
            <tbody>
              {communityStats.map(({ title, value, type }, index) => (
                <tr key={`row-key-${index}`}>
                  <td>
                    <Typography
                      variant="subtitle2"
                      fontWeight="normal"
                      textAlign="start"
                      color="white"
                      sx={{ pb: "5px", pl: "30px" }}
                    >
                      {title}
                    </Typography>
                  </td>

                  <td>{CommunityStatsValues(value, type)}</td>
                </tr>
              ))}
            </tbody>
          </AutTable>
        </CardContent>
      </Card>
    </Container>
  );
};

export default memo(Dashboard);
