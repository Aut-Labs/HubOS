import { Button, CircularProgress, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { pxToRem } from '@utils/text-size';

const LoadingDialog = ({ mode = 'light', open, handleClose, subtitle, message, fullScreen = false }: any) => {
  const dialogSize = fullScreen
    ? {}
    : {
        maxWidth: pxToRem(400),
        minWidth: pxToRem(400),
        minHeight: pxToRem(250),
      };
  return (
    <Dialog open={open} fullScreen={fullScreen}>
      <DialogContent
        sx={{
          ...dialogSize,
          bgcolor: 'background.default',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <div
          className="sw-join-dialog-content"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress
            sx={{
              color: mode === 'light' ? 'primary.main' : 'text.primary',
            }}
          />
          <Typography
            sx={{ color: mode === 'light' ? 'primary.main' : 'text.primary', textAlign: 'center', mt: 2 }}
            component="div"
            variant="h2"
          >
            {message}
          </Typography>
          <Typography
            sx={{ color: mode === 'light' ? 'primary.main' : 'text.primary', textAlign: 'center', mt: 2 }}
            component="div"
            variant="body2"
          >
            {subtitle}
          </Typography>
        </div>
      </DialogContent>
      {/* <DialogActions
        sx={{
          backgroundColor: 'background.default',
          py: pxToRem(30),
          justifyContent: 'center',
          height: pxToRem(130),
        }}
      >
        <Button
          onClick={handleClose}
          sx={{
            width: pxToRem(350),
            height: pxToRem(70),
          }}
          type="submit"
          color="primary"
          variant="outlined"
        >
          Cancel
        </Button>
      </DialogActions> */}
    </Dialog>
  );
};

export default LoadingDialog;
