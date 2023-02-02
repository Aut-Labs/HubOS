import { createTheme } from "@mui/material/styles";
import { Fade } from "@mui/material";
import AutButtonStyles from "./button-styles";
import AutTextFieldStyles from "./field-text-styles";
import AutSelectFieldStyles from "./field-select-styles";
import AutCommitmentSliderStyles from "./commitment-slider-styles";
import AutTextStyles from "./text-styles";
import AutMenuStyles from "./menu-styles";
import AutPalette from "./palette";
import AutDialogStyles from "./dialog-styles";
import "./theme.overrides";

const AutTheme = createTheme({
  components: {
    MuiTooltip: {
      defaultProps: {
        TransitionComponent: Fade
      }
    },
    MuiUseMediaQuery: {
      defaultProps: {
        noSsr: true
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderStyle: "solid",
          borderWidth: "2px",
          borderColor: AutPalette.primary.main
        }
      }
    }
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 768,
      md: 990,
      lg: 1220,
      xl: 1366,
      xxl: 1920
    }
  },
  palette: AutPalette,
  shape: {
    borderRadius: 0
  }
});

AutTheme.typography = AutTextStyles(AutTheme);
AutTheme.components.MuiButton = AutButtonStyles(AutTheme);
AutTheme.components.MuiDialog = AutDialogStyles(AutTheme);
AutTheme.components.MuiTextField = AutTextFieldStyles(AutTheme);
AutTheme.components.MuiSelect = AutSelectFieldStyles(AutTheme);
AutTheme.components.MuiSlider = AutCommitmentSliderStyles(AutTheme);
AutTheme.components.MuiMenu = AutMenuStyles(AutTheme);

export default AutTheme;
