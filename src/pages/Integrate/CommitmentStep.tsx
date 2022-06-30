import { AutSlider } from '@components/CommitmentSlider';
import { StepperButton } from '@components/Stepper';
import { StepperChildProps } from '@components/Stepper/model';
import { styled } from '@mui/material';
import { IntegrateCommunity, integrateUpdateCommunity } from '@store/Integrate/integrate';
import { useAppDispatch } from '@store/store.model';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';

const StepWrapper = styled('form')({
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
});

const CommitmentStep = (props: StepperChildProps) => {
  const dispatch = useAppDispatch();
  const { commitment } = useSelector(IntegrateCommunity);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      commitment,
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
    <StepWrapper autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="commitment"
        key="commitment"
        control={control}
        rules={{ min: 1, required: true }}
        render={({ field: { name, value, onChange } }) => {
          return (
            <AutSlider
              value={value}
              name={name}
              errors={errors}
              sliderProps={{
                defaultValue: 1,
                step: 1,
                marks: true,
                name,
                value: value || 0,
                onChange,
                min: 0,
                max: 10,
              }}
            />
          );
        }}
      />
      <StepperButton label="Next" disabled={!isValid} />
    </StepWrapper>
  );
};

export default CommitmentStep;
