/* eslint-disable max-len */
import {
  Dialog,
  DialogActions,
  DialogContent,
  useMediaQuery,
  useTheme,
  IconButton
} from "@mui/material";
import { pxToRem } from "@utils/text-size";
import CloseIcon from "@mui/icons-material/Close";

export const DialogWrapper = ({
  children,
  actions = null,
  open,
  onClose = null,
  fullScreen = false,
  contentSx = {} as any
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Dialog
      open={open}
      fullScreen={isMobile || fullScreen}
      {...(onClose && {
        onClose
      })}
      sx={{
        ".MuiPaper-root": {
          borderColor: "divider",
          borderRadius: "16px",
          ...(contentSx?.maxWidth && {
            maxWidth: contentSx.maxWidth
          })
        }
      }}
    >
      <DialogContent
        sx={{
          ...(!isMobile &&
            !fullScreen && {
              maxWidth: {
                xs: "100%",
                sm: "450px"
              },
              minWidth: {
                xs: "100%",
                sm: "450px"
              },
              maxHeight: {
                xs: "100%",
                sm: "450px"
              },
              minHeight: {
                xs: "100%",
                sm: "450px"
              }
            }),
          padding: {
            xs: "20px",
            sm: "28px",
            md: "32px",
            lg: "40px"
          },
          display: "flex",
          alignItems: "center",
          flexDirection: "column"
        }}
      >
        {!!onClose && (
          <IconButton
            size="small"
            aria-label="close"
            onClick={() => {
              onClose();
            }}
            type="button"
            sx={{
              color: "white",
              position: "absolute",
              right: pxToRem(15),
              top: pxToRem(15)
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}

        {children}

        {actions && (
          <DialogActions
            sx={{
              backgroundColor: "background.default",
              py: pxToRem(30),
              justifyContent: "center",
              height: pxToRem(120)
            }}
          >
            {actions}
          </DialogActions>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogWrapper;
