import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { pxToRem } from "@utils/text-size";
import "./tabs.scss";

function TabPanel(props) {
  const { children, value, index, sx, ...other } = props;
  return (
    <div
      role="tabpanel"
      className="sw-tabpanel"
      hidden={value !== index}
      id={`member-tabpanel-${index}`}
      aria-labelledby={`member-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box
          sx={{
            p: "10px 30px 0 30px",
            height: "calc(100%)",
            ...(sx || {})
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

export default function SwTabs({
  tabs,
  selectedTabIndex = 0,
  selectedTab = (e, v) => null,
  scrollbarStyles = {},
  tabPanelStyles = {},
  width = 260,
  height = 60
}) {
  const [value, setValue] = React.useState(selectedTabIndex);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    selectedTab(newValue, event);
  };

  return (
    <Box className="sw-tabs" sx={{ width: "100%" }}>
      <Box>
        <Tabs
          // variant="fullWidth"
          value={value}
          onChange={handleChange}
          sx={{
            ".MuiTabs-indicator": {
              display: "none"
            },
            ".MuiTabs-flexContainer": {
              gridGap: "10px"
            },
            ".MuiButtonBase-root": {
              height: pxToRem(height),
              width: pxToRem(width),
              borderColor: "primary.main",
              textTransform: "inherit",
              borderWidth: "2px",
              fontSize: pxToRem(25),
              color: "white",
              letterSpacing: "1.25px",
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "white"
              }
            }
          }}
        >
          {tabs.map(({ label }) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </Box>
      {/* <SwScrollbar
        sx={{
          height: 'calc(100% - 120px)',
          flex: 1,
          border: '2px solid',
          p: 3,
          ...scrollbarStyles,
        }}
      >
        
      </SwScrollbar> */}
      {tabs.map(({ props, component, label, hideTop }, index) => {
        const Component = component;
        return (
          <TabPanel sx={tabPanelStyles} key={index} value={value} index={index}>
            {/* {!hideTop && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                }}
              >
                <Typography
                  sx={{ width: '100%', maxWidth: pxToRem(240), my: 2, fontSize: pxToRem(21) }}
                  color="primary.main"
                  textAlign="center"
                  component="div"
                >
                  {label}
                </Typography>
                <Typography
                  sx={{ width: '100%', maxWidth: pxToRem(240), my: 2, mb: pxToRem(20), fontSize: pxToRem(21) }}
                  color="primary.main"
                  textAlign="center"
                  component="div"
                >
                  Total - {props?.total || 0}
                </Typography>
              </div>
            )} */}

            <Component {...props} />
          </TabPanel>
        );
      })}
    </Box>
  );
}
