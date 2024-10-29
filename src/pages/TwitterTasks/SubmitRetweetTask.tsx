import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import { AutDatepicker, FormHelperText } from "@components/Fields";
import {
  Box,
  Checkbox,
  duration,
  FormControlLabel,
  MenuItem,
  Stack,
  Typography,
  useTheme
} from "@mui/material";
import { AutSelectField } from "@theme/field-select-styles";
import { memo, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { dateToUnix } from "@utils/date-format";
import { countWords } from "@utils/helpers";
import { AutIDData, HubData } from "@store/Hub/hub.reducer";
import { useSelector } from "react-redux";

import { AutOSSlider } from "@theme/commitment-slider-styles";
import { AutOsButton } from "@components/buttons";
import {
  useCreateDiscordGatheringContributionMutation,
  useCreateOpenTaskContributionMutation,
  useCreateTwitterRetweetContributionMutation
} from "@api/contributions.api";
import {
  DiscordGatheringContribution,
  OpenTaskContribution,
  RetweetContribution
} from "@api/contribution.model";
import SuccessDialog from "@components/Dialog/SuccessPopup";
import SubmitDialog from "@components/Dialog/SubmitDialog";
import {
  CommitmentSliderWrapper,
  SliderFieldWrapper,
  StyledTextField,
  TextFieldWrapper
} from "../Modules/Plugins/Task/Shared/StyledFields";
import { FormContainer } from "../Modules/Plugins/Task/Shared/FormContainer";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useOAuthSocials } from "@components/Oauth2/oauth2";

const errorTypes = {
  maxWords: `Words cannot be more than 6`,
  maxNameChars: `Characters cannot be more than 24`,
  maxLength: `Characters cannot be more than 257`,
  invalidTweetUrl:
    "Please enter a valid tweet URL (e.g., https://twitter.com/username/status/123456789 or https://x.com/username/status/123456789)"
};

const SubmitRetweetTask = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const hubData = useSelector(HubData);
  const autID = useSelector(AutIDData);

  const { mutateAsync: verifyTetweetTask } = useMutation<any, void, any>({
    mutationFn: (verifyRetweetRequest) => {
      return axios
        .post(
          `http://localhost:4005/api/task/twitter/retweet`,
          verifyRetweetRequest
        )
        .then((res) => res.data);
    }
  });

  const twitterId = useMemo(() => {
    const social = hubData.properties.socials.find((s) => s.type === "twitter");
    return social.link;
  }, [hubData]);

  const [loading, setLoading] = useState(false);

  const { getAuthX } = useOAuthSocials();

  const onSubmit = async () => {
    await getAuthX(
      async (data) => {
        const { access_token } = data;
        debugger;
        setLoading(true);
        const contributionId = "test";
        await verifyTetweetTask(
          { accessToken: access_token, contributionId },
          {
            onSuccess: (response) => {
              debugger;
              setLoading(false);
            },
            onError: (res) => {}
          }
        );
        // const requestModel = {
        //   discordAccessToken: access_token,
        //   hubAddress,
        //   authSig
        // };
        // const result = await claimRole(requestModel, {
        //   onSuccess: (response) => {
        //     setLoading(false);
        //     setRoleClaimed(true);
        //   },
        //   onError: (res) => {
        //     setLoading(false);
        //   }
        // });
      },
      () => {
        setLoading(false);
      }
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        flex: 1,
        mb: 4,
        mx: "auto",
        width: "100%"
      }}
    >
      <Stack alignItems="center" justifyContent="center">
        <Typography
          variant="h3"
          fontSize={{
            xs: "14px",
            md: "20px"
          }}
          color="offWhite.main"
          fontWeight="bold"
        >
          Retweet Task
        </Typography>
      </Stack>
      <Typography
        sx={{
          width: {
            xs: "100%",
            sm: "700px",
            xxl: "1000px"
          }
        }}
        mt={2}
        mx="auto"
        variant="body"
        textAlign="center"
        color="offWhite.main"
        fontSize="16px"
      >
        Login with X to verify your retweet.
      </Typography>

      <Box
        sx={{
          width: "100%",
          display: "flex",
          mb: 4,
          mt: 4,
          justifyContent: {
            xs: "center",
            sm: "center"
          },
          alignItems: "center"
        }}
      >
        <AutOsButton
          type="button"
          color="primary"
          onClick={() => onSubmit()}
          variant="outlined"
          sx={{
            width: "100px"
          }}
        >
          <Typography fontWeight="bold" fontSize="16px" lineHeight="26px">
            Submit Task
          </Typography>
        </AutOsButton>
      </Box>
    </Box>
  );
};

export default memo(SubmitRetweetTask);
