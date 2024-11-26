import { Box, Container, Typography, useTheme } from "@mui/material";
import { memo, useMemo, useState } from "react";
import AutLoading from "@components/AutLoading";
import useQueryContributions from "@hooks/useQueryContributions";
import { ContributionsTable } from "./ContributionsTable";
import useQueryContributionCommits, {
  ContributionCommit
} from "@hooks/useQueryContributionCommits";
import { HubData } from "@store/Hub/hub.reducer";
import { useSelector } from "react-redux";
import { TaskContributionNFT } from "@aut-labs/sdk";
import HubOsTabs from "@components/HubOsTabs";
import { SubmissionsTable } from "./SubmissionsTable";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import SubmitDialog from "@components/Dialog/SubmitDialog";
import {
  useCreateQuizContributionMutation,
  useGiveContributionMutation
} from "@api/contributions.api";

const Contributions = () => {
  const theme = useTheme();
  const hubData = useSelector(HubData);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedContribution, setSelectedContribution] =
    useState<TaskContributionNFT>(null);

  const [
    giveContribution,
    { error, isError, isSuccess, isLoading: isLoadingSubmit, reset }
  ] = useGiveContributionMutation();

  const { data, loading: isLoadingContributions } = useQueryContributions({
    variables: {
      skip: 0,
      take: 1000
    }
  });

  const { data: commits, loading: isLoadingCommits, refetch } =
    useQueryContributionCommits({
      skip: !hubData?.properties?.address,
      variables: {
        skip: 0,
        take: 1000,
        where: {
          hub: hubData?.properties?.address
        }
      }
    });

  const isLoading = useMemo(() => {
    return isLoadingContributions || isLoadingCommits;
  }, [isLoadingContributions, isLoadingCommits]);

  const contributionsWithSubmissions: {
    contribution: TaskContributionNFT;
    submissions: ContributionCommit[];
  }[] = useMemo(() => {
    if (!data || !commits) {
      return [];
    }

    return data.map((contribution) => {
      const contributionCommits = commits.filter(
        (commit) => commit?.contribution?.id === contribution?.properties?.id
      );
      return {
        contribution,
        submissions: contributionCommits
      };
    });
  }, [data, commits]);

  const onViewSubmissions = (contribution: TaskContributionNFT) => {
    setSelectedContribution(contribution);
    setSelectedTabIndex(1);
  };

  const onGiveSubmission = (
    contribution: TaskContributionNFT,
    submission: ContributionCommit
  ) => {
    giveContribution({
      contribution,
      submission
    });
  };

  const tabs = useMemo(() => {
    return [
      {
        label: "Contributions",
        props: {
          contributionsWithSubmissions: contributionsWithSubmissions,
          onViewSubmissions: onViewSubmissions
        },
        component: ContributionsTable
      },
      {
        label: "Submissions",
        props: {
          contributionsWithSubmissions: contributionsWithSubmissions,
          selectedContribution: selectedContribution,
          onGiveSubmission: onGiveSubmission
        },
        component: SubmissionsTable
      }
    ];
  }, [
    contributionsWithSubmissions,
    selectedContribution,
    onViewSubmissions
  ]);

  return (
    <Container
      sx={{
        py: "20px",
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}
      maxWidth="md"
    >
      <ErrorDialog handleClose={() => reset()} open={isError} message={error} />
      <SubmitDialog
        open={isSuccess || isLoadingSubmit}
        mode={isSuccess ? "success" : "loading"}
        backdropFilter={true}
        message={isLoadingSubmit ? "" : "Congratulations!"}
        titleVariant="h2"
        subtitle={
          isLoadingSubmit
            ? "Giving contribution..."
            : "Your contribution has been given successfully!"
        }
        subtitleVariant="subtitle1"
        handleClose={() => {
          reset();
          refetch();
        }}
      ></SubmitDialog>
      {isLoading ? (
        <AutLoading width="130px" height="130px" />
      ) : (
        <>
          <Container maxWidth="md">
            <Box
              sx={{
                my: theme.spacing(4)
              }}
            >
              <HubOsTabs
                selectedTab={(index) => {
                  setSelectedTabIndex(index);
                }}
                selectedTabIndex={selectedTabIndex}
                tabs={tabs}
              />
            </Box>
          </Container>
        </>
      )}
    </Container>
  );
};

export default memo(Contributions);
