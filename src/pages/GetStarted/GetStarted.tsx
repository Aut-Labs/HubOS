import { Box, Button, styled, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store.model';
import { ReactComponent as AutLogo } from '@assets/aut/logo.svg';
import { pxToRem } from '@utils/text-size';
import { Link } from 'react-router-dom';
import { AutButton } from '@components/buttons';
import { IsAuthenticated } from '@auth/auth.reducer';

const Wrapper = styled('div')({
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  height: '100%',
});

const GetStarted = () => {
  const isAuthenticated = useSelector(IsAuthenticated);
  return (
    <Wrapper>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <AutLogo height={pxToRem(300)} />
      </Box>
      <Typography
        component="div"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          letterSpacing: '8px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          color: 'white',
          mt: pxToRem(50),
          mb: pxToRem(50),
          maxWidth: pxToRem(650),
          fontSize: pxToRem(70),
        }}
      >
        Dashboard
      </Typography>
      <Box sx={{ gridGap: '30px', display: 'flex', justifyContent: 'center' }} className="right-box">
        {/* <AutButton
          sx={{
            width: pxToRem(450),
            height: pxToRem(90),
          }}
          type="submit"
          color="primary"
          variant="outlined"
          component={Link}
          to="/dashboard"
        >
          Connect Wallet
        </AutButton> */}
        {/* <AutButton
          sx={{
            width: pxToRem(450),
            height: pxToRem(90),
          }}
          component={Link}
          disabled
          to="/integrate"
          type="submit"
          color="primary"
          variant="outlined"
        >
          Dashboard
        </AutButton> */}
      </Box>
    </Wrapper>
  );
};

export default GetStarted;
