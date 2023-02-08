/* eslint-disable max-len */
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import { SwScrollbar } from "sw-web-shared";
import { ReactComponent as AutLogo } from "@assets/aut/logo.svg";
import {
  Avatar,
  Collapse,
  Container,
  CssBaseline,
  styled,
  SvgIcon,
  Toolbar
} from "@mui/material";
import { ReactComponent as ManageIcon } from "@assets/manage.svg";
import { ReactComponent as DashboardIcon } from "@assets/dashboard.svg";
import { NavLink, useLocation } from "react-router-dom";
import { Fragment, useState } from "react";
import { pxToRem } from "@utils/text-size";
import { useSelector } from "react-redux";
import { CommunityData } from "@store/Community/community.reducer";
import { AutButton } from "./buttons";
import CommunitySwitcherPopup from "./Dialog/CommunitySwitcherPopup";
import { ipfsCIDToHttpUrl } from "@api/storage.api";

const menuItems: any[] = [
  {
    title: "Home",
    route: "/aut-dashboard",
    exact: true,
    icon: DashboardIcon
  },
  // {
  //   title: "Integrations & Contracts",
  //   route: "/aut-dashboard/integrations-and-contracts",
  //   icon: IntegrationIcon
  // },
  {
    title: "DAO Management",
    icon: ManageIcon,
    children: [
      {
        title: "- Members",
        route: "/aut-dashboard/members"
      }
      // {
      //   title: "- Roles",
      //   route: "/aut-dashboard/roles"
      // },
      // {
      //   title: "- Share",
      //   route: "/aut-dashboard/share"
      // }
    ]
  }
  // {
  //   title: "Community Events",
  //   route: "/aut-dashboard/event-factory",
  //   icon: TasksIcon
  // children: [
  //   {
  //     title: '- Community Calls',
  //     route: '/aut-dashboard/event-factory/group-call',
  //   },
  //   {
  //     title: '- Polls',
  //     route: '/aut-dashboard/event-factory/polls',
  //   },
  // ],
  // }
  // {
  //   title: "Tasks",
  //   route: "/aut-dashboard/tasks",
  //   icon: Tasks,
  //   children: [
  //     {
  //       title: "- All Tasks",
  //       route: "/aut-dashboard/tasks",
  //       icon: EditIcon,
  //     },
  //     {
  //       title: "- Your Tasks",
  //       route: "/aut-dashboard/your-tasks",
  //       icon: YourTasks,
  //     },
  //   ],
  // },
];

const toolbarHeight = 160;

const AutDrawer = styled(Drawer)(({ theme }) => ({
  width: "350px",
  flexShrink: 0,
  [`& .MuiDrawer-paper`]: {
    backgroundColor: "transparent",
    width: "350px",
    marginTop: 0,
    position: "relative",
    boxSizing: "border-box",
    borderColor: theme.palette.offWhite.main,
    borderRightWidth: "1px",
    borderLeftWidth: "0",
    borderTop: 0,
    borderBottom: 0
  }
}));

const AutMenuItem = styled<any>(ListItem)(({ menu, theme }) => ({
  border: 0,
  height: pxToRem(60),
  paddingTop: 0,
  paddingBottom: 0,
  borderLeft: "0",
  borderTop: "1px",
  ...(!menu.children?.length && {
    borderBottom: "1px"
  }),
  borderStyle: "solid",
  borderColor: theme.palette.offWhite.main,
  letterSpacing: "1.25px",
  background: `linear-gradient(to left, transparent 50%, #6FA1C3 50%) right`,
  backgroundSize: "200%",
  transition: ".2s ease-out",
  "&.active-group-link, &.active-child-route": {
    borderColor: "#439EDD",
    "+ .MuiCollapse-root": {
      borderColor: "#439EDD"
    }
  },
  "&:not(.active-child-route).active-group-link": {
    backgroundPosition: "left"
  }
}));

