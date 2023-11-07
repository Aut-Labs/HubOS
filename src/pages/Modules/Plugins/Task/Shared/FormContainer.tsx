import { Container, styled } from "@mui/material";

const ContainerWithForm = styled<any>(Container)``;

export const FormContainer = ({ children, ...props }) => {
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
