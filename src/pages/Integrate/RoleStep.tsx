import { StepperChildProps } from '@components/Stepper/model';
import { styled } from '@mui/material';
import { IntegrateCommunity, integrateUpdateCommunity } from '@store/Integrate/integrate';
import { useAppDispatch } from '@store/store.model';
import { pxToRem } from '@utils/text-size';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { AutTextField, FormHelperText } from '@components/Fields';
import { StepperButton } from '@components/Stepper';

const errorTypes = {
  maxLength: `Characters cannot be more than 280`,
};

const StepWrapper = styled('form')({
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
});

const RoleStep = (props: StepperChildProps) => {
  const dispatch = useAppDispatch();
  const { roles } = useSelector(IntegrateCommunity);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      roles,
    },
  });

  const { fields } = useFieldArray({
    control,
    name: 'roles',
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
      {fields.map((_, index) => (
        <Controller
          key={`roles.${index}.roleName`}
          name={`roles.${index}.roleName`}
          control={control}
          rules={{ min: 0, required: index !== 2 }}
          render={({ field: { name, value, onChange } }) => {
            return (
              <>
                <AutTextField
                  placeholder="Role Name"
                  required={index !== 2}
                  variant="standard"
                  focused
                  id={name}
                  name={name}
                  value={value}
                  width="450"
                  autoFocus={index === 0}
                  onChange={onChange}
                  sx={{
                    mb: pxToRem(45),
                  }}
                  inputProps={{ maxLength: 20 }}
                  helperText={
                    <FormHelperText errorTypes={errorTypes} value={value} name={name} errors={errors}>
                      <span>{20 - (value?.length || 0)} of 20 characters left</span>
                    </FormHelperText>
                  }
                />
              </>
            );
          }}
        />
      ))}
      <StepperButton label="Next" disabled={!isValid} />
    </StepWrapper>
  );
};

export default RoleStep;