const AutChildMenuItem = styled<any>(ListItem)(({ menu }) => ({
  py: pxToRem(10),
  width: "100%",
  height: pxToRem(40),
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: pxToRem(50),
  letterSpacing: "1.25px",
  background: `linear-gradient(to left, transparent 50%, #6FA1C3 50%) right`,
  backgroundSize: "200%",
  transition: ".2s ease-out",
  "&.active-link": {
    backgroundPosition: "left",
    ".MuiTypography-root": {
      color: "white"
    }
  }
}));

export default function SidebarDrawer({ children }) {
  const location = useLocation();
  const isInChildRoute = (menu) => {
    const isIn =
      menu?.children?.length &&
      (menu?.children as any[]).some(({ route }) =>
        location.pathname.includes(route)
      );
    return isIn;
  };

  const menuContent = (
    <>
      <List sx={{ width: "100%", flex: 1 }} component="nav">
        {menuItems.map((menu, index) => {
          const routeParams =
            menu.disabled || !menu.route
              ? {}
              : {
                  component: NavLink,
                  activeClassName: "active-group-link",
                  to: menu.route,
                  exact: menu.exact
                };
          return (
            <Fragment key={`menu-item-${menu.title}-${index}`}>
              <AutMenuItem
                menu={menu}
                className={`${
                  isInChildRoute(menu) ? "active-child-route" : ""
                }`}
                disabled={menu.disabled}
                {...routeParams}
              >
                <ListItemIcon
                  sx={{
                    color: "white",
                    pr: 2,
                    minWidth: "auto"
                  }}
                >
                  <SvgIcon
                    sx={{
                      height: pxToRem(19),
                      width: pxToRem(19)
                    }}
                    component={menu.icon}
                    inheritViewBox
                  />
                </ListItemIcon>
                <Typography
                  sx={{ color: "white" }}
                  component="div"
                  fontSize={pxToRem(20)}
                >
                  {menu.title}
                </Typography>
              </AutMenuItem>
              {menu.children && (
                <Collapse
                  in
                  sx={{
                    border: 0,
                    pb: "2px",
                    borderLeft: "0",
                    borderBottom: "1px",
                    borderStyle: "solid",
                    borderColor: "transparent"
                  }}
                >
                  <List component="div" disablePadding>
                    {menu.children.map((childMenu, childIndex) => {
                      return (
                        <AutChildMenuItem
                          component={NavLink}
                          activeClassName="active-link"
                          to={childMenu.route}
                          key={`child-menu-item-${childMenu.title}-${childIndex}`}
                        >
                          <Typography
                            sx={{ color: "white" }}
                            component="div"
                            fontSize={pxToRem(20)}
                          >
                            {childMenu.title}
                          </Typography>
                        </AutChildMenuItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </Fragment>
          );
        })}
      </List>
    </>
  );

  return (
    <>
      <CssBaseline />
      <AutDrawer
        variant="permanent"
        sx={{
          position: "relative"
        }}
      >
        {menuContent}

        {/* <AutSelectField
          sx={{
            "&.MuiOutlinedInput-root, &.MuiInput-underline": {
              width: "100%",
              height: pxToRem(70),
            },
          }}
          renderValue={(v: string) => {
            const community = communities.find((c) => (c.name = v));
            return (
              <Avatar
                variant="square"
                sx={{
                  width: "40px",
                  height: "40px",
                  border: "1px solid",
                  backgroundColor: "white",
                }}
                src={community.image as string}
              />
            );
          }}
          width="200"
        >
          {communities &&
            communities.map((r, index) => (
              <MenuItem
                key={`role-option-key-${r.name}-${index}`}
                value={r.name}
              >
                {r.name}
              </MenuItem>
            ))}
        </AutSelectField> */}
      </AutDrawer>
      <Box
        component="main"
        sx={{
          height: "100%",
          flexGrow: 1,
          p: "0"
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: "100%",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <SwScrollbar
            sx={{
              height: `calc(100% - 160px)`,
              flex: 1,
              p: 0
            }}
          >
            <Container
              className="main-container"
              maxWidth={false}
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
              disableGutters
            >
              {children}
            </Container>
          </SwScrollbar>
        </Box>
      </Box>
    </>
  );
}
