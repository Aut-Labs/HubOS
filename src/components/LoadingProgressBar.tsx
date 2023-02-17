import { Fade, LinearProgress } from "@mui/material";
import { memo } from "react";

const LoadingProgressBar = ({ isLoading }) => {
  return (
    <Fade in={isLoading} unmountOnExit>
      <LinearProgress
        sx={{
          position: "fixed",
          top: "72px",
          width: "100%",
          left: 0
        }}
      />
    </Fade>
  );
};

export default memo(LoadingProgressBar);
