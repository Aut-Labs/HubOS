/* eslint-disable max-len */
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  styled,
  tableCellClasses
} from "@mui/material";
import { CommunityData } from "@store/Community/community.reducer";
import { useDispatch, useSelector } from "react-redux";
import { setTitle } from "@store/ui-reducer";
import { memo, useEffect } from "react";
import { UserInfo } from "@auth/auth.reducer";
import CopyAddress from "@components/CopyAddress";

import { ipfsCIDToHttpUrl } from "@api/storage.api";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  width: "100%",
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover
  },
  "&:last-child td, &:last-child th": {
    border: 0
  }
}));

const TaskStyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}, &.${tableCellClasses.body}`]: {
    color: theme.palette.common.white,
    borderColor: theme.palette.divider
  }
}));

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
          <Typography variant="subtitle2" color="white" fontWeight="normal">
            {`${value} - ${CommitmentMessages(value)}`}
          </Typography>
        </>
      );
    case "address":
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end"
          }}
        >
          <CopyAddress address={value} />
        </div>
      );

    default:
      return (
        <Typography variant="subtitle2" color="white" fontWeight="normal">
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
            xs: "100%",
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
              <CopyAddress address={community.properties.address} />
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
          <TableBody
            sx={{
              display: "table",
              ".MuiTableBody-root > .MuiTableRow-root:hover": {
                backgroundColor: "#ffffff0a"
              }
            }}
          >
            <StyledTableRow>
              <TaskStyledTableCell>
                <Typography
                  variant="subtitle2"
                  fontWeight="normal"
                  color="white"
                >
                  Beta Ranking
                </Typography>
              </TaskStyledTableCell>
              <TaskStyledTableCell align="right">1</TaskStyledTableCell>
            </StyledTableRow>
            <StyledTableRow>
              <TaskStyledTableCell>
                <Typography
                  variant="subtitle2"
                  fontWeight="normal"
                  color="white"
                >
                  Total Members
                </Typography>
              </TaskStyledTableCell>
              <TaskStyledTableCell align="right">22</TaskStyledTableCell>
            </StyledTableRow>
            <StyledTableRow>
              <TaskStyledTableCell>
                <Typography
                  variant="subtitle2"
                  fontWeight="normal"
                  color="white"
                >
                  Minimum Commitment
                </Typography>
              </TaskStyledTableCell>
              <TaskStyledTableCell align="right">
                {`${community?.properties?.commitment} - ${CommitmentMessages(
                  community?.properties?.commitment
                )}`}
              </TaskStyledTableCell>
            </StyledTableRow>
            <StyledTableRow>
              <TaskStyledTableCell>
                <Typography
                  variant="subtitle2"
                  fontWeight="normal"
                  color="white"
                >
                  Nova Address
                </Typography>
              </TaskStyledTableCell>
              <TaskStyledTableCell align="right">
                <CopyAddress address={community?.properties?.address} />
              </TaskStyledTableCell>
            </StyledTableRow>
            <StyledTableRow>
              <TaskStyledTableCell>
                <Typography
                  variant="subtitle2"
                  fontWeight="normal"
                  color="white"
                >
                  Legacy DAO
                </Typography>
              </TaskStyledTableCell>
              <TaskStyledTableCell align="right">
                <CopyAddress address={community?.properties?.address} />
              </TaskStyledTableCell>
            </StyledTableRow>
          </TableBody>
        </CardContent>
      </Card>
    </Container>
  );
};

export default memo(Dashboard);
