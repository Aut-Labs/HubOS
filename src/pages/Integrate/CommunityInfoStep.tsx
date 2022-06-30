/* eslint-disable max-len */
import { AutTextField, FormHelperText } from '@components/Fields';
import AFileUpload from '@components/FileUpload';
import { StepperButton } from '@components/Stepper';
import { StepperChildProps } from '@components/Stepper/model';
import { styled } from '@mui/material';
import { IntegrateCommunity, integrateUpdateCommunity } from '@store/Integrate/integrate';
import { useAppDispatch } from '@store/store.model';
import { countWords } from '@utils/helpers';
import { pxToRem } from '@utils/text-size';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { toBase64 } from 'sw-web-shared';

const errorTypes = {
  maxWords: `Words cannot be more than 3`,
  maxLength: `Characters cannot be more than 280`,
};

const StepWrapper = styled('form')({
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
});

const CommunityInfoStep = (props: StepperChildProps) => {
  const dispatch = useAppDispatch();
  const { name, image, description, contractType, daoAddr } = useSelector(IntegrateCommunity);
  const { control, handleSubmit, getValues, formState } = useForm({
    mode: 'onChange',
    defaultValues: {
      name,
      image,
      description,
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
      <div className="sw-community-description">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <Controller
            name="image"
            control={control}
            render={({ field: { onChange } }) => {
              return (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <AFileUpload
                    initialPreviewUrl={image}
                    fileChange={async (file) => {
                      if (file) {
                        onChange(await toBase64(file));
                      } else {
                        onChange(null);
                      }
                    }}
                  />
                </div>
              );
            }}
          />
          <Controller
            name="name"
            control={control}
            rules={{
              required: true,
              validate: {
                maxWords: (v: string) => countWords(v) <= 3,
              },
            }}
            render={({ field: { name, value, onChange } }) => {
              return (
                <AutTextField
                  width="330"
                  variant="standard"
                  required
                  autoFocus
                  name={name}
                  value={value || ''}
                  onChange={onChange}
                  placeholder="Community Name"
                  helperText={
                    <FormHelperText errorTypes={errorTypes} value={value} name={name} errors={formState.errors}>
                      <span>{3 - countWords(value)} Words left</span>
                    </FormHelperText>
                  }
                />
              );
            }}
          />
        </div>

        <Controller
          name="description"
          control={control}
          rules={{ maxLength: 280 }}
          render={({ field: { name, value, onChange } }) => {
            return (
              <AutTextField
                width="450"
                name={name}
                value={value || ''}
                onChange={onChange}
                color="primary"
                multiline
                rows={5}
                sx={{
                  mt: pxToRem(45),
                }}
                placeholder="Introduce your community to the world. It can be a one-liner, common values, goals, or even the story behind it!"
                helperText={
                  <FormHelperText errorTypes={errorTypes} value={value} name={name} errors={formState.errors}>
                    <span>Max characters {280 - (value?.length || 0)}</span>
                  </FormHelperText>
                }
              />
            );
          }}
        />
      </div>
      <StepperButton label="Next" disabled={!formState.isValid} />
    </StepWrapper>
  );
};

export default CommunityInfoStep;
