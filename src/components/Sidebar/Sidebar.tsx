/* eslint-disable max-len */
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import {
  CssBaseline,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
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
import CloseIcon from "@mui/icons-material/Close";
import DashboardTitle from "@components/AppTitle";
import { ReactComponent as AutWhiteIcon } from "@assets/aut/aut-white.svg";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useSelector } from "react-redux";
import { AppTitle } from "@store/ui-reducer";
import { SelectedNetworkConfig } from "@store/WalletProvider/WalletProvider";
import { CommunityData } from "@store/Community/community.reducer";
import { UserInfo } from "@auth/auth.reducer";
import { DautPlaceholder } from "@api/ProviderFactory/web3-daut-connect";

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
  // padding: theme.spacing(3),
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
  justifyContent: "flex-start",
  padding: theme.spacing(0, 2),
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
  const community = useSelector(CommunityData);
  const userInfo = useSelector(UserInfo);
  const network = useSelector(SelectedNetworkConfig);
  const appTitle = useSelector(AppTitle);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isExtraLarge = useMediaQuery(theme.breakpoints.up("xxl"));
  const [open, setOpen] = useState(!isMobile);
  const [warningAppBarOpen, setWarningAppBarOpen] = useState(
    !sessionStorage.getItem("warning-toolbar-flag")
  );

  const drawerWidth = useMemo(() => {
    return isExtraLarge ? 350 : 300;
  }, [isExtraLarge]);

  const toolbarHeight = useMemo(() => {
    return isExtraLarge ? 92 : 72;
  }, [isExtraLarge]);

  const warningToolbarHeight = useMemo(() => {
    if (!warningAppBarOpen) return 0;
    return toolbarHeight / 1.5;
  }, [toolbarHeight, warningAppBarOpen]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const closeWarningBar = () => {
    sessionStorage.setItem("warning-toolbar-flag", "false");
    setWarningAppBarOpen(false);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
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

          <DautPlaceholder />
        </Toolbar>
      </AppBar>

      {warningAppBarOpen && (
        <AppBar
          sx={{
            top: `${toolbarHeight}px`,
            boxShadow: 2
          }}
          toolbarHeight={warningToolbarHeight}
          drawerWidth={drawerWidth}
          position="fixed"
          open={open}
        >
          <Toolbar
            sx={{
              minHeight: `${warningToolbarHeight}px`,
              backgroundColor: "warning.light",
              border: 0
            }}
          >
            <Typography variant="body" noWrap color="white">
              Some warning message
            </Typography>
            <span
              style={{
                flex: 1
              }}
            ></span>

            <IconButton
              onClick={() => closeWarningBar()}
              color="offWhite"
              edge="start"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

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
            borderRight: "1px solid",
            borderColor: theme.palette.divider,
            width: drawerWidth,
            boxSizing: "border-box"
          }
        }}
      >
        <DrawerHeader
          sx={{
            minHeight: `${toolbarHeight}px !important`
          }}
        >
          <DashboardTitle variant="subtitle1" />
        </DrawerHeader>
        <Divider />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            px: 2,
            gridGap: "8px",
            my: 2
          }}
        >
          <Stack direction="column">
            <Typography
              fontFamily="FractulAltBold"
              color="primary"
              variant="subtitle2"
            >
              {network?.name}
            </Typography>
            <Typography variant="caption" className="text-secondary">
              Network
            </Typography>
          </Stack>
          <Stack direction="column">
            <Typography
              fontFamily="FractulAltBold"
              color="primary"
              variant="subtitle2"
            >
              {community?.name}
            </Typography>
            <Typography variant="caption" className="text-secondary">
              DAO
            </Typography>
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr"
            }}
          >
            <Stack direction="column">
              <Typography
                fontFamily="FractulAltBold"
                color="primary"
                variant="subtitle2"
                maxWidth="120px"
              >
                {userInfo?.name}
              </Typography>
              <Typography variant="caption" className="text-secondary">
                Āut name
              </Typography>
            </Stack>
            <Stack direction="column">
              <Typography
                fontFamily="FractulAltBold"
                color="primary"
                variant="subtitle2"
              >
                {community?.properties?.userData?.roleName}
              </Typography>
              <Typography variant="caption" className="text-secondary">
                DAO Role
              </Typography>
            </Stack>
          </Box>
        </Box>
        <Divider />
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
      <Main
        toolbarHeight={toolbarHeight + warningToolbarHeight}
        drawerWidth={drawerWidth}
        open={open}
      >
        <PerfectScrollbar
          style={{
            minHeight: "100%",
            display: "flex",
            flexDirection: "column"
          }}
          // options={{
          //   suppressScrollX: true,
          //   useBothWheelAxes: false
          //   // swipeEasing: true
          // }}
        >
          {children}
        </PerfectScrollbar>
      </Main>
    </Box>
  );
};

export default memo(SidebarDrawer);
