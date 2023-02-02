import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { trimAddress } from "@utils/helpers";
import { Tooltip, Typography, IconButton } from "@mui/material";
import { pxToRem } from "@utils/text-size";

export const CopyAddress = ({ address }) => {
  return (
    <CopyToClipboard text={address}>
      <div style={{ width: "100%", color: "white" }}>
        <Tooltip title="Copy Address">
          <Typography
            sx={{ color: "white", fontSize: pxToRem(12) }}
            component="div"
          >
            {trimAddress(address)}
            <IconButton sx={{ color: "white", p: 0 }}>
              <ContentCopyIcon
                sx={{ cursor: "pointer", width: pxToRem(12), ml: "5px" }}
              />
            </IconButton>
          </Typography>
        </Tooltip>
      </div>
    </CopyToClipboard>
  );
};

export default CopyAddress;
