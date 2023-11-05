import { MenuItem, Stack, styled, Typography } from "@mui/material";
import { useAppDispatch } from "@store/store.model";
import { Controller, useForm } from "react-hook-form";
import { pxToRem } from "@utils/text-size";
import {
  CreatePollData,
  PollError,
  PollStatus,
  pollUpdateStatus,
  pollUpdateData,
  resetPollState
} from "@store/Activity/poll.reducer";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import { ResultState } from "@store/result-status";
import { addPoll } from "@api/activities.api";
import { AutHeader } from "@components/AutHeader";
import { AutButton } from "@components/buttons";
import { allRoles, CommunityData } from "@store/Community/community.reducer";
import { AutSelectField, FormHelperText } from "@components/Fields";
import { useNavigate, useNavigation } from "react-router-dom";
import {
  useCreatePollMutation,
  useGetTextChannelsQuery,
  useGetGuildIdQuery
} from "@api/discord.api";

const StepWrapper = styled("form")({
  textAlign: "center",
  display: "flex",
  justifyContent: "center",
  flexDirection: "column"
});

const CreatePollParticipantsStep = () => {
  const [createPoll, { isLoading: creatingPoll, isSuccess }] =
    useCreatePollMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [roles] = useState(useSelector(allRoles));
  const status = useSelector(PollStatus);
  const errorMessage = useSelector(PollError);
  const data = useSelector(CreatePollData);
  const communityData = useSelector(CommunityData);

  const {
    data: guildId,
    isLoading: guildIdLoading,
    isFetching,
    refetch
  } = useGetGuildIdQuery(null);

  const { data: channels } = useGetTextChannelsQuery(guildId, {
    skip: guildId === undefined
  });

  const { control, handleSubmit, watch, reset, formState } = useForm({
    mode: "onSubmit",
    defaultValues: {
      role: data.role,
      allRoles: data.allRoles,
      channelId: null
    }
  });

  const values = watch();
  const handleDialogClose = () => {
    dispatch(pollUpdateStatus(ResultState.Idle));
  };

  const onSubmit = async () => {
    const { emojis, options } = data.options.reduce(
      (prev, { option, emoji }) => {
        prev.emojis = [...prev.emojis, emoji];
        prev.options = [...prev.options, option];
        return prev;
      },
      {
        emojis: [],
        options: []
      }
    );
    const metadata = {
      guildId,
      ...data,
      ...values,
      options,
      emojis
    };
    debugger;
    await dispatch(pollUpdateData(values));
    await createPoll(metadata);
    // const result = await dispatch(addPoll(metadata));
    // if (result.meta.requestStatus === "fulfilled") {
    //   navigate("/aut-dashboard/event-factory/polls/success");
    // }
  };

  useEffect(() => {
    debugger;
    if (isSuccess) navigate(`/${communityData.name}/bot/poll/success`);
  }, [isSuccess]);

  useEffect(() => {
    return () => {
      dispatch(resetPollState());
    };
  }, [dispatch]);

  return (
    <Stack
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        margin: "0 auto",
        width: {
          xs: "100%",
          sm: "400px",
          xxl: "500px"
        }
      }}
    >
      <ErrorDialog
        handleClose={handleDialogClose}
        open={status === ResultState.Failed}
        message={errorMessage || "Something went wrong"}
      />
      <LoadingDialog
        handleClose={handleDialogClose}
        open={status === ResultState.Updating}
        message="Creating community poll..."
      />

      <LoadingDialog open={creatingPoll} message="Creating poll..." />
      <Typography mt={7} textAlign="center" color="white" variant="h3">
        Polls
      </Typography>
      <Typography
        className="text-secondary"
        mx="auto"
        my={2}
        textAlign="center"
        color="white"
        variant="body1"
      >
        Decide whether this is a Poll for the entire Community, or for a
        specific Role. <br /> Who will participate in this Poll?
      </Typography>
      <StepWrapper
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Controller
          rules={{
            required: !values.allRoles
          }}
          name="role"
          control={control}
          render={({ field: { name, value, onChange } }) => {
            return (
              <AutSelectField
                variant="standard"
                autoFocus
                renderValue={(selected: string) => {
                  if (!selected) {
                    return "Select One";
                  }
                  return selected;
                }}
                width="450"
                name={name}
                color="offWhite"
                value={value || ""}
                displayEmpty
                disabled={values.allRoles}
                required={!values.allRoles}
                onChange={onChange}
              >
                {roles.map((r, index) => (
                  <MenuItem
                    color="primary"
                    key={`role-option-key-${r.roleName}-${index}`}
                    value={r.roleName}
                  >
                    {r.roleName}
                  </MenuItem>
                ))}
              </AutSelectField>
            );
          }}
        />

        <Controller
          name="allRoles"
          control={control}
          render={({ field: { name, value, onChange } }) => {
            return (
              <AutButton
                name={name}
                color="offWhite"
                variant="outlined"
                type="button"
                onClick={() => {
                  reset({
                    role: null,
                    allRoles: !value
                  });
                }}
                className={value ? "active-link" : ""}
                sx={{
                  maxWidth: pxToRem(450),
                  minHeight: pxToRem(50),
                  "&.MuiButton-root": {
                    borderRadius: 0,
                    borderWidth: "2px"
                  }
                }}
              >
                <Typography variant="body2">All of the Community</Typography>
              </AutButton>
            );
          }}
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
                // renderValue={(selected) => {
                //   if (!selected) {
                //     return "Role" as any;
                //   }
                //   const role = roles.find((t) => t.id === selected);
                //   return role?.roleName || selected;
                // }}
                name={name}
                width="450"
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
                    Select text channel
                  </FormHelperText>
                }
              >
                {channels &&
                  !guildIdLoading &&
                  channels.map((channel) => {
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

        <AutButton
          sx={{
            minWidth: pxToRem(325),
            maxWidth: pxToRem(325),
            height: pxToRem(70),
            mt: pxToRem(100)
          }}
          type="submit"
          color="offWhite"
          variant="outlined"
          disabled={!values?.role && !values.allRoles}
        >
          Submit
        </AutButton>
      </StepWrapper>
    </Stack>
  );
};

export default CreatePollParticipantsStep;
