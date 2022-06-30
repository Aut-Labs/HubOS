import { Dialog, DialogContent, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  TwitterShareButton,
  LinkedinShareButton,
  TelegramShareButton,
} from "react-share";
import TwitterIcon from "@mui/icons-material/Twitter";
import TelegramIcon from "@mui/icons-material/Telegram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import ClipboardToCopy from "./CopyToClipboard";
import { pxToRem } from "@utils/text-size";

export interface SimpleDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  sx?: any;
  dialogsx?: any;
  fullScreen?: boolean;
  mode?: "light" | "dark";
  url: string;
  twitterProps?: any;
  linkedinProps?: any;
  telegramProps?: any;
}

function AutShare(props: SimpleDialogProps) {
  const {
    onClose,
    title,
    open,
    sx,
    dialogsx,
    fullScreen,
    mode,
    url,
    telegramProps,
    linkedinProps,
    twitterProps,
  } = props;

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      onClose={handleClose}
      fullScreen={fullScreen}
      open={open}
      sx={{ ...(dialogsx || {}) }}
    >
      <DialogContent
        sx={{
          width: pxToRem(600),
          height: pxToRem(400),
          display: "flex",
          position: "relative",
          flexDirection: "column",
          borderWidth: "5px",
          bgcolor: "black",
        }}
      >
        <CloseIcon
          onClick={handleClose}
          sx={{
            position: "absolute",
            cursor: "pointer",
            top: 8,
            right: 8,
            color: "white"
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: 'column'
          }}
        >
          <Typography
            color="white"
            textAlign="center"
            component="span"
            fontSize={pxToRem(30)}
          >
            Share
          </Typography>

          <Typography
            sx={{
              mt: "20px",
            }}
            variant="h2"
            color={mode === "light" ? "primary.main" : "text.primary"}
            textAlign="center"
            component="span"
          >
            {title}
          </Typography>

          <div
            className="links"
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "330px",
              margin: "10px auto 0 auto",
            }}
          >
            {/* <LinkedinShareButton
            url={url}
            className="social-button"
            {...linkedinProps}
          >
            <LinkedInIcon
              sx={{
                width: "85px",
                height: "85px",
                color: mode === "light" ? "primary.main" : "text.primary",
              }}
            />
          </LinkedinShareButton> */}
            {/* <TelegramShareButton
            url={url}
            className="social-button"
            {...telegramProps}
          >
            <TelegramIcon
              sx={{
                width: "85px",
                height: "85px",
                color: mode === "light" ? "primary.main" : "text.primary",
              }}
            />
          </TelegramShareButton> */}
            <TwitterShareButton
              url={url}
              className="social-button"
              {...twitterProps}
            >
              <TwitterIcon
                sx={{
                  width: "85px",
                  height: "85px",
                  color: mode === "light" ? "primary.main" : "text.primary",
                }}
              />
            </TwitterShareButton>
          </div>
        </div>

        {/* <div
          className="copy-link"
          style={{
            width: "310px",
            margin: "20px auto 0 auto",
          }}
        >
          <Typography
            sx={{
              marginTop: "20px",
              marginBottom: "8px",
            }}
            variant="h3"
            color={mode === "light" ? "primary.main" : "text.primary"}
            component="span"
          >
            Copy link
          </Typography>
          <ClipboardToCopy mode={mode} url={url} />
        </div> */}
      </DialogContent>
    </Dialog>
  );
}

export default AutShare;
