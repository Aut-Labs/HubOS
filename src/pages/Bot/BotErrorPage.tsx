import React from "react";
import { Button, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

type BotErrorPageProps = {
  refetch: () => void;
  errorMessage: string;
};

const BotErrorPage = ({ refetch, errorMessage }) => {
  const handleRefetch = () => {
    refetch();
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        marginTop: "44px"
      }}
    >
      <Typography
        mx="auto"
        my={2}
        textAlign="center"
        color="white"
        variant="body1"
      >
        {errorMessage}
      </Typography>
      <Button
        size="medium"
        color="offWhite"
        startIcon={<RefreshIcon />}
        sx={{
          mt: 14
        }}
        onClick={() => handleRefetch()}
      >
        Refresh
      </Button>
    </div>
  );
};

export default BotErrorPage;
