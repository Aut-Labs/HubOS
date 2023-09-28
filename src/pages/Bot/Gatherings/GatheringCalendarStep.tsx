import {
  Box,
  Button,
  Container,
  Divider,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  styled,
  Typography
} from "@mui/material";
import { useAppDispatch } from "@store/store.model";
import { useSelector } from "react-redux";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";

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
import format from "date-fns/format";
import { StepperButton } from "@components/Stepper";
import { updateGatheringData } from "@store/Bot/gathering.reducer";
import { useNavigate } from "react-router-dom";
import { CommunityData } from "@store/Community/community.reducer";
import theme from "@theme/theme";

const GatheringCalendarStep = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { startDate, startTime } = useSelector(ActivityGroupCallData);
  const communityData = useSelector(CommunityData);

  const { control, handleSubmit, watch, formState } = useForm({
    mode: "onChange",
    defaultValues: {
      startDate: null,
      duration: null
    }
  });
  const values = watch();

  const onSubmit = async () => {
    dispatch(updateGatheringData(values));
    navigate(`/${communityData.name}/bot/gathering/calendar`);
  };

  return (
    <Container
      sx={{ py: "20px", display: "flex", flexDirection: "column" }}
      component="form"
      maxWidth="lg"
      autoComplete="off"
      onSubmit={handleSubmit(onSubmit)}
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
            When
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
          <StepperButton label={"Next "} disabled={false} />
        </Box>
      </Stack>
    </Container>
  );
};

export default GatheringCalendarStep;
