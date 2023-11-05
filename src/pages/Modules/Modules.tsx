import { useGetAllPluginDefinitionsByDAOQuery } from "@api/plugin-registry.api";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Tooltip,
  Typography,
  styled
} from "@mui/material";
import { memo, useEffect, useMemo } from "react";
import { ModuleDefinitionCard } from "./Shared/PluginCard";
import LoadingProgressBar from "@components/LoadingProgressBar";
import RefreshIcon from "@mui/icons-material/Refresh";
import { setTitle } from "@store/ui-reducer";
import { useAppDispatch } from "@store/store.model";
import AutLoading from "@components/AutLoading";
import { useGetAllModuleDefinitionsQuery } from "@api/module-registry.api";

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

const Modules = () => {
  const dispatch = useAppDispatch();
  const { modules, isLoading, isFetching, refetch } =
    useGetAllModuleDefinitionsQuery(null, {
      // @ts-ignore
      selectFromResult: ({ data, isLoading, isFetching, refetch }) => ({
        refetch,
        isLoading,
        isFetching,
        modules: data || []
      })
    });

  useEffect(() => {
    dispatch(setTitle(`Modules`));
  }, [dispatch]);

  const myModules = useMemo(() => {
    return modules.reduce(
      (prev, curr) => {
        if (curr.id === 1 || curr.id === 2 || curr.id === 4) {
          prev[curr.id] = true;
          prev.types.push(curr);
        }
        return prev;
      },
      {
        types: []
      }
    ).types;
  }, [modules]);

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

        {!isLoading && !myModules?.length && (
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
            <Button
              size="medium"
              color="offWhite"
              startIcon={<RefreshIcon />}
              sx={{
                ml: 1
              }}
              disabled={isLoading || isFetching}
              onClick={refetch}
            >
              Refresh
            </Button>
          </Box>
        )}

        {isLoading ? (
          <AutLoading width="130px" height="130px" />
        ) : (
          <>
            <GridBox sx={{ flexGrow: 1, mt: 4 }}>
              {myModules.map((pluginModule, index) => (
                <ModuleDefinitionCard
                  key={`modules-plugin-${index}`}
                  isFetching={isFetching}
                  pluginModule={pluginModule}
                />
              ))}
            </GridBox>
          </>
        )}
      </Container>
    </>
  );
};

export default memo(Modules);
