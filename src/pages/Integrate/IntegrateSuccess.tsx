import { StepperChildProps } from '@components/Stepper/model';
import { Box, Container, styled, Typography } from '@mui/material';
import { pxToRem } from '@utils/text-size';
import { ReactComponent as CutLogo } from '@assets/aut/cut.svg';
import { AutButton } from '@components/buttons';

const StepWrapper = styled(Container)({
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
});

const IntegrateSuccess = (props: StepperChildProps) => {
  return (
    <StepWrapper maxWidth="md" sx={{ width: '100%', flexGrow: 1, boxSizing: 'border-box', position: 'relative' }}>
      <Typography letterSpacing="10.5px" textTransform="uppercase" marginTop={pxToRem(50)} fontSize={pxToRem(70)} color="white">
        Congratulations
      </Typography>
      <CutLogo />

      <Typography
        letterSpacing="1.25px"
        minHeight={pxToRem(240)}
        maxWidth="80%"
        marginTop={pxToRem(100)}
        fontSize={pxToRem(25)}
        color="white"
      >
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
        erat, sed diam voluptua.
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
        >
          Share
        </AutButton>
        <AutButton
          sx={{
            width: pxToRem(450),
            height: pxToRem(90),
          }}
          type="submit"
          color="primary"
          variant="outlined"
        >
          See Your Dashboard
        </AutButton>
      </Box>
    </StepWrapper>
  );
};

export default IntegrateSuccess;
