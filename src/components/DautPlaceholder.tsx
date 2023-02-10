import { useLayoutEffect, useState } from "react";

export const DautPlaceholder = ({
  horizontal = "right",
  vertical = "top",
  hide = true,
  styles = {}
}) => {
  const [[width, height], setElSize] = useState([270, 55]);

  useLayoutEffect(() => {
    function updateDautPosition() {
      const dautEl: HTMLElement = document.querySelector("#d-aut");
      if (!dautEl) return;
      const placeholderEl: HTMLElement = document.querySelector(
        ".web-component-placeholder"
      );
      if (!placeholderEl) return;
      const placeholderRect = placeholderEl.getBoundingClientRect();
      dautEl.style.left = `${placeholderRect.left}px`;
      dautEl.style.top = `${placeholderRect.top}px`;
      if (hide) {
        dautEl.style.display = "none";
      } else {
        dautEl.style.display = "inherit";
      }
    }
    window.addEventListener("resize", updateDautPosition);
    setTimeout(() => updateDautPosition());
    return () => window.removeEventListener("resize", updateDautPosition);
  }, [hide]);

  return (
    <div
      style={{
        width,
        height,
        position: "absolute",
        visibility: "visible",
        ...(hide && {
          visibility: "hidden"
        }),
        ...(horizontal === "right" && {
          right: "20px"
        }),
        ...(horizontal === "center" && {
          left: "50%",
          transform: "translateX(-50%)"
        }),
        ...(horizontal === "left" && {
          left: "20px"
        }),
        ...(vertical === "top" && {
          top: "20px"
        }),
        ...(vertical === "bottom" && {
          bottom: "10px"
        }),
        zIndex: -1,
        ...styles
      }}
      className="web-component-placeholder"
    />
  );
};
