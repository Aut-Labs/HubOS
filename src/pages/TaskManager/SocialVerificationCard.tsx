import { environment } from "@api/environment";
import { AutOsButton } from "@components/buttons";
import { Box, Stack, Typography } from "@mui/material";
import { HubData } from "@store/Hub/hub.reducer";
import { useSelector } from "react-redux";

export const SocialVerificationCard = ({ socialType }) => {
    const hubData = useSelector(HubData);
    return (
      <Box
        sx={{
          alignItems: "flex-start",
          justifyContent: "flex-start",
          backdropFilter: "blur(50px)",
          backgroundColor: "rgba(128, 128, 128, 0.05)",
          border: "1px solid",
          borderColor: "offWhite.dark",
          borderRadius: "6px",
          opacity: 1,
          WebkitBackdropFilter: "blur(6px)",
          padding: {
            xs: "24px 24px",
            md: "20px 20px",
            xxl: "36px 32px"
          },
          display: "flex",
          flexDirection: "column",
          height: "100%"
        }}
      >
        <Stack
          direction="column"
          justifyContent="center"
          display="flex"
          spacing={2}
        >
          <Box
            sx={{
              flex: "2",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <Typography
              color="offWhite.main"
              textAlign="center"
              lineHeight={1}
              variant="subtitle2"
            >
              {`${socialType.charAt(0).toUpperCase() + socialType.slice(1)} Verifictaion Required`}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: "400",
              letterSpacing: "0.66px",
              color: "grey.400"
            }}
          >
            {`Please verify your ${socialType} account in the hub to access ${socialType} tasks`}
          </Typography>
          <AutOsButton
            onClick={() => {
              window.open(`${environment.hubShowcaseUrl}/project/${hubData.name}`, '_blank');
            }}
            variant="outlined"
            sx={{ mt: "auto" }}
          >
            <Typography fontWeight="bold" fontSize="16px" lineHeight="26px">
              Verify {socialType.charAt(0).toUpperCase() + socialType.slice(1)}
            </Typography>
          </AutOsButton>
        </Stack>
      </Box>
    );
  };