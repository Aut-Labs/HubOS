
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import { alpha, Badge, styled, SvgIcon } from "@mui/material";
import DashboardIcon from "@assets/dashboard.svg?react";
import ArchertypeIcon from "@assets/archetype.svg?react";
import AdminIcon from "@assets/admin.svg?react";
import { NavLink as RouteNavLink } from "react-router-dom";
import { forwardRef, Fragment } from "react";
import { pxToRem } from "@utils/text-size";

export interface SidebarMenuItem {
  title: string;
  route?: string;
  exact?: boolean;
  disabled?: boolean;
  badgeCounter?: number;
  icon?: any;
  children?: SidebarMenuItem[];
}

const menuItems = (hubName: string): SidebarMenuItem[] => [
  {
    title: "Home",
    route: `/${hubName}`,
    exact: true,
    icon: DashboardIcon
  },
  {
    title: "Your Archertype",
    route: `/${hubName}/your-archetype`,
    icon: ArchertypeIcon
  },
  {
    title: "Admins",
    route: `/${hubName}/admins`,
    icon: AdminIcon
  },
  {
    title: "Members",
    route: `/${hubName}/members`,
    icon: AdminIcon
  },
  {
    title: "Discord Bot",
    route: `/${hubName}/discord-bot`,
    icon: AdminIcon
  },
  {
    title: "Task Manager",
    route: `/${hubName}/task-manager`,
    icon: AdminIcon,
    children: [
      {
        title: "Contributions",
        route: `/${hubName}/contributions`,
        icon: AdminIcon
      }
    ]
  }
];

const AutMenuItem = styled(ListItem)(({ theme }) => ({
  height: pxToRem(45),
  borderRadius: "4px",
  cursor: "pointer",
  transition: theme.transitions.create(["background-color", "color"]),
  color: "rgba(255, 255, 255, 0.7)",
  fontFamily: "FractulAltBold",
  ".MuiListItemIcon-root": {
    transition: theme.transitions.create(["color"]),
    color: "rgba(255, 255, 255, 0.7)",
    svg: {
      transition: theme.transitions.create(["fill"]),
      fill: "rgba(255, 255, 255, 0.7)"
    }
  },
  "&.active-link, &:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.16),
    color: "white",
    ".MuiListItemIcon-root": {
      color: "white",
      svg: {
        fill: "white"
      }
    }
  }
}));

const NavLink = forwardRef<any, any>((props, ref) => {
  return (
    <RouteNavLink
      ref={ref}
      end={props.end}
      to={props.to}
      className={({ isActive }) =>
        `${props.className} ${isActive ? props.activeClassName : ""}`
      }
    >
      {props.children}
    </RouteNavLink>
  );
});

const autMenuItem = (menu: SidebarMenuItem, level = 0) => {
  return (
    <AutMenuItem
      sx={{
        paddingLeft: level === 0 ? "15px" : `${level * 15 + 15}px`
      }}
      {...(!menu.disabled &&
        menu.route && {
          end: menu.exact,
          component: NavLink,
          activeClassName: "active-link",
          to: menu.route
        })}
    >
      <ListItemIcon
        sx={{
          color: "inherit",
          pr: 1,
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
      {"badgeCounter" in menu ? (
        <>
          <Badge
            sx={{
              flex: 1,
              ".MuiBadge-badge": {
                fontSize: "14px",
                top: "10px",
                right: "22px",
                width: "25px",
                height: "25px",
                borderRadius: "50%"
              }
            }}
            color="primary"
            badgeContent={menu.badgeCounter}
            showZero
          >
            <Typography variant="body">{menu.title}</Typography>
          </Badge>
        </>
      ) : (
        <Typography variant="body">{menu.title}</Typography>
      )}
    </AutMenuItem>
  );
};

const childItems = (menu: SidebarMenuItem, level = 1) => {
  return menu.children.map((childMenu, childIndex) => {
    return (
      <Fragment
        key={`child-menu-item-${level}-${childMenu.title}-${childIndex}`}
      >
        {autMenuItem(childMenu, level)}
        {childMenu?.children && childItems(childMenu, level + 1)}
      </Fragment>
    );
  });
};

const MenuItems = ({ addonMenuItems = [], hubName }) => {
  return (
    <List
      sx={{
        width: "100%",
        flex: 1,
        p: 2,
        display: "flex",
        gridGap: "6px",
        flexDirection: "column"
      }}
      component="nav"
    >
      {[...menuItems(hubName), ...addonMenuItems].map((menu, index) => {
        return (
          <Fragment key={`menu-item-${menu.title}-${index}`}>
            {autMenuItem(menu)}
            {menu.children && childItems(menu)}
          </Fragment>
        );
      })}
    </List>
  );
};

export default MenuItems;
