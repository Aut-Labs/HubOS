import { AutButton } from "@components/buttons";
import { FormHelperText } from "@components/Fields";
import { Typography } from "@mui/material";
import { AutTextField } from "@theme/field-text-styles";
import { pxToRem } from "@utils/text-size";
import { Controller, useForm } from "react-hook-form";
import AutLoading from "../AutLoading";
import DialogWrapper from "./DialogWrapper";

const errorTypes = {
  pattern: "Invalid discord invite link"
};

const DiscordServerVerificationPopup = ({ open, fullScreen = false }: any) => {
  const { control, formState } = useForm({
    mode: "onChange",
    defaultValues: {
      inviteLink: ""
    }
  });

  return (
    <DialogWrapper open={open} fullScreen={fullScreen}>
      <div
        className="sw-join-dialog-content"
        style={{
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-around"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <Typography textAlign="center" color="white" variant="subtitle1">
            Verify Discord Server ownership
          </Typography>
          <Typography
            width="100%"
            textAlign="center"
            color="white"
            mb="10"
            variant="body"
          >
            Enter an invite link and authorize with discord.
          </Typography>
        </div>
        <Controller
          name="inviteLink"
          control={control}
          rules={{
            required: true,
            pattern:
              /\b(?:https?:\/\/)?(?:www\.)?(?:discord\.(?:gg|com|io|me|li|gg\/invite))\/([a-zA-Z0-9-]{2,32})/
          }}
          render={({ field: { name, value, onChange } }) => {
            return (
              <AutTextField
                sx={{
                  mt: pxToRem(50)
                }}
                name={name}
                value={value || ""}
                onChange={onChange}
                variant="outlined"
                color="offWhite"
                required
                rows={1}
                placeholder="Discord server invite link."
                helperText={
                  <FormHelperText
                    value={value}
                    name={name}
                    errors={formState.errors}
                    errorTypes={errorTypes}
                  />
                }
              />
            );
          }}
        />
        <div
          style={{
            position: "relative"
          }}
        >
          <AutButton
            disabled={!formState.isValid}
            sx={{
              minWidth: pxToRem(325),
              maxWidth: pxToRem(325),
              height: pxToRem(70),
              mt: pxToRem(50)
            }}
            type="submit"
            color="primary"
            variant="outlined"
          >
            Verify
          </AutButton>
        </div>
      </div>
    </DialogWrapper>
  );
};

export default DiscordServerVerificationPopup;
