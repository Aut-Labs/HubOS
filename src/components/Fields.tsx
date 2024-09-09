import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import {
  Button,
  Select,
  SelectProps,
  TextField,
  TextFieldProps,
  Typography,
  useMediaQuery
} from "@mui/material";
import { Breakpoint, styled } from "@mui/material/styles";
import { pxToRem } from "@utils/text-size";
import { Controller, FieldErrors } from "react-hook-form";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
// import "./ScrollbarStyles.scss";

import {
  usePickerLayout,
  PickersLayoutRoot,
  pickersLayoutClasses,
  PickersLayoutContentWrapper
} from "@mui/x-date-pickers/PickersLayout";
import {
  DatePicker,
  DateTimePicker,
  PickersActionBarProps
} from "@mui/x-date-pickers";
import theme from "@theme/theme";
import { StepperButton } from "./Stepper";
import { generateFieldColors } from "@theme/field-text-styles";

interface FormHelperTextProps {
  errors: FieldErrors<any>;
  name: string;
  children?: string | JSX.Element;
  errorTypes?: any;
  value: any;
}

const defaultErrorTypes = {
  required: "Field is required!"
};

function extractObject(obj, prop) {
  if (!obj || !Object.keys(obj).length) return false;
  // Split the property string into an array of keys
  const keys = prop.split(".");

  if (keys.length === 1) {
    return obj[prop];
  }

  // Loop through each key to access the nested object
  let nestedObj = obj;
  for (let i = 0; i < keys.length; i++) {
    try {
      const regex = /\[(\d+)\]/;
      if (regex.test(keys[i])) {
        const [key, index] = regex.exec(keys[i]);
        const childProp = keys[i].replace(key, "");
        nestedObj = nestedObj[childProp][+index];
      } else {
        nestedObj = nestedObj[keys[i]];
      }
    } catch (error) {
      // console.log(error);
    }
  }

  // Return the nested object
  return nestedObj;
}

export function FormHelperText({
  errors,
  name,
  errorTypes,
  children = null,
  value
}: FormHelperTextProps) {
  const obj = extractObject(errors, name);
  if (obj) {
    const type = obj?.type;
    const types = {
      ...defaultErrorTypes,
      ...(errorTypes || {})
    };

    const message = types[type as any];

    return (
      <Typography
        whiteSpace="nowrap"
        color="red"
        align="right"
        component="span"
        variant="body2"
        className="auto-helper-error"
        sx={{
          width: "100%",
          position: "absolute",
          left: "0"
        }}
      >
        {message}
      </Typography>
    );
  }
  return (
    children && (
      <Typography
        sx={{
          width: "100%",
          position: "absolute",
          left: "0"
        }}
        className="auto-helper-info text-secondary"
        align="right"
        component="span"
        variant="body2"
      >
        {children}
      </Typography>
    )
  );
}

const CustomSwCalendarPicker = styled(DateCalendar)(({ theme }) => ({
  "&.MuiDateCalendar-root": {
    width: pxToRem(376),
    minHeight: pxToRem(480)
  },
  ".MuiTypography-caption": {
    color: theme.palette.primary.main
  },
  ".MuiTypography-root, .MuiButtonBase-root": {
    fontSize: pxToRem(25),
    width: pxToRem(50),
    height: pxToRem(50)
  },
  'div[role="presentation"]': {
    ".PrivatePickersFadeTransitionGroup-root": {
      fontSize: pxToRem(29),
      color: theme.palette.primary.main
    }
  },
  ".MuiPickersDay-hiddenDaySpacingFiller": {
    width: "3.125rem",
    height: "3.125rem"
  },
  ".MuiButtonBase-root .MuiSvgIcon-root": {
    width: pxToRem(40),
    height: pxToRem(40),
    color: "white"
  },
  ".MuiPickersSlideTransition-root": {
    minHeight: pxToRem(320),
    ".MuiButtonBase-root.Mui-disabled": {
      color: "#777777",
      borderRadius: 0,
      backgroundColor: "black"
    },
    ".MuiButtonBase-root:not(.Mui-disabled)": {
      backgroundColor: "#707070",
      color: "white",
      borderRadius: 0,
      "&:hover, &.Mui-selected": {
        backgroundColor: theme.palette.primary.main,
        color: "#fff"
      }
    }
  }
}));

function CustomLayout(props) {
  const { toolbar, tabs, content, actionBar } = usePickerLayout(props);
  return (
    <PickersLayoutRoot className={pickersLayoutClasses.root} ownerState={props}>
      {actionBar}
      {toolbar}
      <PickersLayoutContentWrapper
        className={pickersLayoutClasses.contentWrapper}
        sx={{
          padding: {
            sm: "10px",
            xl: "20px"
          }
        }}
      >
        {tabs}
        {content}
      </PickersLayoutContentWrapper>
    </PickersLayoutRoot>
  );
}

