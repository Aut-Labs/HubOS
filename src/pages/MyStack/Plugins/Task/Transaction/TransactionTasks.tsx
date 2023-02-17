import { PluginDefinition } from "@aut-labs-private/sdk";
import { Container, Box, Typography } from "@mui/material";

interface PluginParams {
  plugin: PluginDefinition;
}

const TransactionTasks = ({ plugin }: PluginParams) => {
  return (
    <Container maxWidth="lg" sx={{ py: "20px" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          position: "relative"
        }}
      >
        <Typography textAlign="center" color="white" variant="h3">
          Transaction tasks
        </Typography>
      </Box>
    </Container>
  );
};

export default TransactionTasks;
