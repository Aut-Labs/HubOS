import { memo, useMemo } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import {
  Stack,
  Typography,
  Box,
  MenuItem,
  FormControlLabel,
  Checkbox,
  useTheme
} from "@mui/material";
import { AutOsButton } from "@components/buttons";
import { countWords } from "@utils/helpers";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import SubmitDialog from "@components/Dialog/SubmitDialog";
import { FormContainer } from "../Modules/Plugins/Task/Shared/FormContainer";
import {
  TextFieldWrapper,
  StyledTextField,
  SliderFieldWrapper,
  CommitmentSliderWrapper
} from "../Modules/Plugins/Task/Shared/StyledFields";
import { AutDatepicker, FormHelperText } from "@components/Fields";
import EmojiInputPicker from "@components/EmojiInputPicker/EmojiInputPicker";
import { AutSelectField } from "@theme/field-select-styles";
import { AutIDData, HubData } from "@store/Hub/hub.reducer";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWalletConnector } from "@aut-labs/connector";
import { useCreateDiscordPollContributionMutation } from "@api/contributions.api";
import { DiscordPollContribution } from "@api/contribution-types/discord-poll-model";
import { AutOSSlider } from "@theme/commitment-slider-styles";
import { dateToUnix } from "@utils/date-format";
import axios from "axios";
import { environment } from "@api/environment";
import { useQuery } from "@tanstack/react-query";
import EmojiOptionInput from "@components/EmojiInputPicker/EmojiInputPicker";

const errorTypes = {
  maxWords: `Words cannot be more than 6`,
  maxLength: `Characters cannot be more than 280`,
  missingEmoji: `Whoops! You forgot to add an emoji 🤭`,
  duplicateOption: `Each option must be unique`,
  duplicateEmoji: `Each emoji must be unique`
};

const durations = [
  { durationName: "1 Day", durationValue: "1d" },
  { durationName: "1 Week", durationValue: "1w" },
  { durationName: "1 Month", durationValue: "1mo" }
];

function durationToMilliseconds(duration) {
  switch (duration) {
    case "1d":
      return 1 * 24 * 60 * 60 * 1000; // days to ms
    case "1w":
      return 1 * 7 * 24 * 60 * 60 * 1000; // weeks to ms
    case "1mo":
      // Approximating a month as 30 days
      return 1 * 30 * 24 * 60 * 60 * 1000; // months to ms
    default:
      return 1 * 24 * 60 * 60 * 1000; // days to ms
  }
}

const fetchTextChannels = async (guildId: string) => {
  const response = await axios.get(
    `${environment.apiUrl}/discord/guild/textChannels/${guildId}`
  );
  return response.data;
};

const hasDuplicates = (array) => {
  return new Set(array).size !== array.length;
};

const validateOptions = (options) => {
  const optionTexts = options.map((o) => o.option.trim()).filter(Boolean);
  const emojis = options.map((o) => o.emoji).filter(Boolean);

  if (hasDuplicates(optionTexts)) {
    return "duplicateOption";
  }
  if (hasDuplicates(emojis)) {
    return "duplicateEmoji";
  }
  return true;
};

