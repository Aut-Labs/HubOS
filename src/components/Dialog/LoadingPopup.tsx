import { Typography } from "@mui/material";
import AutLoading from "../AutLoading";
import DialogWrapper from "./DialogWrapper";

const LoadingDialog = ({ open, message = null, fullScreen = false }: any) => {
  return (
    <DialogWrapper open={open} fullScreen={fullScreen}>
      <div
        className="sw-join-dialog-content"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-around",
          flex: 1
        }}
      >
        {message && (
          <Typography
            sx={{
              color: "white",
              textAlign: "center",
              mt: 2
            }}
            component="div"
            variant="subtitle1"
          >
            {message}
          </Typography>
        )}
        <div
          style={{
            flex: 1,
            position: "relative"
          }}
        >
          <AutLoading />
        </div>
      </div>
    </DialogWrapper>
  );
};

export default LoadingDialog;
