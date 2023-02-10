/* eslint-disable max-len */
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import {
  CssBaseline,
  IconButton,
  SvgIcon,
  Toolbar,
  Typography,
  styled,
  useMediaQuery,
  useTheme
} from "@mui/material";
import MenuItems from "./MenuItems";
import { memo, useMemo, useState } from "react";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardTitle from "@components/AppTitle";
import { DautPlaceholder } from "@components/DautPlaceholder";
import { ReactComponent as AutWhiteIcon } from "@assets/aut/aut-white.svg";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useSelector } from "react-redux";
import { AppTitle } from "@store/ui-reducer";

const Main = styled("main", {
  shouldForwardProp: (prop) =>
    prop !== "open" && prop !== "drawerWidth" && prop !== "toolbarHeight"
})<{
  open?: boolean;
  drawerWidth: number;
  toolbarHeight: number;
}>(({ theme, open, drawerWidth, toolbarHeight }) => ({
  flexGrow: 1,
  position: "relative",
  marginTop: `${toolbarHeight}px`,
  padding: theme.spacing(3),
  [theme.breakpoints.up("md")]: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      }),
      marginLeft: 0
    })
  }
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
  drawerWidth: number;
  toolbarHeight: number;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) =>
    prop !== "open" && prop !== "drawerWidth" && prop !== "toolbarHeight"
})<AppBarProps>(({ theme, open, drawerWidth, toolbarHeight }) => ({
  border: 0,
  minHeight: `${toolbarHeight}px`,
  ".MuiToolbar-root": {
    minHeight: `${toolbarHeight}px`
  },
  [theme.breakpoints.up("md")]: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      })
    })
  }
}));

const SidebarDrawer = ({ children, addonMenuItems = [] }) => {
  const theme = useTheme();
  const appTitle = useSelector(AppTitle);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isExtraLarge = useMediaQuery(theme.breakpoints.up("xxl"));
  const [open, setOpen] = useState(!isMobile);

  const drawerWidth = useMemo(() => {
    return isExtraLarge ? 350 : 280;
  }, [isExtraLarge]);

  const toolbarHeight = useMemo(() => {
    return isExtraLarge ? 92 : 72;
  }, [isExtraLarge]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <CssBaseline />
      <AppBar
        sx={{
          boxShadow: 2
        }}
        toolbarHeight={toolbarHeight}
        drawerWidth={drawerWidth}
        position="fixed"
        open={open}
      >
        <Toolbar
          sx={{
            minHeight: `${toolbarHeight}px`,
            backgroundColor: "nightBlack.main",
            border: 0
          }}
        >
          <IconButton
            color="offWhite"
            onClick={handleDrawerToggle}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="subtitle2" noWrap color="white">
            {appTitle}
          </Typography>
          <span
            style={{
              flex: 1
            }}
          ></span>

          <DautPlaceholder styles={{ top: "8px" }} hide={false} />
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={open}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          boxShadow: open ? 2 : 0,
          height: "100vh",
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            backgroundColor: "nightBlack.main",
            borderTop: 0,
            borderBottom: 0,
            borderLeft: 0,
            borderRight: 0,
            // borderColor: theme.palette.offWhite.main,
            width: drawerWidth,
            boxSizing: "border-box"
          }
        }}
      >
        <DrawerHeader
          sx={{
            mb: 4,
            minHeight: `${toolbarHeight}px !important`
          }}
        >
          <DashboardTitle variant="subtitle1" />
        </DrawerHeader>
        <MenuItems addonMenuItems={addonMenuItems} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 2
          }}
        >
          <SvgIcon
            sx={{
              height: "30px",
              width: "100%"
            }}
            component={AutWhiteIcon}
            inheritViewBox
          />
        </Box>
      </Drawer>
      <Main toolbarHeight={toolbarHeight} drawerWidth={drawerWidth} open={open}>
        <PerfectScrollbar
          options={{
            suppressScrollX: true,
            useBothWheelAxes: false,
            swipeEasing: true
          }}
        >
          {children}
        </PerfectScrollbar>
      </Main>
    </Box>
  );
};

export default memo(SidebarDrawer);
