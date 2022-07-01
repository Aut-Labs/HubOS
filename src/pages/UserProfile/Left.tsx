import {
  Box,
  CardHeader,
  Avatar,
  CardContent,
  Typography,
  SvgIcon,
  Card,
  styled,
} from "@mui/material";
import { pxToRem } from "@utils/text-size";
import { ReactComponent as DiscordIcon } from "@assets/SocialIcons/DiscordIcon.svg";
import { ReactComponent as GitHubIcon } from "@assets/SocialIcons/GitHubIcon.svg";
import { ReactComponent as LeafIcon } from "@assets/SocialIcons/LeafIcon.svg";
import { ReactComponent as TelegramIcon } from "@assets/SocialIcons/TelegramIcon.svg";
import { ReactComponent as TwitterIcon } from "@assets/SocialIcons/TwitterIcon.svg";
import { AutID } from "@api/aut.model";
import { AutButton } from "@components/buttons";

const IconContainer = styled("div")(({ theme }) => ({
  paddingTop: pxToRem(40),
  display: "flex",

  "@media(max-width: 769px)": {
    paddingTop: pxToRem(20),
  },
}));

const Stat = styled("div")({
  width: "100%",
  height: pxToRem(80),
  borderStyle: "solid",
  borderWidth: "1px",
  borderTopColor: "white",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: `0 ${pxToRem(40)}`,
  margin: "0 auto",
  "&.stat:last-child": {
    borderBottomColor: "white",
  },
});

const StatWrapper = styled("div")({
  maxWidth: pxToRem(670),
  minWidth: pxToRem(670),
  margin: "0 auto",
});

const userStats = [
  {
    title: "Your Interactions",
    value: "0",
  },
  {
    title: "Your Open Tasks",
    value: "0",
  },
  {
    title: "Total Completed Tasks",
    value: "0",
  },
];

const AutCard = styled(Card)(({ theme }) => ({
  "&.MuiCard-root": {
    display: "flex",
  },

  ".MuiCardHeader-root": {
    padding: "0",
  },

  ".MuiCardContent-root:last-child": {
    padding: "0",
  },
}));

const LeftProfile = ({ member }: { member: AutID }) => {


  const whitelistMember = () => {

  };
  return (
    <Box style={{ display: "flex", flexDirection: "column", flex: "1" }}>
      <Box
        sx={{
          paddingLeft: pxToRem(100),
          paddingRight: pxToRem(100),
          paddingTop: pxToRem(150),
        }}
      >
        <AutCard sx={{ bgcolor: "background.default", border: "none" }}>
          <CardHeader
            avatar={
              <Avatar
                src={member?.image as string}
                sx={{
                  bgcolor: "background.default",
                  width: pxToRem(150),
                  height: pxToRem(150),
                  borderRadius: 0,
                }}
              />
            }
          />
          <CardContent
            sx={{
              ml: pxToRem(30),
              mr: pxToRem(30),
              alignSelf: "flex-end",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <Typography
                fontSize={pxToRem(50)}
                color="background.paper"
                textAlign="left"
              >
                {member?.name}
              </Typography>
            </div>

            <Typography
              variant="h2"
              color="background.paper"
              textAlign="left"
              sx={{ textDecoration: "underline", wordBreak: "break-all" }}
            >
              {member?.properties?.address}
            </Typography>
            <IconContainer>
              <SvgIcon
                sx={{
                  height: pxToRem(34),
                  width: pxToRem(31),
                  mr: pxToRem(20),
                }}
                component={DiscordIcon}
              />
              <SvgIcon
                sx={{
                  height: pxToRem(34),
                  width: pxToRem(31),
                  mr: pxToRem(20),
                }}
                component={GitHubIcon}
              />
              <SvgIcon
                sx={{
                  height: pxToRem(34),
                  width: pxToRem(31),
                  mr: pxToRem(20),
                }}
                component={TwitterIcon}
              />
              <SvgIcon
                sx={{
                  height: pxToRem(34),
                  width: pxToRem(31),
                  mr: pxToRem(20),
                }}
                component={TelegramIcon}
              />
              <SvgIcon
                sx={{
                  height: pxToRem(34),
                  width: pxToRem(31),
                  mr: pxToRem(20),
                }}
                component={LeafIcon}
              />
            </IconContainer>
          </CardContent>
        </AutCard>
      </Box>
      <Box
        sx={{
          paddingLeft: pxToRem(100),
          paddingRight: pxToRem(100),
          paddingTop: pxToRem(30),
          paddingBottom: pxToRem(30),
        }}
      >
        <Typography
          fontSize={pxToRem(47)}
          textTransform="uppercase"
          color="background.paper"
          textAlign="left"
        >
          Stats
        </Typography>
      </Box>
      <Box
        sx={{
          paddingLeft: pxToRem(100),
          paddingRight: pxToRem(100),
        }}
      >
        <StatWrapper>
          {userStats.map(({ title, value }) => (
            <Stat className="stat" key={`stat-${title}`}>
              <Typography
                sx={{ color: "white", fontSize: pxToRem(21) }}
                component="div"
              >
                {title}
              </Typography>
              <Typography
                sx={{ color: "white", fontSize: pxToRem(21) }}
                component="div"
              >
                {value}
              </Typography>
            </Stat>
          ))}
        </StatWrapper>
      </Box>
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
      }}>
        <AutButton
          sx={{
            minWidth: pxToRem(325),
            maxWidth: pxToRem(325),
            height: pxToRem(70),
            mt: pxToRem(100),
          }}
          disabled={member?.properties?.isWhitelisted}
          type="button"
          onClick={whitelistMember}
          color="primary"
          variant="outlined"
        >
          Set as Admin
        </AutButton>
      </Box>
    </Box>
  );
};

export default LeftProfile;
