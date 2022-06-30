import { Box, Button, styled, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store.model';
import { ReactComponent as AutLogo } from '@assets/aut/logo.svg';
import { pxToRem } from '@utils/text-size';
import { Link } from 'react-router-dom';
import { AutButton } from '@components/buttons';

const Wrapper = styled('div')({
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  height: '100%',
});

const GetStarted = () => {
  const { isAutheticated } = useSelector((state: RootState) => state.auth);

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
          color: 'white',
          mt: pxToRem(50),
          mb: pxToRem(50),
          maxWidth: pxToRem(650),
          fontSize: pxToRem(16),
        }}
      >
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
        erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus
      </Typography>
      <Box sx={{ gridGap: '30px', display: 'flex', justifyContent: 'center' }} className="right-box">
        <AutButton
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
        </AutButton>
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
