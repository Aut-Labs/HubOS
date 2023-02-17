import { pluginRegistryApi } from "@api/plugin-registry.api";
import {
  Box,
  CircularProgress,
  Container,
  FormControlLabel,
  Switch,
  Typography,
  styled
} from "@mui/material";
import { memo, useMemo, useState } from "react";
import PluginCard, { EmptyPluginCard } from "./PluginCard";
import LoadingProgressBar from "@components/LoadingProgressBar";
import { BaseNFTModel } from "@aut-labs-private/sdk/dist/models/baseNFTModel";
import { PluginDefinitionProperties } from "@aut-labs-private/sdk/dist/models/plugin";

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

interface StackParams {
  definition: BaseNFTModel<PluginDefinitionProperties>;
}

const Plugins = ({ definition }: StackParams) => {
  const [hideInstalled, setToggleInstalled] = useState(false);

  const { plugins, isLoading, isFetching } =
    pluginRegistryApi.useGetAllPluginDefinitionsByDAOQuery(null, {
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        isLoading,
        isFetching,
        plugins: (data || []).filter(
          (p) =>
            p.metadata?.properties?.stack?.type ===
            definition?.properties?.stack?.type
        )
      })
    });

  const filteredPlugins = useMemo(() => {
    if (!hideInstalled) return plugins;
    return plugins.filter((p) => !p.pluginAddress);
  }, [hideInstalled, plugins]);

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
            {definition.properties.stack.title}
          </Typography>
          {!!plugins?.length && (
            <Box
              sx={{
                display: "flex",
                mt: 4,
                alignItems: "center",
                justifyContent: "flex-end"
              }}
            >
              <FormControlLabel
                sx={{
                  color: "white"
                }}
                onChange={(_, checked) => setToggleInstalled(checked)}
                control={<Switch checked={hideInstalled} color="primary" />}
                label="Hide installed"
              />
            </Box>
          )}
        </Box>

        {isLoading ? (
          <CircularProgress className="spinner-center" size="60px" />
        ) : (
          <>
            <GridBox sx={{ flexGrow: 1, mt: 4 }}>
              {filteredPlugins.map((plugin, index) => (
                <PluginCard
                  isFetching={isFetching}
                  key={`my-stack-plugin-${index}`}
                  plugin={plugin}
                />
              ))}
              <EmptyPluginCard />
            </GridBox>
          </>
        )}
      </Container>
    </>
  );
};

export default memo(Plugins);
