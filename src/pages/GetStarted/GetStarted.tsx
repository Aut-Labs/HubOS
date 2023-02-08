import { Box, Button, styled, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@store/store.model";
import { ReactComponent as AutLogo } from "@assets/aut/logo.svg";
import { pxToRem } from "@utils/text-size";
import { Link } from "react-router-dom";
import { AutButton } from "@components/buttons";
import { IsAuthenticated } from "@auth/auth.reducer";
import { useGetPostsByNameQuery } from "@api/posts.api";
import AutSDK from "@aut-labs-private/sdk";
import { ReactComponent as Trifold } from "@assets/trifold.svg";
import { DautPlaceholder } from "@components/DautPlaceholder";

const Wrapper = styled("div")(({ theme, color }) => {
  return {
    height: "100%",
    display: "flex",
    justifyContent: "center"
  };
});

const Container = styled("div")(({ theme, color }) => {
  return {
    width: "100%",
    height: "100%",
    display: "flex",

    [theme.breakpoints.up("sm")]: {
      maxWidth: "750px",
      width: "100%"
    },

    [theme.breakpoints.up("md")]: {
      maxWidth: "970px",
      width: "100%"
    },
    [theme.breakpoints.up("lg")]: {
      maxWidth: "1060px",
      width: "100%"
    },
    [theme.breakpoints.up("xl")]: {
      maxWidth: "1146px",
      width: "100%"
    },

    [theme.breakpoints.up("xxl")]: {
      maxWidth: "1460px",
      width: "100%"
    }
  };
});

const Grid = styled("div")(({ theme, color }) => {
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

const Content = styled("div")(({ theme, color }) => {
  return {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    [theme.breakpoints.up("md")]: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }
  };
});

const StyledTrifold = styled(Trifold)(({ theme, color }) => {
  return {
    width: "500px",
    [theme.breakpoints.up("xxl")]: {
      width: "700px"
    }
  };
});

const ImageWrapper = styled("div")(({ theme, color }) => {
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
  const isAuthenticated = useSelector(IsAuthenticated);
  // const { data, error, isLoading, isFetching, refetch } =
  //   useGetPostsByNameQuery(AutSDK.getInstance(), {
  //     pollingInterval: 2000,
  //     refetchOnMountOrArgChange: true,
  //     skip: false
  //   });

  // console.log("data: ", data);
  // console.log("error: ", error);
  // console.log("isLoading: ", isLoading);
  // console.log("isFetching: ", isFetching);
  return (
    <Wrapper>
      <Container>
        <Grid>
          <Content>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row"
              }}
              mb={{
                xs: "0",
                md: "50px"
              }}
            >
              <Typography m="0" color="white" variant="h1" fontWeight="bold">
                Aut
              </Typography>
              <Typography variant="h1">&nbsp;</Typography>
              <Typography
                m="0"
                color="white"
                variant="h1"
                fontWeight="normal"
                fontFamily="FractulAltLight"
              >
                <span>Dashboard</span>
              </Typography>
            </Box>
            <Typography
              mb={{
                xs: "0",
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
                xs: "0",
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
                xs: "0",
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
                xs: "0",
                md: "50px"
              }}
              color="white"
              variant="subtitle2"
              fontWeight="normal"
            >
              There is no community like yours - Set your own Standard. Opt Āut.
            </Typography>
            <DautPlaceholder styles={{ position: "relative" }} hide={false} />
          </Content>
          <ImageWrapper>
            <StyledTrifold></StyledTrifold>
          </ImageWrapper>
        </Grid>
      </Container>
    </Wrapper>
  );
};

export default GetStarted;
