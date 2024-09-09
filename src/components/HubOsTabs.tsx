import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { SxProps, useTheme } from "@mui/material";

interface HubOsTabParams {
  label: string | any;
  component: any;
  disabled?: boolean;
  props: {
    [key: string]: any;
  };
}

interface HubOsParams {
  tabs: HubOsTabParams[];
  selectedTabIndex?: number;
  selectedTab?: (value: any, event: React.SyntheticEvent) => void;
  tabStyles?: React.CSSProperties | SxProps<any>;
}

function TabPanel(props: any) {
  const { children, value, index, sx, ...other } = props;
  return (
    <div
      role="tabpanel"
      className="sw-tabpanel"
      hidden={value !== index}
      id={`member-tabpanel-${index}`}
      aria-labelledby={`member-tab-${index}`}
      style={{ height: "100%" }}
      {...other}
    >
      {value === index && (
        <Box
          className="tab-content"
          sx={{
            position: "relative",
            borderColor: "divider",
            height: {
              xs: "calc(100% - 30px)",
              sm: "calc(100% - 30px)"
            },
            minHeight: "400px",
            marginBottom: {
              xs: "30px",
              sm: "20px"
            },
            ...(sx || {})
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

function HubOsTabs(props: HubOsParams) {
  const [value, setSelectedIndex] = React.useState(props.selectedTabIndex || 0);
  const theme = useTheme();

  console.log("HubOsTabs", props);

  const handleChange = (event: React.SyntheticEvent, index: number) => {
    setSelectedIndex(index);
    props.selectedTab && props.selectedTab(index, event);
  };

  const handleChangeIndex = (index: number) => {
    setSelectedIndex(index);
    props.selectedTab && props.selectedTab(index, null);
  };

  return (
    <Box
      className="aut-tabs"
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        // marginBottom: theme.spacing(4),
        ...props.tabStyles
      }}
    >
      <Box>
        <Tabs
          // variant="fullWidth"
          value={value}
          onChange={handleChange}
          sx={{
            ".MuiTabs-indicator": {
              display: "none"
            },
            ".MuiTabs-scroller": {
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            },
            ".MuiTabs-flexContainer": {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              borderRadius: "72px",
              // width: {
              //   xs: "100%",
              //   md: "50%"
              // },
              background: "rgba(240, 245, 255, 0.01)",
              backdropFilter: "blur(12px)"
            },
            ".MuiButtonBase-root": {
              height: {
                xs: "45px"
              },
              width: {
                xs: "unset",
                md: "120px",
                xxl: "180px"
              },
              display: "flex",
              borderRadius: "99px",
              backgroundColor: "transparent",
              textTransform: "inherit",
              color: "offWhite.main",
              border: `1px solid ${theme.palette.divider}`,
              transition: theme.transitions.create([
                "border-color",
                "background-color",
                "color"
              ]),
              ":hover": {
                border: `1px solid ${theme.palette.offWhite.main}`
              },
              "&.Mui-selected": {
                bgcolor: "offWhite.main",
                color: "nightBlack.main"
              },
              "&.Mui-disabled": {
                color: "offWhite.dark",
                opacity: "0.8"
              }
            }
          }}
        >
          {props.tabs.map(({ label, disabled }) => (
            <Tab key={label} label={label} disabled={disabled} />
          ))}
        </Tabs>
      </Box>
      {props.tabs.map(({ props: childProps, component }, index) => {
        const Component = component;
        return (
          <TabPanel key={index} value={value} index={index}>
            <Component {...childProps} />
          </TabPanel>
        );
      })}
    </Box>
  );
}

export default React.memo(HubOsTabs);
