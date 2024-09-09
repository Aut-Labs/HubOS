import { Box, styled } from "@mui/material";
import { AutTextField } from "@theme/field-text-styles";

export const StyledTextField = styled(AutTextField)(({ theme }) => ({
  width: "100%",
  ".MuiInputBase-input": {
    fontSize: "16px",
    color: theme.palette.offWhite.main,
    "&::placeholder": {
      color: theme.palette.offWhite.main,
      opacity: 0.5
    },
    "&.Mui-disabled": {
      color: "#7C879D",
      textFillColor: "#7C879D"
    }
  },
  ".MuiInputBase-root": {
    caretColor: theme.palette.primary.main,
    fieldset: {
      border: "1.5px solid #576176 !important",
      borderRadius: "6px"
    },
    borderRadius: "6px",
    background: "#2F3746"
  },
  ".MuiInputLabel-root": {
    color: "#7C879D"
  }
}));

export const TextFieldWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column"
}));

export const SliderFieldWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column"
}));

export const CommitmentSliderWrapper = styled("div")(({ theme }) => ({
  width: "100%",
  maxWidth: "100%",
  marginTop: 0,
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    maxWidth: "650px"
  },
  [theme.breakpoints.up("xxl")]: {
    maxWidth: "800px"
  },
  [theme.breakpoints.down("lg")]: {
    marginTop: 0
  }
}));
