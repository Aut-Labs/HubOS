import { LoadingButton } from "@mui/lab";
import {
  CardHeader,
  Avatar,
  CardContent,
  Typography,
  Box,
  Stack,
  CircularProgress,
  useTheme,
  alpha
} from "@mui/material";
import ENSImage from "@assets/ethereum-name-service-ens-logo.png";
import { GridCard } from "./Grid";
import { useVerifyENSMutation } from "@api/socials.api";
import { useAccount } from "wagmi";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import { useSelector } from "react-redux";
import { IsSocialVerified } from "@store/Hub/hub.reducer";

const ENSCard = () => {
  const { address } = useAccount();
  const [verify, { error, isError, isLoading, reset }] = useVerifyENSMutation();
  const isEnsVerified = useSelector(IsSocialVerified("ens"));
  const theme = useTheme();

  return (
    <>
      <ErrorDialog handleClose={() => reset()} open={isError} message={error} />
      <GridCard
        sx={{
          bgcolor: "nightBlack.main",
          borderColor: "divider",
          borderRadius: "16px",
          minHeight: "100px",
          boxShadow: 3,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          ...(!isEnsVerified
            ? {
                bgcolor: "nightBlack.main"
              }
            : {
                bgcolor: alpha(theme.palette.primary.main, 0.3)
              })
        }}
        variant="outlined"
      >
        <CardHeader
          avatar={
            <Avatar src={ENSImage} aria-label="icon">
              R
            </Avatar>
          }
          sx={{
            ".MuiCardHeader-action": {
              mt: "3px"
            }
          }}
          titleTypographyProps={{
            fontFamily: "FractulAltBold",
            mb: 1,
            fontWeight: 900,
            textAlign: "left",
            color: "white",
            variant: "subtitle2"
          }}
          title="ENS"
        />
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Typography
            textAlign="left"
            className="text-secondary"
            variant="body"
          >
            Connect to verify your ENS
          </Typography>
          <Box
            sx={{
              width: "100%",
              display: "flex"
            }}
          >
            <LoadingButton
              loading={isLoading}
              sx={{
                width: "80%",
                mt: 3,
                mx: "auto"
              }}
              type="button"
              size="medium"
              variant="outlined"
              loadingIndicator={
                <Stack direction="row" gap={1} alignItems="center">
                  <Typography className="text-secondary">
                    Installing...
                  </Typography>
                  <CircularProgress
                    size="20px"
                    // @ts-ignore
                    color="offWhite"
                  />
                </Stack>
              }
              onClick={() => verify(address)}
              color="offWhite"
            >
              Connect
            </LoadingButton>
          </Box>
        </CardContent>
      </GridCard>
    </>
  );
};

export default ENSCard;
