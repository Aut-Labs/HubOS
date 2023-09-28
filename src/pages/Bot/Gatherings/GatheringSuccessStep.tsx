import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Stack,
  styled,
  Typography,
  useMediaQuery
} from "@mui/material";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useAppDispatch } from "@store/store.model";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import AdapterDateFns from "@mui/lab/AdapterDateFns";
// import LocalizationProvider from "@mui/lab/LocalizationProvider";

import { AutTextField } from "@theme/field-text-styles";
import { FormHelperText, SwCalendarPicker } from "@components/Fields";
import { pxToRem } from "@utils/text-size";
import { countWords, generateTimeSlots } from "@utils/helpers";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  ActivityGroupCallData,
  activityUpdateGroupCallData
} from "@store/Activity/call.reducer";
import { AutHeader } from "@components/AutHeader";
import { AutButton } from "@components/buttons";
import { StepperButton } from "@components/Stepper";
import { updateGatheringData } from "@store/Bot/gathering.reducer";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { AutSelectField } from "@theme/field-select-styles";

import {
  usePickerLayout,
  PickersLayoutRoot,
  pickersLayoutClasses,
  PickersLayoutContentWrapper
} from "@mui/x-date-pickers/PickersLayout";
import { PickersActionBarProps } from "@mui/x-date-pickers";
import theme from "@theme/theme";
import { CommunityData } from "@store/Community/community.reducer";
import {
  useCreateGatheringMutation,
  useGetChannelsQuery
} from "@api/discord.api";
import axios from "axios";
import AutLoading from "@components/AutLoading";
import LoadingProgressBar from "@components/LoadingProgressBar";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import ErrorDialog from "@components/Dialog/ErrorPopup";

const GatheringSuccessStep = () => {
  const communityData = useSelector(CommunityData);
  const navigate = useNavigate();

  const goBack = async () => {
    navigate(`/${communityData.name}/bot`);
  };

  return (
    <Container
      sx={{ py: "20px", display: "flex", flexDirection: "column" }}
      maxWidth="lg"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          mb: 4,
          position: "relative",
          mx: "auto",
          width: "100%"
        }}
      >
        <Stack alignItems="center" justifyContent="center">
          <Typography textAlign="center" color="white" variant="h3">
            Successfully created gathering
          </Typography>
        </Stack>
      </Box>

      <Stack
        direction="column"
        gap={4}
        sx={{
          margin: "0 auto",
          width: {
            xs: "100%",
            sm: "600px",
            xxl: "800px"
          }
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end"
          }}
        >
          <StepperButton onClick={() => goBack()} label={"Back"} />
        </Box>
      </Stack>
    </Container>
  );
};

export default GatheringSuccessStep;
