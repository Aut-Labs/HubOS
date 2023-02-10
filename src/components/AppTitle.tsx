import { Typography, TypographyProps } from "@mui/material";

const AppTitle = (props: TypographyProps) => {
  return (
    <Typography
      fontWeight="300"
      fontFamily="FractulAltLight"
      component="h1"
      variant="h1"
      color="white"
      {...(props as any)}
    >
      <strong
        style={{
          fontFamily: "FractulAltBold"
        }}
      >
        Āut
      </strong>{" "}
      Dashboard
    </Typography>
  );
};

export default AppTitle;
