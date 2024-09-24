import { Grid, styled } from "@mui/material";
import ENSImage from "@assets/ethereum-name-service-ens-logo.png";
import TwitterImage from "@assets/icons8-twitter-48.png";
import GithubImage from "@assets/github-mark-white.png";
import ENSCard from "./ENS";
import { GridBox } from "./Grid";

export const VerificationSocials = [
  {
    title: <>ENS</>,
    icon: ENSImage,
    type: "ENS",
    description: "Connect to verify your ENS"
  },
  {
    title: <>Twitter</>,
    icon: TwitterImage,
    type: "TWITTER",
    description: "Connect to verify your Twitter(X)"
  },
  {
    title: <>Github</>,
    icon: GithubImage,
    type: "GITHUB",
    description: "Connect to verify your Github"
  }
];

const StepWrapper = styled("form")({
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column"
});

const HubSocials = () => {
  return (
    <StepWrapper>
      <GridBox sx={{ flexGrow: 1 }}>
        <Grid item>
          <ENSCard />
        </Grid>
      </GridBox>
    </StepWrapper>
  );
};

export default HubSocials;
