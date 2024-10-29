import { memo, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { dateToUnix } from "@utils/date-format";
import { countWords } from "@utils/helpers";
import { HubData } from "@store/Hub/hub.reducer";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import SubmitDialog from "@components/Dialog/SubmitDialog";
import { AutDatepicker, FormHelperText } from "@components/Fields";
import { AutSelectField } from "@theme/field-select-styles";
import { AutOsButton } from "@components/buttons";
import {
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  Typography,
  useTheme
} from "@mui/material";
import {
  TextFieldWrapper,
  StyledTextField,
  SliderFieldWrapper,
  CommitmentSliderWrapper
} from "../Modules/Plugins/Task/Shared/StyledFields";
import { FormContainer } from "../Modules/Plugins/Task/Shared/FormContainer";
import { AutOSSlider } from "@theme/commitment-slider-styles";

const errorTypes = {
  maxWords: `Words cannot be more than 6`,
  maxNameChars: `Characters cannot be more than 24`,
  maxLength: `Characters cannot be more than 257`
};

const CreatePoll = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const hubData = useSelector(HubData);

  const { control, handleSubmit, getValues, formState, watch } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      options: ["", ""],
      role: null,
      endDate: new Date(),
      allCanVote: false,
      weight: 0
    }
  });
  const values = watch();

  const onSubmit = async () => {
    const values = getValues();
    // Handle poll creation logic here
    console.log("Poll values:", values);
  };

  return (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          flex: 1,
          mb: 4,
          mx: "auto",
          width: "100%"
        }}
      >
        <Stack alignItems="center" justifyContent="center">
          <Typography
            variant="h3"
            fontSize={{
              xs: "14px",
              md: "20px"
            }}
            color="offWhite.main"
            fontWeight="bold"
          >
            Create Poll
          </Typography>
        </Stack>
        <Typography
          sx={{
            width: {
              xs: "100%",
              sm: "700px",
              xxl: "1000px"
            }
          }}
          mt={2}
          mx="auto"
          variant="body"
          textAlign="center"
          color="offWhite.main"
          fontSize="16px"
        >
          Create a poll for your community to vote on.
        </Typography>
      </Box>

      <Stack
        direction="column"
        gap={4}
        sx={{
          margin: "0 auto",
          width: {
            xs: "100%",
            sm: "650px",
            xxl: "800px"
          }
        }}
      >
        <TextFieldWrapper>
          <Typography
            variant="caption"
            color="offWhite.main"
            mb={theme.spacing(1)}
          >
            Title
          </Typography>
          <Controller
            name="title"
            control={control}
            rules={{
              required: true,
              validate: {
                maxWords: (v) => countWords(v) <= 6
              }
            }}
            render={({ field: { name, value, onChange } }) => (
              <StyledTextField
                color="offWhite"
                required
                sx={{ width: "100%", height: "48px" }}
                autoFocus
                name={name}
                value={value || ""}
                onChange={onChange}
                placeholder="Choose a title for your poll"
                helperText={
                  <FormHelperText
                    errorTypes={errorTypes}
                    value={value}
                    name={name}
                    errors={formState.errors}
                  >
                    <Typography variant="caption" color="white">
                      {6 - countWords(value)} Words left
                    </Typography>
                  </FormHelperText>
                }
              />
            )}
          />
        </TextFieldWrapper>

        <TextFieldWrapper>
          <Typography
            variant="caption"
            color="offWhite.main"
            mb={theme.spacing(1)}
          >
            Description
          </Typography>
          <Controller
            name="description"
            control={control}
            rules={{
              required: true,
              maxLength: 257
            }}
            render={({ field: { name, value, onChange } }) => (
              <StyledTextField
                name={name}
                value={value || ""}
                color="offWhite"
                rows="5"
                multiline
                onChange={onChange}
                placeholder="Describe what the poll is about"
                helperText={
                  <FormHelperText
                    errorTypes={errorTypes}
                    value={value}
                    name={name}
                    errors={formState.errors}
                  >
                    <Typography variant="caption" color="white">
                      {257 - (value?.length || 0)} of 257 characters left
                    </Typography>
                  </FormHelperText>
                }
              />
            )}
          />
        </TextFieldWrapper>

        {values.options.map((_, index) => (
          <TextFieldWrapper key={`option-${index}`}>
            <Typography
              variant="caption"
              color="offWhite.main"
              mb={theme.spacing(1)}
            >
              Option {index + 1}
            </Typography>
            <Controller
              name={`options.${index}`}
              control={control}
              rules={{
                required: true,
                maxLength: 100
              }}
              render={({ field: { name, value, onChange } }) => (
                <StyledTextField
                  color="offWhite"
                  required
                  sx={{ width: "100%" }}
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  placeholder={`Enter option ${index + 1}`}
                />
              )}
            />
          </TextFieldWrapper>
        ))}

        <Controller
          name="role"
          control={control}
          rules={{
            required: !values.allCanVote,
            validate: {
              selected: (v) => !!v
            }
          }}
          render={({ field: { name, value, onChange } }) => (
            <AutSelectField
              variant="standard"
              color="offWhite"
              name={name}
              value={value || ""}
              displayEmpty
              required
              onChange={onChange}
              helperText={
                <FormHelperText
                  value={value}
                  name={name}
                  errors={formState.errors}
                >
                  Select role
                </FormHelperText>
              }
            >
              {hubData.properties.rolesSets[0].roles.map((role) => (
                <MenuItem key={`role-${role.roleName}`} value={role.roleName}>
                  {role.roleName}
                </MenuItem>
              ))}
            </AutSelectField>
          )}
        />

        <Controller
          name="allCanVote"
          rules={{
            required: !values.role
          }}
          control={control}
          render={({ field: { name, value, onChange } }) => (
            <FormControlLabel
              label="All can vote"
              sx={{
                color: "white"
              }}
              control={
                <Checkbox
                  name={name}
                  value={value}
                  checked={!!value}
                  onChange={onChange}
                  sx={{
                    ".MuiSvgIcon-root": {
                      color: !value ? "offWhite.main" : "primary.main"
                    }
                  }}
                />
              }
            />
          )}
        />

        <SliderFieldWrapper>
          <Typography
            variant="caption"
            color="offWhite.main"
            mb={theme.spacing(1)}
          >
            Weight (1-10)
          </Typography>
          <CommitmentSliderWrapper>
            <Controller
              name="weight"
              control={control}
              rules={{
                required: true,
                min: 1,
                max: 10
              }}
              render={({ field: { name, value, onChange } }) => (
                <Box
                  sx={{
                    marginTop: "10px",
                    marginLeft: {
                      sm: "-24px",
                      xxl: "-44px"
                    }
                  }}
                  gap={2}
                >
                  <AutOSSlider
                    value={value}
                    name={name}
                    errors={null}
                    sliderProps={{
                      defaultValue: 1,
                      step: 1,
                      marks: true,
                      name,
                      value: value || 0,
                      onChange,
                      min: 0,
                      max: 10
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      width: {
                        xs: "100%",
                        sm: "620px",
                        xxl: "840px"
                      }
                    }}
                  >
                    <Typography variant="caption" color="offWhite.dark">
                      {value}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          </CommitmentSliderWrapper>
        </SliderFieldWrapper>

        <Controller
          name="endDate"
          control={control}
          rules={{
            required: true
          }}
          render={({ field: { name, value, onChange } }) => (
            <AutDatepicker
              placeholder="End date"
              value={value}
              onChange={onChange}
            />
          )}
        />

        <Box
          sx={{
            width: "100%",
            display: "flex",
            mb: 4,
            justifyContent: {
              xs: "center",
              sm: "flex-end"
            }
          }}
        >
          <AutOsButton
            type="button"
            color="primary"
            disabled={!formState.isValid}
            onClick={() => onSubmit()}
            variant="outlined"
            sx={{
              width: "100px"
            }}
          >
            <Typography fontWeight="bold" fontSize="16px" lineHeight="26px">
              Confirm
            </Typography>
          </AutOsButton>
        </Box>
      </Stack>
    </FormContainer>
  );
};

export default memo(CreatePoll);
