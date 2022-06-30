import { AutSelectField, AutTextField, FormHelperText } from '@components/Fields';
import { StepperButton } from '@components/Stepper';
import { StepperChildProps } from '@components/Stepper/model';
import { Link, MenuItem, styled } from '@mui/material';
import { IntegrateCommunity, integrateUpdateCommunity } from '@store/Integrate/integrate';
import { useAppDispatch } from '@store/store.model';
import { pxToRem } from '@utils/text-size';
import { isAddress } from 'ethers/lib/utils';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { ContractTypes } from './misc';

const errorTypes = {
  validAddress: `Not a valid address`,
  selected: 'Field is required!',
};

const StepWrapper = styled('form')({
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
});

const ImportContractStep = (props: StepperChildProps) => {
  const dispatch = useAppDispatch();
  const { contractType, daoAddr } = useSelector(IntegrateCommunity);
  const { control, handleSubmit, getValues, formState } = useForm({
    mode: 'onChange',
    defaultValues: {
      contractType,
      daoAddr,
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
        name="contractType"
        control={control}
        rules={{
          validate: {
            selected: (v: number) => !!v,
          },
        }}
        render={({ field: { name, value, onChange } }) => {
          return (
            <AutSelectField
              variant="standard"
              autoFocus
              renderValue={(selected) => {
                if (!selected) {
                  return 'DAO Type';
                }
                const type = ContractTypes.find((t) => t.value === selected);
                return type?.label || selected;
              }}
              width="450"
              name={name}
              color="primary"
              value={value || ''}
              displayEmpty
              required
              onChange={onChange}
              helperText={
                <FormHelperText value={value} name={name} errors={formState.errors}>
                  <Link sx={{ color: 'white' }} target="_blank" href="https://distributedtown.gitbook.io/v2/integrations/add-new-dao-type">
                    Want to add a new DAO type?
                  </Link>
                </FormHelperText>
              }
            >
              {ContractTypes.map((type) => (
                <MenuItem key={`contract-type-${type.value}`} color="primary" value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </AutSelectField>
          );
        }}
      />
      <Controller
        name="daoAddr"
        control={control}
        rules={{
          required: true,
          validate: {
            validAddress: (v: string) => isAddress(v),
          },
        }}
        render={({ field: { name, value, onChange } }) => {
          return (
            <AutTextField
              width="450"
              variant="standard"
              required
              name={name}
              value={value || ''}
              onChange={onChange}
              placeholder="DAO Address"
              sx={{
                mb: pxToRem(45),
              }}
              helperText={<FormHelperText errorTypes={errorTypes} value={value} name={name} errors={formState.errors} />}
            />
          );
        }}
      />

      <StepperButton disabled={!formState.isValid} label="Verify Ownership & Continue" />
    </StepWrapper>
  );
};

export default ImportContractStep;
