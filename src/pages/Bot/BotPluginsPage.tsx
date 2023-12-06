import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  tableCellClasses,
  Toolbar,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
  CardHeader,
  CardContent
} from "@mui/material";
import LoadingDialog from "@components/Dialog/LoadingPopup";
// import "./Contracts.scss";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  CommunityData,
  IsDiscordVerified
} from "@store/Community/community.reducer";
import { useEffect, useMemo, useRef, useState } from "react";
import AutTabs from "@components/AutTabs/AutTabs";
import { AutButton } from "@components/buttons";
import DiscordServerVerificationPopup from "@components/Dialog/DiscordServerVerificationPopup";
import { AppBar } from "@components/Sidebar/Sidebar";
import {
  useActivateDiscordBotPluginMutation,
  useCheckBotActiveQuery,
  useGetGatheringsQuery,
  useGetGuildIdQuery
} from "@api/discord.api";
import { updateDiscordSocials, useGetCommunityQuery } from "@api/community.api";
import { useDispatch } from "react-redux";
import { useAppDispatch } from "@store/store.model";
import { GridCard } from "../Modules/Shared/PluginCard";
import LoadingButton from "@mui/lab/LoadingButton";
import LinkWithQuery from "@components/LinkWithQuery";
import { GridBox } from "../Modules/Plugins/Task/Quiz/QuestionsAndAnswers";
import { environment } from "@api/environment";
import {
  useAddPluginToDAOMutation,
  useGetAllPluginDefinitionsByDAOQuery
} from "@api/plugin-registry.api";
import { BaseNFTModel } from "@aut-labs/sdk/dist/models/baseNFTModel";
import {
  PluginDefinitionProperties,
  PluginDefinitionType
} from "@aut-labs/sdk/dist/models/plugin";
import AutSDK from "@aut-labs/sdk";
import { gridColumnsTotalWidthSelector } from "@mui/x-data-grid";

