import { Box, Container, styled, Typography } from "@mui/material";
import { DautPlaceholder } from "@api/ProviderFactory/web3-daut-connect";
import backgroundImage from "@assets/hubos/bg-aut-blue-web.png";
import HubOsLogo from "@assets/hubos/hubos-logo.svg?react";

const Content = styled("div")(({ theme }) => {
  return {
    flex: 1,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  };
});

const AutContainer = styled("div")(() => ({
  display: "flex",
  height: "100%",
  backgroundImage: `url(${backgroundImage})`,
  backgroundBlendMode: "hard-light",
  backgroundSize: "cover",
  backgroundRepeat: "repeat-y"
}));

const GetStarted = () => {
  console.log("GetStarted");
  return (
    <AutContainer>
      {/* <BottomLeftBubble loading="lazy" src={BubbleBottomLeft} />
      <TopRightBubble loading="lazy" src={BubbleTopRight} /> */}

      <Content>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column"
          }}
          mb={{
            xs: "25px",
            md: "50px"
          }}
        >
          <HubOsLogo height="110px" width="300px"></HubOsLogo>
          <Typography
            mb={{
              xs: "10px",
              md: "20px"
            }}
            mt="-15px"
            color="white"
            variant="subtitle2"
            fontWeight="normal"
            textAlign="center"
            letterSpacing="1.33px"
          >
            There is no hub like yours - create your own Standard. <br />
            Do more with your Hub.
          </Typography>

          <Box sx={{ marginTop: "20px" }}>
            <DautPlaceholder />
          </Box>
        </Box>

        {/* <Typography
            mb={{
              xs: "10px",
              md: "20px"
            }}
            color="white"
            variant="subtitle2"
            fontWeight="normal"
          >
            Use your Dashboard to Manage your Hub. Experiment with
            Integrations, and add custom Modules - such as Role-sets &
            on-boarding strategies.
          </Typography> */}
        {/* <Typography
            mb={{
              xs: "10px",
              md: "20px"
            }}
            color="white"
            variant="subtitle2"
            fontWeight="normal"
          >
            Coordinate, Coordinate, Coordinate.
          </Typography> */}
        {/* <Typography
            mb={{
              xs: "25px",
              md: "50px"
            }}
            color="white"
            variant="subtitle2"
            fontWeight="normal"
          >
            There is no hub like yours - create your own Standard.
          </Typography> */}
      </Content>
      {/* <ImageWrapper>
          <StyledTrifold loading="lazy" src={TryFoldImage}></StyledTrifold>
        </ImageWrapper> */}
    </AutContainer>
  );
};

export default GetStarted;
