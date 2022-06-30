import { Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { pxToRem } from '@utils/text-size';
import { SwButton } from 'sw-web-shared';
import { AutButton } from './buttons';

const ErrorDialog = ({ mode = 'light', open, hasRetry = false, handleClose, subtitle, message, fullScreen = false }: any) => {
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
          <Typography sx={{ color: 'red', textAlign: 'center', mt: 2 }} component="div" variant="h2">
            {message}
          </Typography>
          <Typography
            sx={{ color: mode === 'light' ? 'primary.main' : 'text.primary', textAlign: 'center', mt: 2 }}
            component="div"
            variant="body2"
          >
            {subtitle}
          </Typography>
          {hasRetry && <SwButton type="button" btnType="medium" mode={mode} onClick={() => handleClose('retry')} label="Retry" />}
        </div>
      </DialogContent>
      <DialogActions
        sx={{
          backgroundColor: 'background.default',
          py: pxToRem(30),
          justifyContent: 'center',
          height: pxToRem(130),
        }}
      >
        <AutButton
          onClick={() => handleClose('close')}
          sx={{
            width: pxToRem(250),
            height: pxToRem(50),
          }}
          type="submit"
          color="primary"
          variant="outlined"
        >
          Dismiss
        </AutButton>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;
