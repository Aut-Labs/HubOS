import { Box, Container, Typography, useTheme } from "@mui/material";
import { memo, useMemo, useState } from "react";
import AutLoading from "@components/AutLoading";
import useQueryContributions from "@hooks/useQueryContributions";
import { ContributionsTable } from "./ContributionsTable";
import useQueryContributionCommits, {
  ContributionCommit
} from "@hooks/useQueryContributionCommits";
import { HubData } from "@store/Hub/hub.reducer";
import { useDispatch, useSelector } from "react-redux";
import { TaskContributionNFT } from "@aut-labs/sdk";
import HubOsTabs from "@components/HubOsTabs";
import { SubmissionsTable } from "../Submissions/SubmissionsTable";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import SubmitDialog from "@components/Dialog/SubmitDialog";
import {
  useCreateQuizContributionMutation,
  useGiveContributionMutation
} from "@api/contributions.api";
import { setSelectedContribution } from "@store/Contributions/contributions.reducer";
import { useNavigate } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import SubmissionDetails from "../Submissions/SubmissionDetails";

const Contributions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hubData = useSelector(HubData);
  const selectedContribution = useSelector(
    (state: any) => state.contribution.selectedContribution
  );
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

  const {
    data: commits,
    loading: isLoadingCommits,
    refetch
  } = useQueryContributionCommits({
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
    // setSelectedContribution(contribution);
    dispatch(setSelectedContribution(contribution));
    navigate({
      pathname: `${contribution?.properties?.id}/submissions`
    });
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
          <Routes>
            <Route
              path="/"
              element={
                <ContributionsTable
                  contributionsWithSubmissions={contributionsWithSubmissions}
                  onViewSubmissions={onViewSubmissions}
                />
              }
            />
            <Route
              path=":contributionId/submissions"
              element={
                <SubmissionsTable
                  contributionsWithSubmissions={contributionsWithSubmissions}
                  selectedContribution={selectedContribution}
                  onGiveSubmission={onGiveSubmission}
                />
              }
            />
            <Route
              path=":contributionId/submissions/:submissionId"
              element={<SubmissionDetails />}
            />
          </Routes>
        </>
      )}
    </Container>
  );
};

export default memo(Contributions);