const BotPluginsPage = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isDiscordVerified = useSelector(IsDiscordVerified);
  const communityData = useSelector(CommunityData);
  const isExtraLarge = useMediaQuery(theme.breakpoints.up("xxl"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(!isMobile);
  const [discordDialogOpen, setDiscordDialogOpen] = useState(false);

  const { data: community } = useGetCommunityQuery(null, {
    refetchOnMountOrArgChange: false,
    skip: false
  });

  const dispatch = useAppDispatch();
  const {
    data: guildId,
    isLoading,
    isFetching,
    refetch
  } = useGetGuildIdQuery(null, {
    skip: isDiscordVerified === false
  });

  const {
    plugins,
    isLoading: pluginsLoading,
    isFetching: pluginsFetching,
    refetch: refetchPlugins
  } = useGetAllPluginDefinitionsByDAOQuery(null, {
    selectFromResult: ({ data }) => ({
      isLoading,
      refetch,
      isFetching,
      plugins: (data || []).filter(
        (p) =>
          p.pluginDefinitionId === PluginDefinitionType.SocialBotPlugin ||
          p.pluginDefinitionId === PluginDefinitionType.SocialQuizPlugin
      )
    })
  });

  const [
    activateDiscordBotPlugin,
    { isLoading: isActivatingBotPlugin, isSuccess: activatedPluginSuccessfully }
  ] = useActivateDiscordBotPluginMutation();
  // Discord link hack
  // useEffect(() => {
  //   if (communityData) {
  //     const community = { ...communityData };
  //     for (let i = 0; i < community.properties.socials.length; i++) {
  //       const element = community.properties.socials[i];
  //       if (element.type === "discord") {
  //         element.link = "https://discord.gg/TdY5ceD6";
  //       }
  //     }
  //     const communityUpdateResult = dispatch(
  //       updateDiscordSocials({
  //         community,
  //         inviteLink: "https://discord.gg/TdY5ceD6"
  //       })
  //     );
  //   }
  // }, [communityData]);

  const handleActivatePlugin = (moduleId) => {
    activateDiscordBotPlugin({ moduleId });
  };

  const BotPluginCard = ({
    plugin,
    isFetching
  }: {
    isFetching: boolean;
    plugin: any;
  }) => {
    const communityData = useSelector(CommunityData);
    const navigate = useNavigate();

    const [addPlugin, { error, isLoading: isAddingPlugin, isError, reset }] =
      useAddPluginToDAOMutation();

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
          title={`${plugin?.metadata?.properties?.title}`}
        />
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Stack flex={1} maxWidth="80%" mx="auto">
            <Typography variant="body" textAlign="center" color="white">
              {plugin?.metadata?.properties?.shortDescription}
            </Typography>
          </Stack>
          <LoadingButton
            loading={isAddingPlugin}
            sx={{
              width: "80%",
              mx: "auto",
              my: 6
            }}
            disabled={isAddingPlugin || isFetching}
            variant="outlined"
            size="large"
            loadingIndicator={
              <Stack direction="row" gap={1} alignItems="center">
                <Typography className="text-secondary">
                  Activating...
                </Typography>
                <CircularProgress
                  size="20px"
                  color={plugin.pluginAddress ? "offWhite" : "primary"}
                />
              </Stack>
            }
            {...(plugin.pluginAddress && {
              onClick: () => {
                const page =
                  plugin?.metadata?.properties?.title === "Social Quiz"
                    ? "polls"
                    : "gatherings";
                navigate(`/${communityData.name}/bot/${page}`);
              }
            })}
            {...(!plugin.pluginAddress && {
              onClick: () => addPlugin(plugin)
            })}
            color="offWhite"
          >
            {plugin.pluginAddress ? "Go to plugin" : "Activate"}
          </LoadingButton>
        </CardContent>
      </GridCard>
    );
  };

  return (
    <Container maxWidth="md">
      {/* <LoadingDialog open={false} message="Updating admins..." />
        <ErrorDialog
          open={open}
          handleClose={null}
          message=" No new addresses were added!"
        />
        <ErrorDialog open={false} handleClose={null} message={null} /> */}
      <DiscordServerVerificationPopup
        open={discordDialogOpen}
        handleClose={() => setDiscordDialogOpen(false)}
      ></DiscordServerVerificationPopup>
      <Typography mt={7} textAlign="center" color="white" variant="h3">
        Āut Bot Plugins
      </Typography>

      <Stack mt={7} alignItems="center" justifyContent="center">
        <GridBox sx={{ flexGrow: 1, mt: 4 }}>
          {plugins.map((plugin, index) => (
            <BotPluginCard
              isFetching={pluginsFetching}
              // isAdmin={isAdmin}
              key={`plugin-${index}`}
              plugin={plugin}
              // hasCopyright={definition?.properties?.type === "Task"}
            />
          ))}
          {/* <BotPluginCard
            onActivatePlugin={handleActivatePlugin}
            isFetching={isFetching}
            // isAdmin={true}
            key={`plugin-${1}`}
            pluginModule={JSON.parse(
              '{"isActivated": "true","name":"Aut Labs Plugin","properties":{"shortDescription":"This is a description for the gatherings bot plugin.","longDescription":"This is a description for the gatherings bot plugin.","author":"Āut Labs","tags":["Workflow"],"contract":"SocialBotPlugin","module":{"type":"Default","title":"DiscordBot"},"title":"Gatherings","type":"Default"}}'
            )}
            //   hasCopyright={definition?.properties?.type === "Task"}
          />{" "}
          <BotPluginCard
            onActivatePlugin={handleActivatePlugin}
            isFetching={isFetching}
            // isAdmin={true}
            key={`plugin-${2}`}
            pluginModule={JSON.parse(
              '{"isActivated": "true","name":"Aut Labs Plugin","properties":{"shortDescription":"This is a description for the polls bot plugin.","longDescription":"This is a description for the polls bot plugin.","author":"Āut Labs","tags":["Workflow"],"contract":"SocialBotPlugin","module":{"type":"Default","title":"DiscordBot"},"title":"Polls","type":"Default"}}'
            )}
            //   hasCopyright={definition?.properties?.type === "Task"}
          /> */}
        </GridBox>
      </Stack>
    </Container>
  );
};

export default BotPluginsPage;
