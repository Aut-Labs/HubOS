import { Route, Switch } from "react-router-dom";
import SidebarDrawer from "@components/Sidebar";
import NotFound from "@components/NotFound";
import Dashboard from "./Dashboard/Dashboard";
import CreateTask from "./EventFactory/CreateTask/CreateTask";
import GroupCall from "./EventFactory/GroupCall/GroupCall";
import Polls from "./EventFactory/Polls/Polls";
import SuccessStep from "./EventFactory/CreateTask/SuccessStep/SuccessStep";
import Tasks from "./EventFactory/Tasks/Tasks";
import YourTasks from "./EventFactory/Tasks/YourTasks";
import TaskDetails from "./EventFactory/Tasks/TaskDetails";
import TaskSubmit from "./EventFactory/Tasks/TaskSubmit";
import TaskFinalise from "./EventFactory/Tasks/TaskFinalise";
import UserProfile from "./UserProfile/UserProfile";
import CommunityEdit from "./CommunityEdit/CommunityEdit";
import MembersAndActivities from "./MemberAndActivities/MembersAndActivities";
import { Box, Toolbar, Typography } from "@mui/material";
import { DautPlaceholder } from "@components/DautPlaceholder";
import { useSelector } from "react-redux";
import { CommunityData } from "@store/Community/community.reducer";
import { AppTitle } from "@store/ui-reducer";
import { useState } from "react";

const AutDashboard = (props) => {
  const appTitle = useSelector(AppTitle);
  const community = useSelector(CommunityData);
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* <CommunitySwitcherPopup open={open} onClose={() => setOpen(false)} /> */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: {
            xs: "0",
            md: "0 0 0 50px"
          }
        }}
      >
        <Toolbar
          sx={{
            p: "0px !important",
            minHeight: {
              xs: "160px !important",
              xxl: "160px !important"
            },
            height: {
              xs: "160px",
              xxl: "160px"
            }
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column"
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row"
              }}
              mb={{
                xs: "0",
                md: "20px"
              }}
            >
              <Typography m="0" color="white" variant="h2" fontWeight="bold">
                Aut
              </Typography>
              <Typography variant="h2">&nbsp;</Typography>
              <Typography
                m="0"
                color="white"
                variant="h2"
                fontWeight="normal"
                fontFamily="FractulAltLight"
              >
                <span>Dashboard</span>
              </Typography>
            </Box>
            <Box
              sx={{ width: "100%", display: "flex", alignItems: "flex-end" }}
            >
              <Typography
                m="0"
                color="white"
                variant="subtitle2"
                fontWeight="bold"
              >
                {appTitle}
              </Typography>

              {/* community switcher button */}

              {/* <Button
                onClick={() => setOpen(true)}
                sx={{
                  height: "50px",
                  border: "3px solid white",
                  ml: "15px",
                  "&.MuiButton-root": {}
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gridGap: "10px"
                  }}
                >
                  <Avatar
                    sx={{
                      width: "50px",
                      height: "50px"
                    }}
                    src={ipfsCIDToHttpUrl(community.image as string)}
                  />

                  <Typography
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "200px"
                    }}
                    variant="button"
                    color="white"
                  >
                    {community?.name}
                  </Typography>
                </div>

                <SvgIcon
                  sx={{
                    height: "30px",
                    width: "30px",
                    mt: "6px",
                    ml: "10px"
                  }}
                  component={SwitcherIcon}
                />
              </Button> */}
            </Box>
          </div>
          <DautPlaceholder styles={{ top: "40px" }} hide={false} />
        </Toolbar>
        <Box
          sx={{
            display: "flex",
            flex: "1"
          }}
        >
          <SidebarDrawer>
            <Switch>
              {/* Aut Dashboard */}
              <Route
                exact
                path="/aut-dashboard"
                component={Dashboard}
                {...props}
              />
              <Route
                path="/aut-dashboard/edit-community"
                component={CommunityEdit}
                {...props}
              />

              {/* Core Team Routes */}
              {/* <Route exact path="/aut-dashboard/core-team" component={CoreTeam} {...props} /> */}
              <Route
                exact
                path="/aut-dashboard/members"
                render={() => <MembersAndActivities {...props} />}
              />
              <Route
                exact
                path="/aut-dashboard/members/:memberAddress"
                component={UserProfile}
              />
              {/* <Route
            exact
            path="/aut-dashboard/roles"
            render={() => <Roles {...props} isCoreTeam />}
          /> */}
              {/* <Route
            exact
            path="/aut-dashboard/share"
            component={AutCommunityShare}
            {...props}
          /> */}

              {/* Aut Dashboard > Integration and contracts */}
              {/* <Route
            exact
            path="/aut-dashboard/integrations-and-contracts"
            component={Integrations}
            {...props}
          /> */}
              {/* <Route
            exact
            path="/aut-dashboard/integrations-and-contracts/dao-integration"
            component={DaoIntegration}
            {...props}
          /> */}
              {/* <Route
            exact
            path="/aut-dashboard/integrations-and-contracts/discord-integration"
            component={DiscordIntegration}
            {...props}
          /> */}
              {/* <Route
            exact
            path="/aut-dashboard/integrations-and-contracts/contracts"
            component={Contracts}
            {...props}
          /> */}

              {/* Aut Dashboard > Event factory */}
              {/* <Route
            exact
            path="/aut-dashboard/event-factory"
            component={EventFactory}
            {...props}
          /> */}
              <Route
                path="/aut-dashboard/event-factory/create-task"
                component={CreateTask}
                {...props}
              />
              <Route
                path="/aut-dashboard/event-factory/group-call"
                component={GroupCall}
                {...props}
              />
              <Route
                path="/aut-dashboard/event-factory/polls"
                component={Polls}
                {...props}
              />
              <Route
                path="/aut-dashboard/event-factory/create-task-success"
                component={SuccessStep}
                {...props}
              />

              {/* Aut Dashboard > Tasks */}
              <Route
                exact
                path="/aut-dashboard/tasks"
                component={Tasks}
                {...props}
              />
              <Route
                exact
                path="/aut-dashboard/your-tasks"
                component={YourTasks}
                {...props}
              />
              <Route
                exact
                path="/aut-dashboard/tasks/:taskActivityId"
                component={TaskDetails}
                {...props}
              />
              <Route
                exact
                path="/aut-dashboard/tasks/finalise/:taskActivityId"
                component={TaskFinalise}
                {...props}
              />
              <Route
                path="/aut-dashboard/tasks/:taskActivityId/submit"
                component={TaskSubmit}
                {...props}
              />

              <Route component={NotFound} />
            </Switch>
          </SidebarDrawer>
        </Box>
      </Box>
    </>
  );
};

export default AutDashboard;
