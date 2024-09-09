/* eslint-disable max-len */
import { ipfsCIDToHttpUrl } from "@api/storage.api";
import CopyAddress from "@components/CopyAddress";
import {
  Avatar,
  Box,
  IconButton,
  Link,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
  useTheme
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import OverflowTooltip from "@components/OverflowTooltip";
import { IconContainer, socialIcons, socialUrls } from "@components/Socials";

const MemberCard = ({ member }) => {
  const theme = useTheme();
  const selectedNetwork = { name: member.properties.network };
  const blockExplorer = "https://etherscan.io";

  return (
    <>
      <Box
        sx={{
          alignItems: "flex-start",
          justifyContent: "flex-start",
          backdropFilter: "blur(50px)",
          backgroundColor: "rgba(128, 128, 128, 0.05)",
          border: `1px solid ${theme.palette.offWhite.dark}`,
          // backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='6' ry='6' stroke='rgb(96,96,96)' stroke-width='2' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
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
          animation: "none"
        }}
      >
        <Stack direction="column" justifyContent="center" display="flex">
          <Box
            style={{
              flex: "2",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <Box
              sx={{
                height: {
                  xs: "60px",
                  sm: "60px",
                  md: "60px",
                  xxl: "60px"
                },
                width: {
                  xs: "60px",
                  sm: "60px",
                  md: "60px",
                  xxl: "60px"
                },
                "@media (max-width: 370px)": {
                  height: "60px",
                  width: "60px"
                },
                minWidth: "60px",
                position: "relative"
              }}
            >
              <Avatar
                variant="circular"
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "transparent"
                }}
                aria-label="avatar"
              >
                <img
                  src={ipfsCIDToHttpUrl(member?.properties?.avatar as string)}
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%"
                  }}
                />
              </Avatar>
            </Box>

            <Typography
              color="offWhite.main"
              textAlign="center"
              lineHeight={1}
              variant="subtitle2"
            >
              {member?.name}
            </Typography>
          </Box>
          <Stack
            sx={{
              marginTop: 3
            }}
            direction="row"
            alignItems="center"
          >
            <CopyAddress address={member?.properties?.address} />
            {selectedNetwork?.name && (
              <Tooltip title={`Explore in ${selectedNetwork?.name}`}>
                <IconButton
                  sx={{ p: 0, ml: 1 }}
                  href={`${blockExplorer}/address/${member?.properties?.address}`}
                  target="_blank"
                  color="offWhite"
                >
                  <OpenInNewIcon sx={{ cursor: "pointer", width: "20px" }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
          <Stack sx={{ mt: 2, mb: 2 }}>
            <OverflowTooltip
              typography={{
                variant: "caption",
                fontWeight: "400",
                letterSpacing: "0.66px"
              }}
              maxLine={3}
              text={member?.description}
            />
          </Stack>
          <IconContainer>
            {member?.properties.socials.map((social, index) => {
              const AutIcon = socialIcons[Object.keys(socialIcons)[index]];

              return (
                <Link
                  key={`social-icon-${index}`}
                  {...(!!social.link && {
                    component: "a",
                    href: social.link,
                    target: "_blank",
                    sx: {
                      svg: {
                        color: (theme) => theme.palette.offWhite.main
                      }
                    }
                  })}
                  {...((!social.link ||
                    social.link === socialUrls[social.type].prefix) && {
                    sx: {
                      // display: "none",
                      svg: {
                        color: (theme) => theme.palette.divider
                      }
                    },
                    component: "button",
                    disabled: true
                  })}
                >
                  <SvgIcon
                    sx={{
                      height: {
                        xs: "25px",
                        xxl: "30px"
                      },
                      width: {
                        xs: "25px",
                        xxl: "30px"
                      },
                      mr: {
                        xs: "10px",
                        xxl: "15px"
                      }
                    }}
                    key={`socials.${index}.icon`}
                    component={AutIcon}
                  />
                </Link>
              );
            })}
          </IconContainer>
        </Stack>
      </Box>
    </>
  );
};

export default MemberCard;
