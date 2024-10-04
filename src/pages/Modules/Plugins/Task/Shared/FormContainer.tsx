import { Container, styled } from "@mui/material";

const ContainerWithForm = styled<any>(Container)``;

export const FormContainer = ({ children, ...props }) => {
  console.log("FormContainer", props);
  return (
    <ContainerWithForm
      sx={{ py: "20px", display: "flex", flexDirection: "column" }}
      maxWidth="lg"
      component="form"
      autoComplete="off"
      {...props}
    >
      {children}
    </ContainerWithForm>
  );
};

export const FormContainerHubOs = ({ children, ...props }) => {
  return (
    <ContainerWithForm
      sx={{
        py: "20px",
        display: "flex",
        flexDirection: "column",
        // border: "1px solid",
        // borderColor: "#576176",
        backgroundColor: "transparent"
      }}
      maxWidth="lg"
      component="form"
      autoComplete="off"
      {...props}
    >
      {children}
    </ContainerWithForm>
  );
};
