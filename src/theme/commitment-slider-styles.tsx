import { FormHelperText } from "@components/Fields";
import {
  Typography,
  Slider,
  SliderProps,
  styled,
  PaletteColor,
  Theme,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants
} from "@mui/material";
import { CommitmentMessages } from "@utils/misc";
import { pxToRem } from "@utils/text-size";

export function CommitmentMessage({ value, children = null }) {
  const message = CommitmentMessages(value);
  return (
    <Typography
      color="white"
      whiteSpace="nowrap"
      align="left"
      variant="caption"
      component="span"
      sx={{ display: "flex", mb: "4px", height: "20px" }}
    >
      {message}
    </Typography>
  );
}

const errorTypes = {
  min: "Min 1 commitment level!"
};

interface AutSliderProps {
  value: any;
  sliderProps: SliderProps;
  name: string;
  errors: any;
  sx?: any;
}

const SliderWrapper = styled("div")({
  position: "relative"
});

export const AutOSSlider = ({
  value,
  name,
  errors,
  sx,
  sliderProps,
  ...props
}: AutSliderProps) => {
  return (
    <SliderWrapper sx={sx} className="swiper-no-swiping">
      <div style={{ position: "relative" }}>
        <Slider
          {...sliderProps}
          sx={{
            "&.MuiSlider-root": {
              [`span[data-index="${value}"].MuiSlider-mark`]: {
                borderTop: "2px solid #14ECEC",
                borderBottom: "2px solid #14ECEC"
              }
            }
          }}
        />
      </div>
      <div
        style={{
          marginTop: "-3px",
          display: "flex",
          justifyContent: "flex-end"
        }}
      ></div>
    </SliderWrapper>
  );
};

export const AutCommitmentSlider = ({
  value,
  name,
  errors,
  sx,
  sliderProps,
  ...props
}: AutSliderProps) => {
  return (
    <SliderWrapper sx={sx}>
      <CommitmentMessage value={value} />
      <div style={{ position: "relative" }}>
        <Slider {...sliderProps} />
      </div>
      <div
        style={{
          marginTop: "-3px",
          display: "flex",
          justifyContent: "flex-end"
        }}
      >
        <FormHelperText
          errorTypes={errorTypes}
          value={value}
          name={name}
          errors={errors}
        >
          <Typography color="white" variant="caption">
            No worries, you’ll be able to change this later.
          </Typography>
        </FormHelperText>
      </div>
    </SliderWrapper>
  );
};

const generateColors = (color: PaletteColor) => ({
  color: color.dark,
  ".MuiSlider-mark": {
    borderColor: color.light
  },
  ".MuiSlider-track": {
    background: color.light
  },
  ".MuiSlider-thumb": {
    background: color.main,
    boxShadow: `0px 0px 0px 0px`
  },
  ".MuiTypography-root": {
    color: color.main
  }
});

export default (theme: Theme) =>
  ({
    ...theme.components.MuiSelect,
    styleOverrides: {
      root: {
        // width: "354px",
        padding: "0 !important",
        border: "none",
        "&.MuiSlider-colorPrimary": {
          color: "#14ECEC",
          "&.MuiSlider-rail": {
            display: "none"
          },
          ".MuiSlider-track": {
            display: "none"
            // marginLeft: "34px",
            // boxShadow:
            //   "0px 16px 80px 0px #2E90FA, 0px 16px 64px 0px rgba(20, 200, 236, 0.64), 0px 8px 32px 0px rgba(20, 200, 236, 0.32), 0px 16px 80px 0px #2E90FA, 0px 16px 64px 0px rgba(20, 200, 236, 0.64), 0px 8px 32px 0px rgba(20, 200, 236, 0.32)",
            // background: "transparent",
            // height: "6px",
            // border: "none",
            // borderRadius: 0
          },
          ".MuiTypography-root": {
            color: theme.palette.offWhite.main
          }
        },
        minWidth: "354px",
        height: "20px",

        [theme.breakpoints.up("sm")]: {
          minWidth: "600px"
        },
        [theme.breakpoints.up("md")]: {
          minWidth: "600px",
          ".MuiSlider-thumb": {
            display: "none"
          }
        },
        [theme.breakpoints.up("xxl")]: {
          minWidth: "800px",
          ".MuiSlider-thumb": {
            display: "none"
          }
        },

        'span[data-index="0"].MuiSlider-mark': {
          display: "none"
        },

        ".MuiSlider-mark": {
          background: "#818CA2",
          opacity: 1,
          width: "32px",
          height: "6px",
          marginRight: "2px",
          marginLeft: "-32px",

          [theme.breakpoints.up("sm")]: {
            width: "52px",
            height: "9px",
            marginLeft: "-62px"
          },
          [theme.breakpoints.up("md")]: {
            width: "52px",
            height: "9px",
            marginLeft: "-62px"
          },
          [theme.breakpoints.up("xxl")]: {
            width: "70px",
            height: "12px",
            marginLeft: "-76px"
          },

          "&.MuiSlider-markActive": {
            background: "#14ECEC",
            boxShadow: `
            0px 8px 20px 0px rgba(46, 144, 250, 0.25),
            0px 4px 16px 0px rgba(20, 200, 236, 0.22),
            0px 2px 8px 0px rgba(20, 200, 236, 0.18)
          `,
            // boxShadow:
            //   "0px 16px 80px 0px #2E90FA, 0px 16px 64px 0px rgba(20, 200, 236, 0.64), 0px 8px 32px 0px rgba(20, 200, 236, 0.32), 0px 16px 80px 0px #2E90FA, 0px 16px 64px 0px rgba(20, 200, 236, 0.64), 0px 8px 32px 0px rgba(20, 200, 236, 0.32)",

            overflow: "hidden"
          }
        },
        ".MuiSlider-thumb": {
          display: "none"
        },
        ".MuiSlider-track": {
          borderRight: "0"
        },

        ".MuiSlider-rail": {
          opacity: "0"
        }
      }
    } as ComponentsOverrides<Theme>["MuiSlider"]
  }) as {
    defaultProps?: ComponentsProps["MuiSlider"];
    styleOverrides?: ComponentsOverrides<Theme>["MuiSlider"];
    variants?: ComponentsVariants["MuiSlider"];
  };
