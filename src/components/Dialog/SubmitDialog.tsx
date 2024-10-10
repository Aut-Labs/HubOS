import { Box, Typography } from "@mui/material";
import DialogWrapper from "./DialogWrapper";
import AutLoading from "@components/AutLoading";
import AutConfetti from "@components/AutConfetti";

const SubmitDialog = ({
  open,
  handleClose,
  subtitle,
  message,
  backdropFilter = false,
  fullScreen = false,
  mode = "success"
}: any) => {
  return (
    <DialogWrapper
      open={open}
      onClose={mode === "success" ? handleClose : null}
      fullScreen={fullScreen}
      backdropFilter={backdropFilter}
    >
      <div
        className="sw-join-dialog-content"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
          width: "100%",
          flex: 1
        }}
      >
        {mode === "success" ? (
          <>
            <Box>
              <Typography
                sx={{
                  color: "white",
                  textAlign: "center",
                  mt: 2
                }}
                component="div"
                variant="subtitle1"
              >
                {subtitle}
              </Typography>
              <Typography
                sx={{
                  color: "white",
                  textAlign: "center",
                  mt: 2
                }}
                component="div"
                variant="body"
              >
                {message}
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                position: "relative"
              }}
            >
              <AutConfetti />
            </Box>
          </>
        ) : (
          <>
            <Box>
              <Typography
                sx={{
                  color: "white",
                  textAlign: "center",
                  mt: 2
                }}
                component="div"
                variant="subtitle1"
              >
                {subtitle}
              </Typography>
            </Box>

            <Box
              style={{
                flex: 1,
                position: "relative"
              }}
            >
              <AutLoading width="130px" height="130px" />
            </Box>
          </>
        )}
      </div>
    </DialogWrapper>
  );
};

export default SubmitDialog;
