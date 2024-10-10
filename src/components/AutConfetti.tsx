// @ts-ignore
import * as animationData from "@assets/confetti.json";
import { memo } from "react";
import Lottie from "react-lottie-player/dist/LottiePlayerLight";

const AutConfetti = ({ width = "250px", height = "250px" }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%)`
      }}
    >
      <Lottie
        loop
        animationData={animationData}
        play
        style={{ width: width, height: height }}
      />
    </div>
  );
};

export default memo(AutConfetti);