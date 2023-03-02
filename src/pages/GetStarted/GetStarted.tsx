import { Box, Button, Container, styled, Typography } from "@mui/material";
import { ReactComponent as Trifold } from "@assets/trifold.svg";
import AppTitle from "@components/AppTitle";
import { DautPlaceholder } from "@api/ProviderFactory/web3-daut-connect";
import { useOAuth } from "@components/Oauth2/oauth2";

const Grid = styled("div")(({ theme }) => {
  return {
    display: "flex",
    alignItems: "space-between",
    gridTemplateColumns: "1fr 1fr",
    flex: 1,
    flexDirection: "column",
    gridGap: "100px",
    height: "100%",
    [theme.breakpoints.up("md")]: {
      flexDirection: "row"
    }
  };
});

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

const StyledTrifold = styled(Trifold)(({ theme }) => {
  return {
    maxWidth: "500px",
    [theme.breakpoints.up("xxl")]: {
      maxWidth: "700px"
    }
  };
});

const ImageWrapper = styled("div")(({ theme }) => {
  return {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    width: "50%",
    [theme.breakpoints.down("md")]: {
      display: "none",
      width: "unset"
    }
  };
});

const GetStarted = () => {
  const { getAuth, authenticating } = useOAuth();

  const authenticateTwitter = () => {
    getAuth(
      (data) => {
        console.log(data);
        // if (data.screen_name === getValues("daoTwitter")) {
        //   dispatch(
        //     integrateUpdateCommunity({
        //       handleVerified: true
        //     })
        //   );
        // } else {
        //   setError("daoTwitter", {
        //     type: "validationFailed",
        //     message: `Twitter handle doesn't match the one used to validate.`
        //   });
        // }
      },
      (e) => {
        console.log(e);
      }
    );
  };

  return (
    <Container maxWidth="lg" sx={{ flexGrow: 1, height: "100%" }}>
      <Grid>
        <Content>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row"
            }}
            mb={{
              xs: "25px",
              md: "50px"
            }}
          >
            <AppTitle />
          </Box>
          <Typography
            mb={{
              xs: "10px",
              md: "20px"
            }}
            color="white"
            variant="subtitle2"
            fontWeight="bold"
          >
            Do more with your DAO.
          </Typography>
          <Typography
            mb={{
              xs: "10px",
              md: "20px"
            }}
            color="white"
            variant="subtitle2"
            fontWeight="normal"
          >
            Use your Dashboard to Manage your Nova. Experiment with
            Integrations, and add custom Modules - such as Role-sets &
            on-boarding strategies.
          </Typography>
          <Typography
            mb={{
              xs: "10px",
              md: "20px"
            }}
            color="white"
            variant="subtitle2"
            fontWeight="normal"
          >
            Coordinate, Coordinate, Coordinate.
          </Typography>
          <Typography
            mb={{
              xs: "25px",
              md: "50px"
            }}
            color="white"
            variant="subtitle2"
            fontWeight="normal"
          >
            There is no community like yours - Set your own Standard. Opt Āut.
          </Typography>
          <DautPlaceholder />
          <Button
            onClick={() => authenticateTwitter()}
            sx={{
              width: "140px",
              height: "48px"
            }}
            type="button"
            size="square"
            color="offWhite"
            variant="outlined"
          >
            Verify
            {/* {handleVerified ? (
              "VERIFIED"
            ) : authenticating ? (
              <CircularProgress />
            ) : (
              "Verify"
            )} */}
          </Button>
        </Content>
        <ImageWrapper>
          <StyledTrifold></StyledTrifold>
        </ImageWrapper>
      </Grid>
    </Container>
  );
};

export default GetStarted;
