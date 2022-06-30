/* eslint-disable max-len */
import { StepperButton } from '@components/Stepper';
import { StepperChildProps } from '@components/Stepper/model';
import { Card, CardContent, Grid, styled, Typography } from '@mui/material';
import { IntegrateCommunity, integrateUpdateCommunity } from '@store/Integrate/integrate';
import { useAppDispatch } from '@store/store.model';
import { pxToRem } from '@utils/text-size';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { MarketTemplates } from './misc';

const StepWrapper = styled('form')({
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
});

const AutCard = styled(Card)({
  '&.MuiPaper-root': {
    cursor: 'pointer',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: 'transparent',
    borderImage:
      'linear-gradient(45.57deg, #009fe3 0%, #0399de 8%, #0e8bd3 19%, #2072bf 30%, #3a50a4 41%, #5a2583 53%, #453f94 71%, #38519f 88%, #3458a4 100%) 1',
    borderWidth: '3px',
    borderColor: 'transparent',
    '&.active': {
      // background: 'transparent linear-gradient(111deg, #009FE3 0%, #5A2583 52%, #3458A4 100%) 0% 0% no-repeat padding-box',
      background:
        'transparent linear-gradient(45.57deg, #009fe3 0%, #0399de 8%, #0e8bd3 19%, #2072bf 30%, #3a50a4 41%, #5a2583 53%, #453f94 71%, #38519f 88%, #3458a4 100%) 0% 0%',
      borderWidth: '0',
      borderColor: 'transparent',
    },

    '.MuiCardContent-root': {
      ':last-child': {
        padding: 0,
      },
    },
  },
});

const SelectMarketStep = (props: StepperChildProps) => {
  const dispatch = useAppDispatch();
  const { market } = useSelector(IntegrateCommunity);
  const { control, handleSubmit, getValues, formState } = useForm({
    mode: 'onChange',
    defaultValues: {
      market,
    },
  });

  const updateState = () => {
    return dispatch(integrateUpdateCommunity(getValues()));
  };

  const onSubmit = async () => {
    await updateState();
    props?.stepper?.nextStep();
  };

  return (
    <StepWrapper onSubmit={handleSubmit(onSubmit)}>
      <Grid container justifyContent="space-around" alignItems="center" spacing={5} sx={{ marginBottom: pxToRem(45) }}>
        {MarketTemplates.map(({ title, market }, index) => (
          <Grid item key={index}>
            <Controller
              name="market"
              key={market}
              control={control}
              render={({ field: { value, onChange } }) => {
                return (
                  <AutCard
                    sx={{
                      height: pxToRem(325),
                      width: pxToRem(305),
                      p: pxToRem(45),
                    }}
                    square
                    onClick={() => onChange(value === market ? null : market)}
                    className={value === market ? 'active' : ''}
                  >
                    <CardContent
                      sx={{
                        flex: 1,
                        display: 'flex',
                        p: 0,
                        pb: 0,
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography color="white" fontSize={pxToRem(30)} component="div">
                        {title}
                      </Typography>
                      <Typography textAlign="left" color="white" fontSize={pxToRem(14)} component="div">
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore
                        magna aliquyam erat, sed diam voluptua.
                      </Typography>
                    </CardContent>
                  </AutCard>
                );
              }}
            />
          </Grid>
        ))}
      </Grid>

      <StepperButton label="Next" disabled={!formState.isValid} />
    </StepWrapper>
  );
};

export default SelectMarketStep;
