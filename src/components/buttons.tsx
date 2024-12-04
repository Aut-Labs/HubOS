import { Button, ButtonProps } from "@mui/material";
import { styled } from "@mui/material/styles";

export const AutButton = styled<ButtonProps<any, any>>(Button)(({ theme }) => ({
  // "&.MuiButton-root": {
  //   border: `3px solid ${theme.palette.primary.main}`,
  //   borderRadius: "50px",
  //   textDecoration: "uppercase",
  //   color: "white",
  //   letterSpacing: "3px",
  //   fontSize: pxToRem(20),
  //   "&.Mui-disabled": {
  //     color: "white",
  //     opacity: ".3"
  //   },
  //   "&:hover": {
  //     backgroundColor: "#009ADE",
  //     color: "white"
  //   }
  // }
}));

export const AutOsButton = styled<ButtonProps<any, any>>(Button)(
  ({ theme }) => ({
    "&.MuiButton-root": {
      background: theme.palette.offWhite.dark,
      borderRadius: "8px",
      border: "none",
      textTransform: "none",
      fontWeight: "700",
      color: "white",
      display: "flex",
      height: "40px",
      minWidth: "128px",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
      flexShrink: 0,
      letterSpacing: "3px",
      fontSize: "20px",
      "&.Mui-disabled": {
        color: "#818CA2",
        opacity: "1"
      },
      "&:hover": {
        backgroundColor: "#818CA2",
        color: "white"
      }
    }
  })
);

export const AutOsTabButton = styled<ButtonProps<any, any>>(Button)(
  ({ theme }) => ({
    ".MuiButtonBase-root": {
      height: {
        xs: "45px"
      },
      width: {
        xs: "unset",
        md: "120px",
        xxl: "180px"
      },
      display: "flex",
      borderRadius: "99px",
      backgroundColor: "transparent",
      textTransform: "inherit",
      color: "offWhite.main",
      border: `1px solid ${theme.palette.divider}`,
      transition: theme.transitions.create([
        "border-color",
        "background-color",
        "color"
      ]),
      ":hover": {
        border: `1px solid ${theme.palette.offWhite.main}`
      },
      "&.Mui-selected": {
        bgcolor: "offWhite.main",
        color: "nightBlack.main"
      },
      "&.Mui-disabled": {
        color: "offWhite.dark",
        opacity: "0.8"
      }
    }
  })
);
