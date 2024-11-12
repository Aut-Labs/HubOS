import { Box, Container, Typography, useTheme } from "@mui/material";
import { useMemo, useState } from "react";
import AutLoading from "@components/AutLoading";
import useQueryContributions from "@hooks/useQueryContributions";
import { ContributionsTable } from "./ContributionsTable";

export const AllTasks = () => {
  const theme = useTheme();

  const {
    data,
    loading: isLoading,
    refetch
  } = useQueryContributions({
    variables: {
      skip: 0,
      take: 1000
    }
  });

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
              <ContributionsTable contributions={data} />
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
