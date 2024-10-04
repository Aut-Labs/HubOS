import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  styled
} from "@mui/material";
import { memo, useMemo } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import { useSelector } from "react-redux";
import { SelectedNetwork } from "@store/WalletProvider/WalletProvider";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import LinkWithQuery from "@components/LinkWithQuery";
import { LoadingButton } from "@mui/lab";
import { Link } from "react-router-dom";
import { TaskType } from "@api/models/task-type";
import { HubData } from "@store/Hub/hub.reducer";

const GridCard = styled(Card)(({ theme }) => {
  return {
    minHeight: "365px",
    width: "100%",
    transition: theme.transitions.create(["transform"]),
    "&:hover": {
      transform: "scale(1.019)"
    }
  };
});

const PluginCard = ({
  plugin,
  isFetching,
  isAdmin,
  hasCopyright
}: {
  isAdmin: boolean;
  plugin: any;
  isFetching: boolean;
  hasCopyright: boolean;
}) => {
  const selectedNetwork = useSelector(SelectedNetwork);

  const path = useMemo(() => {
    return ``;
  }, []);

  const actionName = useMemo(() => {
    if (!plugin?.pluginAddress) return "Install";

    // if (
    //   plugin.pluginDefinitionId === PluginDefinitionType.QuestOnboardingPlugin
    // ) {
    //   return "Go to Quests";
    // }
    return "Add Task";
  }, [plugin]);

  return (
    <>
      <GridCard
        sx={{
          bgcolor: "nightBlack.main",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderColor: "divider",
          borderRadius: "16px",
          minHeight: "300px",
          boxShadow: 7,
          position: hasCopyright ? "relative" : "inherit"
        }}
        variant="outlined"
      >
        <CardHeader
          sx={{
            alignItems: "flex-start",
            minHeight: "140px",
            ".MuiCardHeader-action": {
              mt: "3px"
            }
          }}
          titleTypographyProps={{
            fontFamily: "FractulAltBold",
            mb: 2,
            fontWeight: 900,
            color: "white",
            variant: "subtitle1"
          }}
          subheaderTypographyProps={{
            color: "white"
          }}
          action={
            <>
              {!!plugin?.pluginAddress && <CheckCircleIcon color="success" />}
            </>
          }
          title={plugin?.metadata?.properties?.title}
          subheader={plugin?.metadata?.properties?.shortDescription}
        />
        <CardContent
          sx={{
            pt: 0
          }}
        >
          {/* <Stack direction="row" alignItems="flex-end" justifyContent="center">
            <Typography
              sx={{
                letterSpacing: "-.04em",
                color: !!plugin.pluginAddress ? "primary.main" : "error.light"
              }}
              lineHeight={1}
              variant="h2"
            >
              {!!plugin.pluginAddress ? "Activated" : "Inactive"}
            </Typography>

            {!!plugin.pluginAddress && (
              <Tooltip title={`Explore in ${selectedNetwork?.name}`}>
                <IconButton
                  href={exploreAddressUrl}
                  target="_blank"
                  color="offWhite"
                >
                  <OpenInNewIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack> */}

          {hasCopyright && (
            <Box
              sx={{
                position: "absolute",
                bottom: "15px",
                right: "15px"
              }}
            >
              {" "}
              <Typography color="white" variant="caption">
                © Āut Labs
              </Typography>
            </Box>
          )}

          {/* <Stack direction="row" justifyContent="flex-end">
            <Typography
              className="text-secondary"
              sx={{
                mr: "2px",
                fontWeight: "bold",
                fontFamily: "FractulAltBold",
                fontSize: "12px"
              }}
            >
              {plugin?.metadata?.name}
            </Typography>
          </Stack> */}
        </CardContent>
      </GridCard>
    </>
  );
};

export const EmptyPluginCard = ({ type, typeformLink }) => {
  return (
    <GridCard
      sx={{
        bgcolor: "nightBlack.main",
        borderColor: "divider",
        borderStyle: "dashed",
        borderRadius: "16px",
        boxShadow: 7,
        minHeight: "300px"
      }}
      variant="outlined"
    >
      <CardActionArea
        sx={{
          height: "100%"
        }}
        onClick={() => {
          window.open(typeformLink, "_blank");
        }}
      >
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
            cursor: "pointer"
          }}
        >
          {/* <Typography textAlign="center" color="white" variant="body">
            Request new <br /> {type} plugin
          </Typography> */}
          <Typography textAlign="center" color="white" variant="body">
            Request a plugin type
          </Typography>
          <AddIcon
            sx={{
              mt: 2,
              color: "white",
              fontSize: "80px"
            }}
          />
        </CardContent>
      </CardActionArea>
    </GridCard>
  );
};

export const ModuleDefinitionCard = ({
  taskType,
  isFetching
}: {
  isFetching: boolean;
  taskType: TaskType;
}) => {
  const hubData = useSelector(HubData);
  const path = useMemo(() => {
    const titleAsType = taskType?.metadata?.properties?.title?.toLowerCase()?.replace(/\s/g, "-");
    return `/${hubData?.name}/create-${titleAsType}`;
  }, [hubData]);

  return (
    <GridCard
      sx={{
        bgcolor: "nightBlack.main",
        borderColor: "divider",
        borderRadius: "16px",
        minHeight: "300px",
        boxShadow: 7,
        display: "flex",
        flexDirection: "column"
      }}
      variant="outlined"
    >
      <CardHeader
        sx={{
          alignItems: "center",
          ".MuiCardHeader-action": {
            mt: "3px"
          },
          display: "flex",
          flexDirection: "column"
        }}
        titleTypographyProps={{
          fontFamily: "FractulAltBold",
          mb: 2,
          fontWeight: 900,
          color: "white",
          variant: "subtitle1"
        }}
        title={`${taskType?.metadata?.properties?.title}`}
      />
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Typography variant="body" textAlign="left" color="white">
          {taskType?.metadata?.properties?.shortDescription}
        </Typography>

        <Button
          type="button"
          color="offWhite"
          variant="outlined"
          size="medium"
          sx={{ mt: 2 }}
          component={Link}
          startIcon={<AddIcon />}
          to={{
            pathname: path,
            search: `?taskId=${taskType?.taskId}`
          }}
        >
          Contribution
        </Button>
      </CardContent>
    </GridCard>
  );
};

export default memo(PluginCard);
