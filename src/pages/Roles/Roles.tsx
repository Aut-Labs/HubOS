import { memo, useEffect, useState } from "react";
import { Box, Container } from "@mui/material";
import { useSelector } from "react-redux";
import { pxToRem } from "@utils/text-size";
import {
  allRoles,
  HubData,
  HubStatus,
  hubUpdateState
} from "@store/Hub/hub.reducer";
import { useAppDispatch } from "@store/store.model";
import { updateHub } from "@api/hub.api";
import { ResultState } from "@store/result-status";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import { AutTextField, FormHelperText } from "@components/Fields";
import { AutHeader } from "@components/AutHeader";
import { AutButton } from "@components/buttons";
import { setTitle } from "@store/ui-reducer";
import AutLoading from "@components/AutLoading";
import { DAutHub } from "@aut-labs/d-aut";

const errorTypes = {
  maxLength: `Characters cannot be more than 280`
};

const Roles = () => {
  const dispatch = useAppDispatch();
  const [promises, setPromises] = useState([]);
  const hub = useSelector(HubData);
  const status = useSelector(HubStatus);
  const roles = useSelector(allRoles);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    mode: "onChange",
    defaultValues: {
      roles
    }
  });
  const values = watch();

  const { fields } = useFieldArray({
    control,
    name: "roles"
  });

  const onSubmit = async (data: typeof values) => {
    hub.properties.rolesSets[0].roles = data.roles;
    const promise = dispatch(updateHub(new DAutHub(hub)));
    setPromises([promise]);
  };

  const handleDialogClose = () => {
    dispatch(
      hubUpdateState({
        status: ResultState.Idle
      })
    );
  };

  useEffect(() => {
    dispatch(setTitle(`Hub Management - Members & Roles in your Hub.`));
  }, [dispatch]);

  useEffect(() => {
    return () => {
      promises.forEach((p) => p.abort());
    };
  }, [dispatch, promises]);

  return (
    <form
      style={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%"
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
        message="Updating hub roles..."
      />
      <Container
        className="sw-roles-wrapper"
        maxWidth="md"
        sx={{
          py: pxToRem(30),
          width: "100%",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
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
            <AutLoading width="130px" height="130px" />
          </div>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column"
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
                          mb: pxToRem(45)
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
                mt: pxToRem(100)
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
