import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import {
  Divider,
  IconButton,
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
import AutWhiteIcon from "@assets/aut/aut-white.svg?react";
import { useSelector } from "react-redux";
import { AppTitle } from "@store/ui-reducer";
import { SelectedNetwork } from "@store/WalletProvider/WalletProvider";
import { AutIDData, HubData } from "@store/Hub/hub.reducer";
import { DautPlaceholder } from "@api/ProviderFactory/web3-daut-connect";
import DiscordServerVerificationPopup from "@components/Dialog/DiscordServerVerificationPopup";
import { SubtitleWithInfo } from "@components/SubtitleWithInfoIcon";
import HubOsLogo from "@assets/hubos/hubos-logo.svg?react";

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
  const hubData = useSelector(HubData);
  const autIDData = useSelector(AutIDData);
  const network = useSelector(SelectedNetwork);
  const appTitle = useSelector(AppTitle);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isExtraLarge = useMediaQuery(theme.breakpoints.up("xxl"));
  const [open, setOpen] = useState(!isMobile);
  const [discordDialogOpen, setDiscordDialogOpen] = useState(false);
  const drawerWidth = useMemo(() => {
    return isExtraLarge ? 350 : 300;
  }, [isExtraLarge]);

  const toolbarHeight = useMemo(() => {
    return isExtraLarge ? 92 : 72;
  }, [isExtraLarge]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const userRole = useMemo(() => {
    if (!hubData || !autIDData) return null;
    const userState = autIDData.properties.joinedHubs.find(
      (h) =>
        h.hubAddress?.toLowerCase() ===
        hubData?.properties?.address?.toLowerCase()
    );
    const roles = hubData.properties.rolesSets[0].roles;
    return roles.find((r) => +r.id === +userState.role);
  }, [hubData, autIDData]);

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100%" }}>
      <DiscordServerVerificationPopup
        open={discordDialogOpen}
        handleClose={() => setDiscordDialogOpen(false)}
      ></DiscordServerVerificationPopup>
      <AppBar
        sx={{
          boxShadow: 2,
          background: "transparent"
        }}
        toolbarHeight={toolbarHeight}
        drawerWidth={drawerWidth}
        position="fixed"
        open={open}
      >
        <Toolbar
          sx={{
            minHeight: `${toolbarHeight}px`,
            background: "transparent",
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
          {!isMobile && (
            <>
              <Typography variant="subtitle2" noWrap color="white">
                {appTitle}
              </Typography>
              <span
                style={{
                  flex: 1
                }}
              ></span>
              <DautPlaceholder />
            </>
          )}
          {isMobile && (
            <Box
              sx={{
                display: "flex",
                width: "100%",
                justifyContent: "center"
              }}
            >
              <DautPlaceholder />
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* {!isDiscordVerified && (
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
              Please verify the discord account for your hub.
            </Typography>
            <Button
              onClick={() => setDiscordDialogOpen(true)}
              sx={{
                mx: 2
              }}
              variant="contained"
              color="primary"
            >
              Verify
            </Button>
            <span
              style={{
                flex: 1
              }}
            ></span>

          </Toolbar>
        </AppBar>
      )} */}

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
            backgroundColor: isMobile
              ? "rgba(87, 97, 118, 0.3)"
              : "rgba(87, 97, 118, 0.2)",
            backdropFilter: isMobile ? "blur(30px)" : "blur(20px)",
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
          {/* <DashboardTitle variant="subtitle1" /> */}
          <HubOsLogo
            height="50px"
            width="150px"
            style={{ marginLeft: "-6px" }}
          ></HubOsLogo>
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
            {/* <Typography
              fontFamily="FractulRegular"
              color="primary"
              variant="subtitle2"
            >
              {network?.name}
            </Typography>
            <Typography variant="caption" color="offWhite.main">
              Network
            </Typography> */}
          </Stack>
          <Stack direction="column">
            <Typography
              variant="subtitle2"
              fontSize="18px"
              color="offWhite.main"
              fontWeight="bold"
            >
              {hubData?.name}
            </Typography>
            <SubtitleWithInfo
              title="hub"
              description={
                network
                  ? `This is your hub. It exists on the ${network?.name} network.`
                  : null
              }
            ></SubtitleWithInfo>
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr"
            }}
          >
            <Stack direction="column">
              <Typography
                variant="subtitle2"
                fontSize="18px"
                color="offWhite.main"
                fontWeight="bold"
              >
                {autIDData?.name}
              </Typography>
              <SubtitleWithInfo
                title="your ĀutID"
                description={null}
              ></SubtitleWithInfo>
            </Stack>
            <Stack direction="column">
              <Typography
                variant="subtitle2"
                fontSize="18px"
                color="offWhite.main"
                fontWeight="bold"
              >
                {userRole?.roleName}
              </Typography>

              <SubtitleWithInfo
                title="role"
                description={`This is your role in the ${hubData?.name} hub.`}
              ></SubtitleWithInfo>
            </Stack>
          </Box>
        </Box>
        <Divider />
        <MenuItems
          addonMenuItems={addonMenuItems}
          hubName={hubData?.name}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            py: 2
          }}
        >
          <SvgIcon
            sx={{
              mt: 5,
              height: "30px",
              width: "100%"
            }}
            component={AutWhiteIcon}
            inheritViewBox
          />
        </Box>
      </Drawer>
      <Main toolbarHeight={toolbarHeight} drawerWidth={drawerWidth} open={open}>
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto"
          }}
        >
          {children}
        </div>
      </Main>
    </Box>
  );
};

export default memo(SidebarDrawer);
