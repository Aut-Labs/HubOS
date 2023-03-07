import { LoadingButton } from "@mui/lab";
import {
  Box,
  Stack,
  Typography,
  Tooltip,
  Chip,
  Badge,
  CircularProgress,
  Button
} from "@mui/material";
import { addDays } from "date-fns";
import { memo, useEffect, useState } from "react";
import DescriptionIcon from "@mui/icons-material/Description";
import { Quest } from "@aut-labs-private/sdk";
import {
  useApplyForQuestMutation,
  useLazyHasUserCompletedQuestQuery
} from "@api/onboarding.api";
import { useEthers } from "@usedapp/core";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import { useSearchParams } from "react-router-dom";
import InfoIcon from "@mui/icons-material/Info";
import { useConfirmDialog } from "react-mui-confirm";
import { deleteCache, getCache, updateCache } from "@api/cache.api";
import BetaCountdown from "@components/BetaCountdown";

const QuestInfo = ({
  quest,
  hasQuestStarted,
  setAppliedQuestFn
}: {
  quest: Quest;
  setAppliedQuestFn: (state: number) => void;
  hasQuestStarted: boolean;
}) => {
  const [searchParams] = useSearchParams();
  const { account } = useEthers();
  const [appliedQuest, setAppliedQuest] = useState(null);
  const [cache, setCache] = useState(null);
  const confirm = useConfirmDialog();
  const [hasUserCompletedQuest] = useLazyHasUserCompletedQuestQuery();
  const [apply, { isLoading: isApplying, isError, error, reset, isSuccess }] =
    useApplyForQuestMutation();

  const confimWithdrawal = () =>
    confirm({
      title: "Are you sure you want to delete withdraw from quest?",
      onConfirm: async () => {
        try {
          // implement withdraw
          await deleteCache({
            ...(cache || {}),
            address: account
          });
          setAppliedQuest(null);
          setAppliedQuestFn(null);
          setCache(null);
        } catch (error) {
          console.log(error);
        }
      }
    });

  useEffect(() => {
    if (isSuccess) {
      const start = async () => {
        try {
          const updatedCache = await updateCache({
            ...(cache || {}),
            address: account,
            questId: +searchParams.get("questId"),
            onboardingQuestAddress: searchParams.get("onboardingQuestAddress"),
            daoAddress: searchParams.get("daoAddress"),
            list: [
              {
                phase: 1,
                status: 1
              },
              {
                phase: 2,
                status: 0
              },
              {
                phase: 3,
                status: 0
              }
            ]
          });
          setAppliedQuest(updatedCache?.questId);
          setAppliedQuestFn(updatedCache?.questId);
          setCache(updatedCache);
          reset();
        } catch (error) {
          console.log(error);
        }
      };
      start();
    }
  }, [isSuccess]);

  useEffect(() => {
    const start = async () => {
      try {
        const cacheResult = await getCache(account);
        setAppliedQuest(cacheResult?.questId);
        setAppliedQuestFn(cacheResult?.questId);
        setCache(cacheResult);
        if (
          !!cacheResult?.questId &&
          cacheResult?.questId === +searchParams.get("questId")
        ) {
          hasUserCompletedQuest({
            questId: +searchParams.get("questId"),
            userAddress: account,
            onboardingQuestAddress: searchParams.get("onboardingQuestAddress"),
            daoAddress: searchParams.get("daoAddress")
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    start();
  }, []);
  return (
    <>
      <ErrorDialog handleClose={() => reset()} open={isError} message={error} />
      <Box
        sx={{
          flex: 1,
          boxShadow: 1,
          border: "2px solid",
          borderColor: "divider",
          borderRadius: "16px",
          height: "100%",
          p: 3,
          backgroundColor: "nightBlack.main"
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between"
          }}
        >
          <Stack direction="column">
            <Typography color="white" variant="subtitle1">
              <Stack direction="row" alignItems="center">
                {quest?.metadata?.name}
                <Tooltip title={quest?.metadata?.description}>
                  <DescriptionIcon
                    sx={{
                      color: "offWhite.main",
                      ml: 1
                    }}
                  />
                </Tooltip>
                <Chip
                  sx={{
                    ml: 1
                  }}
                  label={hasQuestStarted ? "Ongoing" : "Active"}
                  color={hasQuestStarted ? "info" : "success"}
                  size="small"
                />
              </Stack>
            </Typography>
            <Typography variant="caption" className="text-secondary">
              Quest
            </Typography>
          </Stack>

          {!hasQuestStarted && (
            <>
              {!appliedQuest && (
                <Badge
                  badgeContent={
                    <Tooltip title="You can only apply to one quest, but you can withdraw before it starts.">
                      <InfoIcon
                        sx={{
                          fontSize: "16px",
                          color: "white"
                        }}
                      />
                    </Tooltip>
                  }
                >
                  <LoadingButton
                    onClick={async () => {
                      apply({
                        onboardingQuestAddress: searchParams.get(
                          "onboardingQuestAddress"
                        ),
                        questId: +searchParams.get("questId")
                      });
                    }}
                    disabled={isApplying}
                    loadingIndicator={
                      <Stack direction="row" gap={1} alignItems="center">
                        <Typography className="text-secondary">
                          Applying...
                        </Typography>
                        <CircularProgress size="20px" color="offWhite" />
                      </Stack>
                    }
                    loading={isApplying}
                    size="small"
                    color="primary"
                    variant="contained"
                  >
                    Apply for quest
                  </LoadingButton>
                </Badge>
              )}
              {appliedQuest === +searchParams.get("questId") && (
                <Button
                  onClick={confimWithdrawal}
                  size="small"
                  color="error"
                  variant="contained"
                >
                  Withdraw
                </Button>
              )}
            </>
          )}
        </Box>

        <Box
          sx={{
            mt: 2,
            display: "grid",
            gridTemplateColumns: "1fr 2fr"
          }}
        >
          <BetaCountdown
            hasStarted={hasQuestStarted}
            startDate={quest?.startDate}
            endDate={addDays(
              new Date(quest?.startDate),
              quest?.durationInDays
            ).getTime()}
          />
        </Box>
      </Box>
    </>
  );
};

export default memo(QuestInfo);
