import { memo, useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Divider,
  Typography,
} from "@mui/material";
import { Community } from "@api/community.model";
import { useSelector } from "react-redux";
import PartnerButton from "@components/Button";
import { pxToRem } from "@utils/text-size";
import {
  allRoles,
  communityUpdateState,
} from "@store/Community/community.reducer";
import { RootState, useAppDispatch } from "@store/store.model";
import { updatePartnersCommunity } from "@api/community.api";
import { ResultState } from "@store/result-status";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import ErrorDialog from "@components/ErrorPopup";
import LoadingDialog from "@components/LoadingPopup";
import { AutTextField, FormHelperText } from "@components/Fields";
import { AutHeader } from "@components/AutHeader";
import { AutButton } from "@components/buttons";
import { setTitle } from "@store/ui-reducer";
import "./Roles.scss";

const errorTypes = {
  maxLength: `Characters cannot be more than 280`,
};

const Roles = () => {
  const dispatch = useAppDispatch();
  const { status, community } = useSelector(
    (state: RootState) => state.community
  );
  const roles = useSelector(allRoles);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      roles,
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "roles",
  });

  useEffect(() => {
    dispatch(setTitle(`DAO Management - Sublime Here`));
  }, [dispatch]);

  const values = watch();

  const onSubmit = async (data: typeof values) => {
    community.properties.rolesSets[0].roles = data.roles;
    await dispatch(
      updatePartnersCommunity(
        new Community({
          ...community,
          properties: {
            ...community.properties,
          },
        })
      )
    );
  };

  const handleDialogClose = () => {
    dispatch(
      communityUpdateState({
        status: ResultState.Idle,
      })
    );
  };

  return (
    <form
      style={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      autoComplete="off"
      onSubmit={handleSubmit(onSubmit)}
    >
      <ErrorDialog
        handleClose={handleDialogClose}
        open={status === ResultState.Failed}
        message="Something went wrong"
      />
      <LoadingDialog
        handleClose={handleDialogClose}
        open={status === ResultState.Updating}
        message="Updating community roles..."
      />
      <Container
        className="sw-roles-wrapper"
        maxWidth="md"
        sx={{
          width: "100%",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <AutHeader
          title="Manage Your Roles"
          subtitle={
            <>
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam{" "}
              <br />
              nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
            </>
          }
        />
        {status === ResultState.Loading ? (
          <div className="sw-loading-spinner">
            <CircularProgress
              sx={{
                justifyContent: "center",
                alignContent: "center",
              }}
            />
          </div>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
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
                          <FormHelperText
                            errorTypes={errorTypes}
                            value={value}
                            name={name}
                            errors={errors}
                          >
                            <span>
                              {20 - (value?.length || 0)} of 20 characters left
                            </span>
                          </FormHelperText>
                        }
                      />
                    </>
                  );
                }}
              />
            ))}

            <AutButton
              sx={{
                minWidth: pxToRem(325),
                maxWidth: pxToRem(325),
                height: pxToRem(70),
                mt: pxToRem(100),
              }}
              type="submit"
              color="primary"
              variant="outlined"
            >
              Save
            </AutButton>
          </Box>
        )}
      </Container>
    </form>
  );
};

export default memo(Roles);