function ActionList(props: PickersActionBarProps) {
  const { onAccept, className } = props;
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <Button
      onClick={onAccept}
      variant="outlined"
      size="normal"
      color="offWhite"
      sx={{
        textAlign: "center",
        textTransform: "uppercase",
        width: "120px",
        height: "40px",
        margin: "8px auto 0 auto"
      }}
    >
      Confirm
    </Button>
  );
}

export const AutDatepicker = ({ value, onChange, placeholder, ...props }) => {
  return (
    //@ts-ignore
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateTimePicker
        value={value || ""}
        disablePast
        closeOnSelect={false}
        desktopModeMediaQuery={theme.breakpoints.up("sm")}
        {...props}
        onAccept={(newValue) => onChange(newValue)}
        slots={{
          layout: CustomLayout,
          actionBar: ActionList
        }}
        slotProps={{
          popper: {
            sx: {
              ".MuiDateCalendar-root": {
                borderRight: "1px white solid",
                paddingRight: "10px"
              },
              ".MuiDivider-root": {
                width: 0
              },
              ".MuiMultiSectionDigitalClock-root": {
                ul: {
                  borderLeft: 0
                }
              },
              "div.MuiMultiSectionDigitalClock-root": {
                marginLeft: "30px",
                ul: {
                  borderLeft: 0,
                  "&:last-of-type": {
                    display: "flex",
                    flexDirection: "column"
                  }
                }
              },
              "MuiPickersCalendarHeader-label": {
                fontSize: "18px"
              }
            }
          },
          desktopPaper: {
            sx: {
              svg: { color: theme.palette.offWhite.main },
              span: { color: theme.palette.offWhite.main },
              backgroundColor: theme.palette.background.default,
              color: theme.palette.offWhite.main,
              ".MuiPickersLayout-root": {
                display: "flex",
                flexDirection: "column"
              },
              ".MuiPickersCalendarHeader-label": {
                fontSize: "18px"
              }
            }
          },
          mobilePaper: {
            sx: {
              svg: { color: theme.palette.offWhite.main },
              span: { color: theme.palette.offWhite.main },
              backgroundColor: theme.palette.background.default,
              color: theme.palette.offWhite.main,
              ".MuiPickersToolbarText-root.Mui-selected": {
                color: theme.palette.primary.main
              }
            }
          },
          textField: {
            placeholder,
            color: "offWhite",
            sx: {
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
            }
            // sx: (theme) => {
            //   const fontSize = {
            //     xs: "16px",
            //     sm: "16px",
            //     md: "16px",
            //     lg: "16px",
            //     xxl: "16px"
            //   };
            //   const styles = generateFieldColors(
            //     theme.palette["offWhite"],
            //     theme.palette.offWhite
            //   );
            //   Object.keys(fontSize).forEach((key: Breakpoint) => {
            //     styles.input[theme.breakpoints.up(key)] = {
            //       fontSize: fontSize[key]
            //     };
            //     styles.textarea[theme.breakpoints.up(key)] = {
            //       fontSize: fontSize[key]
            //     };
            //   });
            //   return {
            //     ...styles,
            //     width: "100%"
            //   };
            // }
          },
          openPickerButton: {
            sx: {
              color: theme.palette.offWhite.main
            }
          },
          day: {
            sx: {
              color: theme.palette.offWhite.main,
              "&.MuiPickersDay-today": {
                borderColor: theme.palette.offWhite.main
              }
            }
          },
          layout: {
            sx: {
              display: "flex",
              flexDirection: "column"
            }
          }
        }}
      />
    </LocalizationProvider>
  );
};

// export const SwDatePicker = ({
//   control,
//   name,
//   minDate,
//   maxDate = null,
//   otherProps = {}
// }) => {
//   return (
//     <Controller
//       name={name}
//       control={control}
//       render={({ field }) => {
//         return (
//           <DatePicker
//             inputFormat="dd/MM/yyyy"
//             minDate={minDate}
//             maxDate={maxDate}
//             PaperProps={{
//               sx: {
//                 "&.MuiDateCalendar-root": {
//                   width: pxToRem(480),
//                   background: "red",
//                   'div[role="presentation"], .MuiButtonBase-root, .MuiTypography-root, .PrivatePickersYear-yearButton':
//                     {
//                       fontSize: pxToRem(18),
//                       color: "primary.main",
//                       "&.Mui-selected": {
//                         color: "text.primary"
//                       },
//                       "&[disabled]": {
//                         color: "text.disabled"
//                       }
//                     }
//                 }
//               }
//             }}
//             value={field.value}
//             onChange={field.onChange}
//             renderInput={(params) => {
//               const v = params.inputProps.value;
//               delete params.inputProps.value;
//               return (
//                 <TextField
//                   {...params}
//                   value={field.value ? v : ""}
//                   color="primary"
//                   name={field.name}
//                   required
//                 />
//               );
//             }}
//             {...otherProps}
//           />
//         );
//       }}
//     />
//   );
// };

