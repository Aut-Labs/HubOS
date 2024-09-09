/* eslint-disable max-len */
import { useCreateTaskMutation } from "@api/onboarding.api";
import { PluginDefinition, Task } from "@aut-labs/sdk";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import { FormHelperText } from "@components/Fields";
import { StepperButton } from "@components/Stepper";
import {
  Box,
  Button,
  Container,
  InputAdornment,
  MenuItem,
  Stack,
  Typography,
  useTheme
} from "@mui/material";
import { AutTextField } from "@theme/field-text-styles";
import { pxToRem } from "@utils/text-size";
import { memo, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { dateToUnix } from "@utils/date-format";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { RequiredQueryParams } from "@api/RequiredQueryParams";
import { AutSelectField } from "@theme/field-select-styles";
import { InteractionNetworks } from "@utils/transaction-networks";
import LinkWithQuery from "@components/LinkWithQuery";
import { countWords } from "@utils/helpers";
import { CommunityData, allRoles } from "@store/Community/community.reducer";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import { addMinutes } from "date-fns";
import { StyledTextField, TextFieldWrapper } from "../Shared/StyledFields";
import { AutOsButton } from "@components/buttons";

const errorTypes = {
  maxWords: `Words cannot be more than 6`,
  maxNameChars: `Characters cannot be more than 24`,
  maxLength: `Characters cannot be more than 257`
};

interface PluginParams {
  plugin: PluginDefinition;
}

const TaskSuccess = ({ pluginId, reset }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const communityData = useSelector(CommunityData);

  return (
    <Container
      maxWidth="sm"
      sx={{ mt: pxToRem(20), flexGrow: 1, display: "flex" }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          my: "auto"
        }}
      >
        <Typography align="center" color="white" variant="h2" component="div">
          Success! Transaction task has been created and deployed on the
          Blockchain 🎉
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gridGap: "20px"
          }}
        >
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            sx={{
              my: pxToRem(50)
            }}
            size="medium"
            color="offWhite"
            to={`/${communityData?.name}/modules/Task`}
            preserveParams
            component={LinkWithQuery}
          >
            Add another task
          </Button>

          {searchParams.has("returnUrl") && (
            <Button
              sx={{
                my: pxToRem(50)
              }}
              onClick={() =>
                navigate({
                  pathname: searchParams.get("returnUrl"),
                  search: searchParams.toString()
                })
              }
              type="submit"
              variant="outlined"
              size="medium"
              color="offWhite"
            >
              {searchParams.get("returnUrlLinkName") || "Back"}
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

const endDatetime = new Date();
addMinutes(endDatetime, 45);

const TransactionTasks = ({ plugin }: PluginParams) => {
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const roles = useSelector(allRoles);
  const { address: account } = useAccount();
  const communityData = useSelector(CommunityData);
  const { control, handleSubmit, getValues, formState } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      linkToInteractUrl: "",
      smartContractAddress: "",
      functionName: "",
      network: ""
    }
  });

  const [createTask, { error, isError, isSuccess, data, isLoading, reset }] =
    useCreateTaskMutation();

  const onSubmit = async () => {
    const values = getValues();
    createTask({
      novaAddress: communityData.properties.address,
      pluginTokenId: plugin.tokenId,
      pluginAddress: plugin.pluginAddress,
      task: {
        role: 1,
        metadata: {
          name: values.title,
          description: values.description,
          properties: {
            network: values.network,
            linkToInteractUrl: values.linkToInteractUrl,
            smartContractAddress: values.smartContractAddress,
            functionName: values.functionName
          }
        },
        startDate: dateToUnix(new Date()),
        endDate: dateToUnix(endDatetime)
      } as unknown as Task
    });
  };

  useEffect(() => {
    if (isSuccess) {
      navigate({
        pathname: `/${communityData?.name}/tasks`
      });
    }
  }, [isSuccess, communityData]);

  const selectedRole = useMemo(() => {
    return roles.find(
      (r) => r.id === +searchParams.get(RequiredQueryParams.QuestId)
    );
  }, [roles, searchParams]);

  return (
    // @ts-ignore
    <Container
      sx={{ py: "20px", display: "flex", flexDirection: "column" }}
      maxWidth="lg"
      component="form"
      autoComplete="off"
      onSubmit={handleSubmit(onSubmit)}
    >
      <ErrorDialog handleClose={() => reset()} open={isError} message={error} />
      <LoadingDialog open={isLoading} message="Creating task..." />

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
            variant="subtitle1"
            fontSize={{
              xs: "14px",
              md: "20px"
            }}
            color="offWhite.main"
            fontWeight="bold"
          >
            Smart Contract Task for {selectedRole?.roleName}
          </Typography>
        </Stack>
        <Typography
          sx={{
            width: {
              xs: "100%",
              sm: "500px",
              xxl: "600px"
            }
          }}
          mt={2}
          mx="auto"
          textAlign="center"
          color="offWhite.main"
          fontSize="16px"
        >
          Create a task based on a Smart Contract Interaction. We will
          automatically validate the interaction on the chosen smart contract(s)
          in order to approve the submission.
        </Typography>
      </Box>
      <Stack
        direction="column"
        gap={4}
        sx={{
          margin: "0 auto",
          width: {
            xs: "100%",
            sm: "650px",
            xxl: "800px"
          }
        }}
      >
        <TextFieldWrapper>
          <Typography
            variant="caption"
            color="offWhite.main"
            mb={theme.spacing(1)}
          >
            Title
          </Typography>
          <Controller
            name="title"
            control={control}
            rules={{
              required: true,
              validate: {
                maxWords: (v: string) => countWords(v) <= 6
              }
            }}
            render={({ field: { name, value, onChange } }) => {
              return (
                <StyledTextField
                  color="offWhite"
                  required
                  sx={{
                    // ".MuiInputBase-input": {
                    //   height: "48px"
                    // },
                    width: "100%",
                    height: "48px"
                  }}
                  autoFocus
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  placeholder="Choose a title for your task"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {value ? (
                          <></>
                        ) : (
                          <Typography
                            variant="caption"
                            color="offWhite.main"
                            sx={{ opacity: 0.5 }}
                          >
                            e.g. Mint an NFT on Opensea
                          </Typography>
                        )}
                      </InputAdornment>
                    )
                  }}
                  helperText={
                    <FormHelperText
                      errorTypes={errorTypes}
                      value={value}
                      name={name}
                      errors={formState.errors}
                    >
                      <Typography variant="caption" color="white">
                        {6 - countWords(value)} Words left
                      </Typography>
                    </FormHelperText>
                  }
                />
              );
            }}
          />
        </TextFieldWrapper>

        <TextFieldWrapper>
          <Typography
            variant="caption"
            color="offWhite.main"
            mb={theme.spacing(1)}
          >
            Description
          </Typography>
          <Controller
            name="description"
            control={control}
            rules={{
              required: true,
              maxLength: 257
            }}
            render={({ field: { name, value, onChange } }) => {
              return (
                <StyledTextField
                  name={name}
                  value={value || ""}
                  color="offWhite"
                  rows="5"
                  multiline
                  onChange={onChange}
                  placeholder="Write a description of the task for your community"
                  helperText={
                    <FormHelperText
                      errorTypes={errorTypes}
                      value={value}
                      name={name}
                      errors={formState.errors}
                    >
                      <Typography variant="caption" color="white">
                        {257 - (value?.length || 0)} of 257 characters left
                      </Typography>
                    </FormHelperText>
                  }
                />
              );
            }}
          />
        </TextFieldWrapper>

        <Controller
          name="network"
          control={control}
          rules={{
            validate: {
              selected: (v) => !!v
            }
          }}
          render={({ field: { name, value, onChange } }) => {
            return (
              <AutSelectField
                variant="standard"
                color="offWhite"
                renderValue={(selected) => {
                  if (!selected) {
                    return "Network" as any;
                  }
                  const network = InteractionNetworks.find(
                    (t) => t.network === selected
                  );
                  return network?.name || selected;
                }}
                name={name}
                value={value || ""}
                displayEmpty
                required
                onChange={onChange}
              >
                {InteractionNetworks.map((type) => {
                  return (
                    <MenuItem key={`role-${type.network}`} value={type.network}>
                      {type.name}
                    </MenuItem>
                  );
                })}
              </AutSelectField>
            );
          }}
        />

        <TextFieldWrapper>
          <Typography
            variant="caption"
            color="offWhite.main"
            mb={theme.spacing(1)}
          >
            Your DApp's URL
          </Typography>
          <Controller
            name="linkToInteractUrl"
            control={control}
            rules={{
              required: true,
              maxLength: 257
            }}
            render={({ field: { name, value, onChange } }) => {
              return (
                <StyledTextField
                  name={name}
                  value={value || ""}
                  sx={{
                    width: "100%",
                    height: "48px"
                  }}
                  color="offWhite"
                  onChange={onChange}
                  placeholder="e.g. https://opensea.io/"
                  // InputProps={{
                  //   endAdornment: (
                  //     <InputAdornment position="end">
                  //       {value ? (
                  //         <></>
                  //       ) : (
                  //         <Typography
                  //           variant="caption"
                  //           color="offWhite.dark"
                  //           sx={{ opacity: 0.5 }}
                  //         >
                  //           e.g. https://opensea.io/
                  //         </Typography>
                  //       )}
                  //     </InputAdornment>
                  //   )
                  // }}
                />
              );
            }}
          />
        </TextFieldWrapper>

        <TextFieldWrapper>
          <Typography
            variant="caption"
            color="offWhite.main"
            mb={theme.spacing(1)}
          >
            Smart Contract Address
          </Typography>
          <Controller
            name="smartContractAddress"
            control={control}
            rules={{
              required: true
            }}
            render={({ field: { name, value, onChange } }) => {
              return (
                <StyledTextField
                  color="offWhite"
                  required
                  sx={{
                    width: "100%",
                    height: "48px"
                  }}
                  autoFocus
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  placeholder=" 0x…"
                  helperText={
                    <FormHelperText
                      errorTypes={errorTypes}
                      value={value}
                      name={name}
                      errors={formState.errors}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column"
                        }}
                      >
                        <Typography
                          color="white"
                          variant="caption"
                          textAlign="right"
                        >
                          *Please remember that when using metatxs, you should
                          use the contract address of your trusted forwarder
                          instead of the address of your deployed contract.
                        </Typography>
                      </Box>
                    </FormHelperText>
                  }
                />
              );
            }}
          />
        </TextFieldWrapper>

        <TextFieldWrapper
          sx={{
            marginTop: theme.spacing(4)
          }}
        >
          <Typography
            variant="caption"
            color="offWhite.main"
            mb={theme.spacing(1)}
          >
            Copy your Contract function
          </Typography>
          <Controller
            name="functionName"
            control={control}
            rules={{
              required: true
            }}
            render={({ field: { name, value, onChange } }) => {
              return (
                <StyledTextField
                  color="offWhite"
                  required
                  sx={{
                    width: "100%",
                    height: "48px"
                  }}
                  autoFocus
                  disabled
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  placeholder="e.g. _Mint"
                  helperText={
                    <FormHelperText
                      errorTypes={errorTypes}
                      value={value}
                      name={name}
                      errors={formState.errors}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column"
                        }}
                      >
                        <Typography
                          color="white"
                          variant="caption"
                          textAlign="right"
                        >
                          *Please remember that when using metatxs, you should
                          use the contract address of your trusted forwarder
                          instead of the address of your deployed contract.
                        </Typography>
                      </Box>
                    </FormHelperText>
                  }
                />
              );
            }}
          />
        </TextFieldWrapper>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            mb: 4,
            mt: 6,
            justifyContent: {
              xs: "center",
              sm: "flex-end"
            }
          }}
        >
          <AutOsButton
            type="button"
            color="primary"
            disabled={!formState.isValid}
            variant="outlined"
            sx={{
              width: "100px"
            }}
          >
            <Typography fontWeight="bold" fontSize="16px" lineHeight="26px">
              Confirm
            </Typography>
          </AutOsButton>
        </Box>
      </Stack>
    </Container>
  );
};

export default memo(TransactionTasks);
