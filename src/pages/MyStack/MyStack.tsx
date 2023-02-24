import { useGetAllPluginDefinitionsByDAOQuery } from "@api/plugin-registry.api";
import {
  Box,
  CircularProgress,
  Container,
  IconButton,
  Tooltip,
  Typography,
  styled
} from "@mui/material";
import { memo, useMemo } from "react";
import { PluginDefinitionCard } from "./Shared/PluginCard";
import LoadingProgressBar from "@components/LoadingProgressBar";
import RefreshIcon from "@mui/icons-material/Refresh";

const GridBox = styled(Box)(({ theme }) => {
  return {
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "1fr",
    gridGap: "30px",
    [theme.breakpoints.up("sm")]: {
      gridTemplateColumns: "repeat(2,minmax(0,1fr))"
    },
    [theme.breakpoints.up("lg")]: {
      gridTemplateColumns: "repeat(3,minmax(0,1fr))"
    }
  };
});

const MyStack = () => {
  const { plugins, isLoading, isFetching, refetch } =
    useGetAllPluginDefinitionsByDAOQuery(null, {
      // @ts-ignore
      selectFromResult: ({ data, isLoading, isFetching, refetch }) => ({
        refetch,
        isLoading,
        isFetching,
        plugins: data || []
      })
    });

  const myStacks = useMemo(() => {
    return plugins.reduce(
      (prev, curr) => {
        const stackType = curr?.metadata?.properties?.stack?.type;
        if (stackType && !prev[stackType]) {
          prev[stackType] = true;
          prev.types.push(curr);
        }
        return prev;
      },
      {
        types: []
      }
    ).types;
  }, [plugins]);

  return (
    <>
      <LoadingProgressBar isLoading={isFetching} />
      <Container maxWidth="lg" sx={{ py: "20px" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            position: "relative"
          }}
        >
          <Typography textAlign="center" color="white" variant="h3">
            Modules
            <Tooltip title="Refresh modules">
              <IconButton
                size="medium"
                color="offWhite"
                sx={{
                  ml: 1
                }}
                disabled={isLoading || isFetching}
                onClick={refetch}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Typography>
        </Box>

        {!isLoading && !myStacks?.length && (
          <Box
            sx={{
              display: "flex",
              gap: "20px",
              mt: 12,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Typography color="rgb(107, 114, 128)" variant="subtitle2">
              No modules were found...
            </Typography>
          </Box>
        )}

        {isLoading ? (
          <CircularProgress className="spinner-center" size="60px" />
        ) : (
          <>
            <GridBox sx={{ flexGrow: 1, mt: 4 }}>
              {myStacks.map((plugin, index) => (
                <PluginDefinitionCard
                  key={`my-stack-plugin-${index}`}
                  plugin={plugin}
                />
              ))}
            </GridBox>
          </>
        )}
      </Container>
    </>
  );
};

export default memo(MyStack);
