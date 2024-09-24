 
import { Box, Button, Link, Typography, useTheme } from "@mui/material";
import { ArchetypePieChartDesign } from "./ArchetypePieChart";
import { useForm } from "react-hook-form";
import { BaseNFTModel } from "@aut-labs/sdk/dist/models/baseNFTModel";
import JoinDiscordTasks from "../Modules/Plugins/Task/JoinDiscord/JoinDiscordTasks";
import TransactionTasks from "../Modules/Plugins/Task/Transaction/TransactionTasks";

export const ArchetypePie = ({ archetype }) => {
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    getValues,
    reset: resetForm,
    setValue,
    watch,
    formState
  } = useForm({
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      startDate: new Date(),
      endDate: null,
      description: "",
      questions: [],
      weight: 0
    }
  });

  const mockedPlugin = {
    metadataURI: "",
    price: 0,
    metadata: {} as BaseNFTModel<any>,
    creator: "",
    tokenId: 0,
    active: false,
    pluginAddress: "",
    pluginDefinitionId: 0
  };

  return (
    <>
      <ArchetypePieChartDesign archetype={archetype} />
      {/* @ts-ignore */}
      {/* {archetype?.archetype === HubArchetype.NONE && (
        <>
          <Button
            sx={{
              zIndex: 1,
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "200px",
              height: "80px",
              textAlign: "center"
            }}
            component={Link}
            to={`your-archetype`}
            type="button"
            color="secondary"
            variant="contained"
            size="medium"
          >
            Set your <br /> archetype
          </Button>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
              backdropFilter: "blur(25px)"
            }}
          />
        </>
      )} */}
    </>
  );
};
