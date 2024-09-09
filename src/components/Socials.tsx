import { ReactComponent as DiscordIcon } from "@assets/SocialIcons/DiscordIcon.svg";
import { ReactComponent as GitHubIcon } from "@assets/SocialIcons/GitHubIcon.svg";
import { ReactComponent as LensfrensIcon } from "@assets/SocialIcons/LensfrensIcon.svg";
import { ReactComponent as TelegramIcon } from "@assets/SocialIcons/TelegramIcon.svg";
import { ReactComponent as TwitterIcon } from "@assets/SocialIcons/TwitterIcon.svg";
import { styled } from "@mui/material";

export const socialIcons = {
  discord: DiscordIcon,
  github: GitHubIcon,
  twitter: TwitterIcon,
  telegram: TelegramIcon,
  lensfrens: LensfrensIcon
};

export const socialUrls = {
  discord: {
    hidePrefix: true,
    placeholder: "name#1234",
    prefix: "https://discord.com/users/"
  },
  github: {
    prefix: "https://github.com/",
    placeholder: ""
  },
  twitter: {
    prefix: "https://twitter.com/",
    placeholder: ""
  },
  telegram: {
    prefix: "https://t.me/",
    placeholder: ""
  },
  lensfrens: {
    prefix: "https://www.lensfrens.xyz/",
    placeholder: ""
  }
};

export const IconContainer = styled("div")(({ theme }) => ({
  display: "flex",
  minHeight: "25px",
  height: "40px",

  [theme.breakpoints.down("md")]: {
    height: "35px",
    minHeight: "20px"
  }
}));
