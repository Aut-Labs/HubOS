import { Stack, Typography, TypographyProps } from "@mui/material";

const AppTitle = (props: TypographyProps) => {
  return (
    <Typography
      fontWeight="300"
      fontFamily="FractulAltLight"
      component="h1"
      variant="h1"
      color="white"
      whiteSpace="nowrap"
      sx={{
        display: {
          xs: "flex",
          sm: "unset"
        },
        flexDirection: {
          xs: "column",
          sm: "row"
        }
      }}
      {...(props as any)}
    >
      <strong
        style={{
          fontFamily: "FractulAltBold"
        }}
      >
        Āut
      </strong>{" "}
      Dashboard <Typography variant="body">(beta)</Typography>
    </Typography>
  );
};

export default AppTitle;
