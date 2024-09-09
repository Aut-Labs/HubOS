import { Typography, Tooltip, SvgIcon, Box, useTheme } from "@mui/material";
import { ReactComponent as InfoIcon } from "@assets/hubos/info-icon.svg";

export const SubtitleWithInfo = ({ title, description }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "24px"
      }}
    >
      <Typography
        variant="caption"
        color="offWhite.dark"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        {title}
      </Typography>
      {description && (
        <Tooltip
          disableHoverListener={false}
          title={description}
          style={{
            width: "24px",
            height: "24px"
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: "3px"
            }}
          >
            <SvgIcon
              sx={{
                width: "16px",
                height: "16px",
                cursor: "pointer",
                background: "transparent",
                fill: "transparent"
              }}
              viewBox="0 0 16 16"
              key={`info-icon`}
              component={InfoIcon}
            />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};
