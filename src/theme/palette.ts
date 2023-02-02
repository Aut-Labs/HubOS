import { Palette } from "@mui/material";

export default {
  background: {
    default: "#262626",
    paper: "#EBEBF2"
  },
  primary: {
    main: "#14ECEC",
    light: "#70ffff",
    dark: "#00b9ba",
    contrastText: "#000000"
  },
  secondary: {
    main: "#112BB3",
    light: "#5d55e6",
    dark: "#000582",
    contrastText: "#ffffff"
  },
  error: {
    main: "#FF0000",
    light: "#ff5a36",
    dark: "#c20000",
    contrastText: "#000000"
  },
  // white: {
  //   main: "#ffffff",
  //   light: "#ffffff",
  //   dark: "#cccccc",
  //   contrastText: "#000000"
  // },
  offWhite: {
    main: "#EBEBF2",
    light: "#ffffff",
    dark: "#b9b9bf",
    contrastText: "#000000"
  },
  nightBlack: {
    main: "#262626",
    light: "#4e4e4e",
    dark: "#000000",
    contrastText: "#ffffff"
  }
} as Partial<Palette>;