export const SwCalendarPicker = ({
  control,
  name,
  minDate,
  maxDate = null,
  otherProps = {}
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        return (
          <CustomSwCalendarPicker
            minDate={minDate}
            maxDate={maxDate}
            value={field.value ? new Date(field.value) : null}
            onChange={field.onChange}
            {...otherProps}
          />
        );
      }}
    />
  );
};

export const AutTextField = styled(
  (props: TextFieldProps & { width: string }) => <TextField {...props} />
)(({ theme, width, multiline }) => ({
  width: pxToRem(width),
  ".MuiInputLabel-root": {
    top: "-2px"
  },
  ".MuiFormHelperText-root": {
    marginRight: 0,
    marginLeft: 0,
    textAlign: "right",
    position: "relative"
  },
  ".MuiInput-underline": {
    "&:after": {
      borderWidth: "1px",
      transform: "scaleX(1)"
    }
  },
  ".MuiOutlinedInput-root, .MuiInput-underline": {
    color: "#fff",
    fontSize: pxToRem(18),
    ...(!multiline && {
      padding: 0,
      height: pxToRem(50)
    }),
    ".MuiInputBase-input": {
      paddingTop: 0,
      paddingBottom: 0
    },
    "&::placeholder": {
      opacity: 1,
      color: "#707070"
    },
    "&::-webkit-input-placeholder": {
      color: "#707070",
      opacity: 1,
      fontSize: pxToRem(18)
    },
    "&::-moz-placeholder": {
      color: "#707070",
      opacity: 1
    }
  },
  ".MuiOutlinedInput-root": {
    "& > fieldset": {
      border: "1px solid #439EDD",
      borderWidth: "1px"
    },
    "&.Mui-focused fieldset, &:hover fieldset": {
      border: "1px solid #439EDD",
      borderWidth: "1px !important"
    }
  }
}));

const StyledSelectField = styled((props: SelectProps & { width: string }) => {
  return (
    <Select
      MenuProps={{
        sx: {
          ".MuiPaper-root": {
            borderWidth: "1px !important",
            background: "black"
          },
          borderTop: 0,
          "& ul": {
            color: "#000",
            padding: 0
          },
          "& li": {
            fontSize: pxToRem(18),
            color: "white",
            "&:hover:not(.Mui-selected)": {
              backgroundColor: "#009FE3",
              color: "#fff"
            },
            "&.Mui-selected:hover, &.Mui-selected": {
              backgroundColor: "#009FE3",
              color: "#fff"
            }
          }
        }
      }}
      {...props}
    />
  );
})(({ width }) => ({
  ".MuiPopover-paper": {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: "8px"
  },
  ".MuiFormHelperText-root": {
    marginRight: 0,
    marginLeft: 0,
    textAlign: "right",
    position: "relative"
  },
  "&.MuiInput-underline": {
    "&:after": {
      borderWidth: "1px",
      transform: "scaleX(1)"
    }
  },
  "&.MuiOutlinedInput-root, &.MuiInput-underline": {
    width: pxToRem(width),
    ".MuiSelect-select, .MuiSelect-nativeInput": {
      height: "100%",
      display: "flex",
      alignItems: "center"
    },
    color: "#fff",
    padding: 0,
    fontSize: "16px",
    height: "48px",
    ".MuiInputBase-input": {
      paddingTop: 0,
      paddingBottom: 0,
      color: "#fff !important"
    },
    ".MuiSvgIcon-root": {
      fontSize: "16px",
      color: "#fff"
    },
    "&::placeholder": {
      opacity: 1,
      color: "#707070"
    },
    "&::-webkit-input-placeholder": {
      color: "#707070",
      opacity: 1,
      fontSize: pxToRem(18)
    },
    "&::-moz-placeholder": {
      color: "#707070",
      opacity: 1
    }
  },
  "&.MuiOutlinedInput-root": {
    fieldset: {
      border: "1px solid #439EDD"
    },
    "&:hover fieldset": {
      border: "2px solid #439EDD"
    },
    ".MuiSelect-select, .MuiSelect-nativeInput": {
      justifyContent: "center"
    }
  }
}));

const SelectWrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
  marginBottom: pxToRem(45),
  position: "relative",
  ".auto-helper-info, .auto-helper-error": {
    bottom: "-18px"
  }
});

interface AutSelectProps extends Partial<SelectProps & any> {
  width: string;
  helperText?: JSX.Element;
}
export const AutSelectField = ({
  helperText = null,
  ...props
}: AutSelectProps) => {
  return (
    <SelectWrapper>
      <StyledSelectField {...props} />
      {helperText}
    </SelectWrapper>
  );
};
