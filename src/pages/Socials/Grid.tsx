import { Box, Card, alpha, styled } from "@mui/material";

export const GridBox = styled(Box)(({ theme }) => {
  return {
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "1fr",
    gridGap: "30px",
    [theme.breakpoints.up("sm")]: {
      gridTemplateColumns: "repeat(2,minmax(0,1fr))"
    },
    [theme.breakpoints.up("md")]: {
      gridTemplateColumns: "repeat(3,minmax(0,1fr))"
    },
    [theme.breakpoints.up("lg")]: {
      gridTemplateColumns: "repeat(4,minmax(0,1fr))"
    }
  };
});

export const GridCard = styled(Card)(({ theme }) => {
  return {
    minHeight: "165px",
    width: "100%",
    transition: theme.transitions.create(["transform", "background-color"]),
    "&:hover": {
      transform: "scale(1.019)"
    },
    "&:hover:not(.active)": {
      backgroundColor: alpha(theme.palette.primary.main, 0.16)
    },
    "&.active": {
      backgroundColor: alpha(theme.palette.primary.main, 0.3)
    }
  };
});
