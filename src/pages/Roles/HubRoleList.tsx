/* eslint-disable max-len */
import { Box, useTheme } from "@mui/material";
import MemberCard from "./HubMemberCard";

export const placehoderMembers = [
  {
    name: "angie",
    description:
      "ĀutID are a new standard for self-sovereign Identities that do not depend from the provider,\n       therefore, they are universal. They are individual NFT IDs.",
    image: "ipfs://QmZqrsNdvLvdeURAY9zvCqX4g7VPpzQQXuNYaPRRZaTAos",
    address: "0x61dea51e8f17ce35e916d8f9b6312199ba970a2a",
    note: "This is an admin",
    properties: {
      avatar: "ipfs://QmXr8BwNLDN9Mhs9q8X3otVNcuuptTTxerozwDEfdL4ZR4",
      communities: [
        {
          name: "The Cat Cafe",
          description:
            "A place where cats make sandwiches, soups and stir-fry dishes",
          image: "ipfs://Qme3eAsQVxFrX5SfZXm1HXZcz8imQiQ6Yt9U9w71FGnK2G",
          properties: {
            market: "Social, Art & Gaming",
            commitment: 2,
            rolesSets: [
              {
                roleSetName: "First",
                roles: [
                  {
                    id: 1,
                    roleName: "Soup Savant"
                  },
                  {
                    id: 2,
                    roleName: "Sandwich Artist"
                  },
                  {
                    id: 3,
                    roleName: "Stir-Fry Wizard"
                  }
                ]
              }
            ],
            address: "0x61dea51e8f17ce35e916d8f9b6312199ba970a2a",
            prestige: 100,
            members: 1,
            socials: [
              {
                type: "discord",
                link: "",
                metadata: {}
              },
              {
                type: "ens",
                link: "",
                metadata: {}
              },
              {
                type: "twitter",
                link: "",
                metadata: {}
              },
              {
                type: "github",
                link: "",
                metadata: {}
              }
            ],
            userData: {
              role: "1",
              commitment: "3",
              isActive: true,
              roleName: "Soup Savant",
              commitmentDescription: "gm gm ☕"
            },
            domain: ""
          }
        }
      ],
      timestamp: "15:26:45 | 12/08/24",
      address: "0x499BC506Ea903730D49481aA0e1d473239ECE1Ab",
      tokenId: "1",
      socials: [
        {
          type: "discord",
          link: "",
          metadata: {}
        },
        {
          type: "ens",
          link: "",
          metadata: {}
        },
        {
          type: "twitter",
          link: "",
          metadata: {}
        },
        {
          type: "github",
          link: "",
          metadata: {}
        }
      ],
      network: "Amoy"
    }
  }
];

export const HubRoleList = ({ members }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        marginTop: theme.spacing(3),
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
          md: "1fr 1fr",
          xl: "1fr 1fr 1fr",
          xxl: "1fr 1fr 1fr"
        },
        ml: {
          xs: theme.spacing(3),
          md: 0
        },
        mr: {
          xs: theme.spacing(3),
          md: theme.spacing(2)
        },
        gap: {
          xs: theme.spacing(2),
          md: theme.spacing(3),
          xl: theme.spacing(4),
          xxl: theme.spacing(4)
        }
      }}
    >
      {placehoderMembers?.map((member, index) => (
        <MemberCard key={`role-item-${member?.name}`} member={member} />
      ))}
    </Box>
  );
};
