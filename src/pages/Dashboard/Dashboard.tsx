import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from "@mui/material";
import { CommunityData } from "@store/Community/community.reducer";
import { pxToRem } from "@utils/text-size";
import { useDispatch, useSelector } from "react-redux";
import { setTitle } from "@store/ui-reducer";
import { useEffect } from "react";
import { UserInfo } from "@auth/auth.reducer";
import SwGrid from "@components/SwGrid";
import { styled } from "@mui/system";

const Stat = styled("div")({
  width: "100%",
  height: pxToRem(80),
  borderStyle: "solid",
  borderWidth: "1px",
  borderTopColor: "white",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: `0 ${pxToRem(40)}`,
  margin: "0 auto",
  "&.stat:last-child": {
    borderBottomColor: "white",
  },
});

const StatWrapper = styled("div")({
  maxWidth: pxToRem(670),
  minWidth: pxToRem(670),
  margin: "0 auto",
});

const userStats = [
  {
    title: "Your Interactions",
    value: "0",
  },
  {
    title: "Your Open Tasks",
    value: "0",
  },
  {
    title: "Total Completed Tasks",
    value: "0",
  },
];

const communityStats = [
  {
    title: "Total Members",
    value: "0",
  },
  {
    title: "Total Members",
    value: "0",
  },
  {
    title: "Total Members",
    value: "0",
  },
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector(UserInfo);
  const community = useSelector(CommunityData);

  console.log(community, "community");

  useEffect(() => {
    dispatch(setTitle(`Good Morning, ${userInfo?.name}`));
  }, [dispatch, userInfo]);

  return (
    <SwGrid
      left={
        <>
          <div
            className="sw-user-info"
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Avatar
              className="sw-profile-pic"
              variant="square"
              src={userInfo?.image}
              sx={{
                width: pxToRem(150),
                height: pxToRem(150),
                margin: "0 auto",
              }}
            />
            <Typography
              sx={{
                color: "white",
                textAlign: "center",
                mb: pxToRem(15),
                fontSize: pxToRem(50),
              }}
              component="div"
            >
              {userInfo?.name}
            </Typography>

            <Typography
              sx={{
                color: "white",
                textAlign: "center",
                fontSize: pxToRem(21),
                mb: pxToRem(70),
              }}
              component="div"
            >
              {community.properties?.userData?.roleName}
            </Typography>

            <StatWrapper>
              {userStats.map(({ title, value }) => (
                <Stat className="stat">
                  <Typography
                    sx={{ color: "white", fontSize: pxToRem(21) }}
                    component="div"
                  >
                    {title}
                  </Typography>
                  <Typography
                    sx={{ color: "white", fontSize: pxToRem(21) }}
                    component="div"
                  >
                    {value}
                  </Typography>
                </Stat>
              ))}
            </StatWrapper>
          </div>
        </>
      }
      right={
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Card
            sx={{
              maxWidth: pxToRem(585),
              width: "100%",
              margin: "0 auto",
              p: pxToRem(50),
              display: "flex",
              flexDirection: "column",
              background: "#000",
              borderImage:
                "linear-gradient(45deg, #009fe3 0%, #0399de 8%, #0e8bd3 19%, #2072bf 30%, #3a50a4 41%, #5a2583 53%, #453f94 71%, #38519f 88%, #3458a4 100%) 1",
              borderWidth: "5px",
            }}
          >
            <CardHeader
              avatar={
                <Avatar
                  sx={{
                    height: pxToRem(75),
                    width: pxToRem(75),
                    border: "1px solid white",
                  }}
                  variant="square"
                  src={community?.image as string}
                />
              }
              sx={{
                ".MuiAvatar-root": {
                  backgroundColor: "transparent",
                },
              }}
              title={
                <>
                  <Typography
                    sx={{ color: "white" }}
                    component="div"
                    fontSize={pxToRem(32)}
                  >
                    {community.name}
                  </Typography>
                  <Typography
                    sx={{ color: "white" }}
                    component="div"
                    fontSize={pxToRem(19)}
                  >
                    {community.properties.market}
                  </Typography>
                </>
              }
              // titleTypographyProps={{
              //   mx: 'auto',
              //   variant: 'h3',
              //   color: 'primary.main',
              //   mt: '6px',
              // }}
            />
            <CardContent
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Typography
                color="white"
                marginBottom={pxToRem(30)}
                fontSize={pxToRem(18)}
                component="div"
              >
                {community.description}
              </Typography>
              {communityStats.map(({ title, value }) => (
                <Stat className="stat">
                  <Typography
                    sx={{ color: "white", fontSize: pxToRem(21) }}
                    component="div"
                  >
                    {title}
                  </Typography>
                  <Typography
                    sx={{ color: "white", fontSize: pxToRem(21) }}
                    component="div"
                  >
                    {value}
                  </Typography>
                </Stat>
              ))}
            </CardContent>
          </Card>
        </div>
      }
    />
  );
};

export default Dashboard;