const CreatePoll = () => {
  const { state } = useWalletConnector();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const hubData = useSelector(HubData);
  const autID = useSelector(AutIDData);

  const guildId = useMemo(() => {
    const social = hubData.properties.socials.find((s) => s.type === "discord");
    return social.metadata.guildId;
  }, [hubData]);

  const {
    data: textChannels,
    isLoading: isTextChannelsLoading,
    isError: isTextChannelsError,
    error: textChannelsError
  } = useQuery({
    queryKey: ["textChannels", guildId],
    queryFn: () => fetchTextChannels(guildId),
    enabled: !!guildId
  });

  const { control, handleSubmit, getValues, formState, watch } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      duration: "",
      role: null,
      allRoles: false,
      startDate: new Date(),
      options: [
        { option: "", emoji: "" },
        { option: "", emoji: "" }
      ],
      weight: 0,
      channelId: ""
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options"
  });

  const values = watch();

  const [createPoll, { error, isError, isSuccess, isLoading, reset }] =
    useCreateDiscordPollContributionMutation();

  const onSubmit = async () => {
    const values = getValues();
    const joinedHub = autID.joinedHub(hubData.properties.address);

    const contribution = new DiscordPollContribution({
      name: values.title,
      description: values.description,
      image: "",
      properties: {
        taskId: searchParams.get("taskId"),
        role: +joinedHub.role,
        roles: [values.role],
        duration: values.duration,
        guildId,
        options: values.options,
        points: values.weight,
        quantity: 1,
        uri: "",
        channelId: values.channelId,
        startDate: dateToUnix(values.startDate),
        endDate: dateToUnix(
          new Date(
            new Date(values.startDate).getTime() +
              durationToMilliseconds(values.duration)
          )
        )
      }
    });
    debugger;
    createPoll({ contribution, autSig: state.authSig });
  };

  return (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      <ErrorDialog handleClose={() => reset()} open={isError} message={error} />
      <SubmitDialog
        open={isSuccess || isLoading}
        mode={isSuccess ? "success" : "loading"}
        backdropFilter={true}
        message={isLoading ? "" : "Congratulations!"}
        titleVariant="h2"
        subtitle={
          isLoading
            ? "Creating poll..."
            : "Your poll has been created successfully!"
        }
        subtitleVariant="subtitle1"
        handleClose={() => {
          reset();
          navigate({
            pathname: `/${hubData?.name}/contributions`
          });
        }}
      />

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
            fontSize={{ xs: "14px", md: "20px" }}
            color="offWhite.main"
            fontWeight="bold"
          >
            Create Poll
          </Typography>
        </Stack>
        <Typography
          sx={{
            width: { xs: "100%", sm: "700px", xxl: "1000px" }
          }}
          mt={2}
          mx="auto"
          variant="body"
          textAlign="center"
          color="offWhite.main"
          fontSize="16px"
        >
          Create a poll to gather feedback from your community.
        </Typography>
      </Box>

      <Stack
        direction="column"
        gap={4}
        sx={{
          margin: "0 auto",
          width: { xs: "100%", sm: "650px", xxl: "800px" }
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
                value={value}
                onChange={onChange}
                placeholder="Poll Title"
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
              maxLength: 280
            }}
            render={({ field: { name, value, onChange } }) => (
              <StyledTextField
                name={name}
                value={value}
                color="offWhite"
                rows="5"
                multiline
                onChange={onChange}
                placeholder="Poll Description"
                helperText={
                  <FormHelperText
                    errorTypes={errorTypes}
                    value={value}
                    name={name}
                    errors={formState.errors}
                  >
                    <Typography variant="caption" color="white">
                      {280 - (value?.length || 0)} characters left
                    </Typography>
                  </FormHelperText>
                }
              />
            )}
          />
        </TextFieldWrapper>

        <Box>
          <Typography
            variant="caption"
            color="offWhite.main"
            mb={theme.spacing(1)}
          >
            Options
          </Typography>
          {fields.map((field, index) => (
            <Box
              key={field.id}
              sx={{ display: "flex", mb: 2, alignItems: "center" }}
            >
              <Controller
                name={`options.${index}`}
                control={control}
                rules={{
                  required: true,
                  validate: {
                    notEmpty: (value) => {
                      if (!value.option.trim()) {
                        return "Option text is required";
                      }
                      if (!value.emoji) {
                        return "Please select an emoji";
                      }
                      return true;
                    },
                    unique: (value, formValues) => {
                      const result = validateOptions(getValues().options);
                      if (result === "duplicateOption") {
                        return errorTypes.duplicateOption;
                      }
                      if (result === "duplicateEmoji") {
                        return errorTypes.duplicateEmoji;
                      }
                      return true;
                    }
                  }
                }}
                render={({ field, fieldState: { error } }) => (
                  <EmojiOptionInput
                    {...field}
                    placeholder={`Option ${index + 1}`}
                    autoFocus={index === 0}
                    error={!!error}
                    helperText={error?.message}
                    sx={{ flex: 1, mr: 2 }}
                  />
                )}
              />
              {index > 1 && (
                <AutOsButton
                  type="button"
                  onClick={() => remove(index)}
                  variant="text"
                  color="error"
                  sx={{
                    ml: 2,
                    "&.MuiButton-root": {
                      minWidth: "40px",
                      maxWidth: "60px"
                    }
                  }}
                >
                  X
                </AutOsButton>
              )}
            </Box>
          ))}
          {fields.length < 5 && (
            <AutOsButton
              type="button"
              onClick={() => append({ option: "", emoji: "" })}
              variant="text"
              sx={{ mt: 1 }}
            >
              + Add Option
            </AutOsButton>
          )}
        </Box>

        <Controller
          name="duration"
          control={control}
          rules={{ required: true }}
          render={({ field: { name, value, onChange } }) => (
            <AutSelectField
              variant="standard"
              color="offWhite"
              name={name}
              value={value}
              displayEmpty
              required
              onChange={onChange}
              helperText={
                <FormHelperText
                  value={value}
                  name={name}
                  errors={formState.errors}
                >
                  Select poll duration
                </FormHelperText>
              }
            >
              {durations.map(({ durationName, durationValue }) => (
                <MenuItem key={durationValue} value={durationValue}>
                  {durationName}
                </MenuItem>
              ))}
            </AutSelectField>
          )}
        />

        <Controller
          name="role"
          control={control}
          rules={{ required: !values.allRoles }}
          render={({ field: { name, value, onChange } }) => (
            <AutSelectField
              variant="standard"
              color="offWhite"
              name={name}
              value={value}
              displayEmpty
              required={!values.allRoles}
              disabled={values.allRoles}
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
              {hubData?.properties?.rolesSets[0]?.roles?.map((role) => (
                <MenuItem key={role.roleName} value={role.roleName}>
                  {role.roleName}
                </MenuItem>
              ))}
            </AutSelectField>
          )}
        />

        <Controller
          name="allRoles"
          control={control}
          render={({ field: { name, value, onChange } }) => (
            <FormControlLabel
              label="All Roles"
              sx={{ color: "white" }}
              control={
                <Checkbox
                  name={name}
                  checked={value}
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

        <Controller
          name="channelId"
          control={control}
          rules={{
            required: true,
            validate: {
              selected: (v) => !!v
            }
          }}
          render={({ field: { name, value, onChange } }) => {
            return (
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
                    Select voice channel
                  </FormHelperText>
                }
              >
                {textChannels &&
                  !isTextChannelsLoading &&
                  textChannels.map((channel) => {
                    return (
                      <MenuItem
                        key={`channel-${channel.id}`}
                        value={channel.id}
                      >
                        {channel.name}
                      </MenuItem>
                    );
                  })}
              </AutSelectField>
            );
          }}
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
              rules={{ required: true, min: 1, max: 10 }}
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

        <Stack direction="row" gap={4}>
          <Controller
            name="startDate"
            control={control}
            rules={{
              required: true
            }}
            render={({ field: { name, value, onChange } }) => {
              return (
                <AutDatepicker
                  placeholder="Start date"
                  value={value}
                  onChange={onChange}
                />
              );
            }}
          />
        </Stack>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            mb: 4,
            justifyContent: { xs: "center", sm: "flex-end" }
          }}
        >
          <AutOsButton
            type="button"
            color="primary"
            disabled={!formState.isValid}
            onClick={() => onSubmit()}
            variant="outlined"
            sx={{ width: "100px" }}
          >
            <Typography fontWeight="bold" fontSize="16px" lineHeight="26px">
              Create Poll
            </Typography>
          </AutOsButton>
        </Box>
      </Stack>
    </FormContainer>
  );
};

export default memo(CreatePoll);
