import { Box, Container, Stack, Typography, useTheme } from "@mui/material";
import { useMemo, useState } from "react";
// import Tasks from "../../Task/Shared/Tasks";
import { useAccount } from "wagmi";
import AutLoading from "@components/AutLoading";
import useQueryContributions from "@hooks/useQueryContributions";
import Tasks from "./Tasks";
import { TaskContributionNFT } from "@aut-labs/sdk";
import OverflowTooltip from "@components/OverflowTooltip";
import { ContributionsTable } from "./ContributionsTable";
import { TaskStatus } from "@store/model";
import { RetweetContributionProperties } from "@api/contribution-types/retweet.model";

// const ContributionCard = ({
//   contribution
// }: {
//   contribution: TaskContributionNFT;
// }) => {
//   const theme = useTheme();

//   return (
//     <>
//       <Box
//         sx={{
//           alignItems: "flex-start",
//           justifyContent: "flex-start",
//           backdropFilter: "blur(50px)",
//           backgroundColor: "rgba(128, 128, 128, 0.05)",
//           border: `1px solid ${theme.palette.offWhite.dark}`,
//           borderRadius: "6px",
//           opacity: 1,
//           WebkitBackdropFilter: "blur(6px)",
//           padding: {
//             xs: "24px 24px",
//             md: "20px 20px",
//             xxl: "36px 32px"
//           },
//           display: "flex",
//           flexDirection: "column",
//           animation: "none"
//         }}
//       >
//         <Stack direction="column" justifyContent="center" display="flex">
//           <Box
//             style={{
//               flex: "2",
//               display: "flex",
//               alignItems: "center",
//               gap: "12px"
//             }}
//           >
//             <Box
//               sx={{
//                 height: {
//                   xs: "60px",
//                   sm: "60px",
//                   md: "60px",
//                   xxl: "60px"
//                 },
//                 width: {
//                   xs: "60px",
//                   sm: "60px",
//                   md: "60px",
//                   xxl: "60px"
//                 },
//                 "@media (max-width: 370px)": {
//                   height: "60px",
//                   width: "60px"
//                 },
//                 minWidth: "60px",
//                 position: "relative"
//               }}
//             >
//               {/* <Avatar
//                 variant="circular"
//                 sx={{
//                   width: "100%",
//                   height: "100%",
//                   borderRadius: "50%",
//                   background: "transparent"
//                 }}
//                 aria-label="avatar"
//               >
//                 <img
//                   src={ipfsCIDToHttpUrl(member?.properties?.avatar as string)}
//                   style={{
//                     objectFit: "contain",
//                     width: "100%",
//                     height: "100%"
//                   }}
//                 />
//               </Avatar> */}
//             </Box>

//             <Typography
//               color="offWhite.main"
//               textAlign="center"
//               lineHeight={1}
//               variant="subtitle2"
//             >
//               {contribution?.name}
//             </Typography>
//           </Box>
//         </Stack>
//         <Stack sx={{ mt: 2, mb: 2 }}>
//           <OverflowTooltip
//             typography={{
//               variant: "caption",
//               fontWeight: "400",
//               letterSpacing: "0.66px"
//             }}
//             maxLine={3}
//             text={contribution?.description}
//           />
//         </Stack>
//       </Box>
//     </>
//   );
// };

export const AllTasks = ({ data: taskTypes }) => {
  const theme = useTheme();
  const isAdmin = true;
  const { address } = useAccount();
  // const { data, isLoading } = useGetAllTasksQuery(
  //   {
  //     userAddress: address,
  //     isAdmin
  //   },
  //   {
  //     refetchOnMountOrArgChange: true
  //   }
  // );

  const {
    data,
    loading: isLoading,
    refetch
  } = useQueryContributions({
    variables: {
      skip: 0,
      take: 1000,
    }
  });

  //TODO: Check the type more efficiently
  const updatedContributions = data?.map((item) => ({
    ...item,
    contributionType: (item.properties as RetweetContributionProperties)
      .tweetUrl
      ? "Retweet"
      : "open",
    status: TaskStatus.Created
  }));
  // const isLoading = false;
  // const data = {
  //   tasks: []
  // };
  const [searchState, setSearchState] = useState({
    title: ""
  });

  const filteredTasks = useMemo(() => {
    return (data || [])?.filter((q) =>
      (q?.name || "")
        ?.toLowerCase()
        ?.includes(searchState?.title?.toLowerCase())
    );
  }, [data, searchState]);

  return (
    <Container
      sx={{
        py: "20px",
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}
      maxWidth="md"
    >
      {isLoading ? (
        <AutLoading width="130px" height="130px" />
      ) : (
        <>
          <Container maxWidth="md">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                position: "relative"
              }}
            >
              <Typography textAlign="center" color="white" variant="h3">
                Contributions
              </Typography>
            </Box>
            <Box
              sx={{
                mt: theme.spacing(4)
              }}
            >
              <ContributionsTable contributions={updatedContributions} />
            </Box>
          </Container>
          {/* <Box
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
            {data?.map((contribution, index) => (
              <ContributionCard
                key={`role-item-${contribution?.name}`}
                contribution={contribution}
              />
            ))}
          </Box>

          {!isLoading && !data?.length && (
            <Box
              sx={{
                display: "flex",
                gap: "20px",
                pt: 12,
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Typography className="text-secondary" variant="subtitle2">
                No contributions found...
              </Typography>
            </Box>
          )} */}
        </>
      )}
    </Container>
  );
};
