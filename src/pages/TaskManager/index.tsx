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
import LoadingProgressBar from "@components/LoadingProgressBar";
import RefreshIcon from "@mui/icons-material/Refresh";
import { setTitle } from "@store/ui-reducer";
import { useAppDispatch } from "@store/store.model";
import AutLoading from "@components/AutLoading";
import useQueryTaskTypes from "@hooks/useQueryTaskTypes";
import { ModuleDefinitionCard } from "../Modules/Shared/PluginCard";

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

const TaskManager = () => {
  const dispatch = useAppDispatch();
  const { data, loading: isLoading, refetch } = useQueryTaskTypes({
    variables: {
      skip: 0,
      take: 1000
    }
  });
  useEffect(() => {
    dispatch(setTitle(`Modules`));
  }, [dispatch]);

  return (
    <>
      <LoadingProgressBar isLoading={isLoading} />
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
            Task Manager
          </Typography>
        </Box>

        {!isLoading && !data?.length && (
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
              No task types were found...
            </Typography>
            <Button
              size="medium"
              color="offWhite"
              startIcon={<RefreshIcon />}
              sx={{
                ml: 1
              }}
              disabled={isLoading}
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
              {/* @TODO - Iulia to redesign this */}
              {data.map((pluginModule, index) => (
                <ModuleDefinitionCard
                  key={`modules-plugin-${index}`}
                  isFetching={isLoading}
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

export default memo(TaskManager);
