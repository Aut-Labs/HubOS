/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint react/prop-types: 0 */

import { pxToRem } from "@utils/text-size";
import { styled } from "@mui/system";
import { Fragment } from "react";
import { ReactComponent as CutLogo } from "@assets/aut/cut.svg";
import Circle from "@assets/aut/icon.svg";
import SmCircle from "@assets/aut/small-icon.svg";
import { Typography } from "@mui/material";
import { StepperNavProps } from "./model";

interface DotProps {
  isActive: boolean;
}

const Dot = styled("div")<DotProps>(({ isActive, title }) => ({
  lineHeight: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  position: "relative",
  "&::after": {
    content: `" "`,
    position: "absolute",
    width: pxToRem(60),
    height: pxToRem(60),
    borderRadius: "50%",
    backgroundColor: "transparent",
    ...(isActive && {
      background: `url(${Circle})`
    }),
    zIndex: 1
  }
  // '&::before': {
  //   content: `"${title}"`,
  //   color: '#fff',
  //   position: 'absolute',
  //   width: pxToRem(120),
  //   height: '2rem',
  //   top: pxToRem(70),
  // },
}));

const DotInner = styled("div")<DotProps>(({ isActive }) => ({
  width: pxToRem(20),
  height: pxToRem(20),
  borderRadius: "50%",
  // backgroundColor: '#009FE3',
  background: `url(${SmCircle})`,
  zIndex: 2
  // ...(isActive && {
  //   backgroundColor: '#000',
  // }),
}));

const NavWrapper = styled("div")({
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  width: pxToRem(950),
  margin: "0 auto"
});

const DotWrapper = styled("div")({
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
  flexDirection: "column",
  minHeight: pxToRem(80),
  // marginBottom: pxToRem(20),
  position: "relative",
  width: "100%"
});

const StepperNav = (props: StepperNavProps) => {
  const dots = [];
  for (let i = 1; i <= props.totalSteps; i += 1) {
    const isActive = props.currentStep === i;
    const isComplete = props.currentStep > i;
    const { title } = props.steps[i - 1];

    dots.push(
      <Fragment key={`nav-step-top-${i}`}>
        <span
          key={`nav-step-${i}`}
          onClick={() => isComplete && props.goToStep(i)}
        >
          <Dot key={`nav-dot-${i}`} isActive={isActive} title={title || " "}>
            <DotInner isActive={isActive || isComplete} />
          </Dot>
        </span>
        {/* {props.totalSteps !== i && <StepperLine key={`nav-stepper-line-${i}`} />} */}
      </Fragment>
    );
  }

  return (
    <NavWrapper>
      <DotWrapper>
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          {dots}
        </div>
        <CutLogo
          style={{
            position: "absolute"
          }}
          width="100%"
        />
      </DotWrapper>
      {props.steps[props.currentStep - 1].description && (
        <Typography
          component="div"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            mt: pxToRem(30),
            mb: pxToRem(80),
            maxWidth: "85%",
            fontSize: pxToRem(16)
          }}
        >
          {props.steps[props.currentStep - 1].description}
        </Typography>
      )}
    </NavWrapper>
  );
};

export default StepperNav;
