import { Box, LinearProgress, Typography } from "@mui/material";
import { styled } from "@mui/system";

interface Props {
  color?: "primary" | "secondary";
  hex?: string;
  value?: number;
}

const ProgressBar = ({ color, hex, value }: Props) => {
  let internalColor: string;

  if (typeof hex === "undefined") {
    internalColor = "#3f51b5";
  } else if (typeof hex !== "undefined" && /^#[0-9A-F]{6}$/i.test(hex)) {
    internalColor = hex;
  } else {
    throw new Error("Invalid hex prop -- please use a hex string.");
  }

  if (typeof value === "undefined") {
    value = 0;
  } else if (typeof value === "number" && value < 0) {
    throw new Error(
      "Invalid value prop -- please use a number more than or equal to 0."
    );
  } else if (typeof value === "number" && value > 100) {
    throw new Error(
      "Invalid value prop -- please use a number less than or equal to 100."
    );
  }

  const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 20,
    width: "100%",
    borderRadius: 0,
    backgroundColor: hex ? theme.palette.action.hover : undefined,
    ".MuiLinearProgress-bar": {
      borderRadius: 0,
      backgroundColor: hex ? internalColor : undefined
    }
  }));

  const WhiteTextTypography = styled(Typography)({
    color: "#FFFFFF"
  });

  return (
    <Box position="relative" display="inline-flex" style={{ width: "100%" }}>
      <BorderLinearProgress
        color={hex ? undefined : color}
        variant="determinate"
        value={value}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <WhiteTextTypography variant="body2">{`${value}%`}</WhiteTextTypography>
      </Box>
    </Box>
  );
};

export default ProgressBar;
