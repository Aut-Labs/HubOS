import { Typography } from "@mui/material";
import AutLoading from "../AutLoading";
import DialogWrapper from "./DialogWrapper";

const LoadingDialog = ({
  open,
  subtitle,
  message,
  fullScreen = false
}: any) => {
  return (
    <DialogWrapper open={open} fullScreen={fullScreen}>
      <div
        className="sw-join-dialog-content"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1
        }}
      >
        <AutLoading />
        {/* <Typography
          sx={{
            color: 'white',
            textAlign: 'center',
            mt: 2,
          }}
          component="div"
          variant="h2"
        >
          {message}
        </Typography> */}
        {/* <Typography
          sx={{
            color: 'white',
            textAlign: 'center',
            mt: 2,
          }}
          component="div"
          variant="body2"
        >
          {subtitle}
        </Typography> */}
      </div>
    </DialogWrapper>
  );
};

export default LoadingDialog;
