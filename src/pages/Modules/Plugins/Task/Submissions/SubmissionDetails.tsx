import {
  ContributionType,
  SelectedContribution,
  SelectedSubmission
} from "@store/Contributions/contributions.reducer";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import OpenTaskView from "./OpenTaskView";
import { Container } from "@mui/material";
import ContributionDetails from "../Contributions/ContributionDetails";
import QuizTaskView from "./QuizTaskView";
import RetweetTaskView from "./RetweetTaskView";

const SubmissionDetails = () => {
  const submission = useSelector(SelectedSubmission);
  const contribution = useSelector(SelectedContribution);
  const contributionType = useSelector(ContributionType);
  const submissionTemplate = useMemo(() => {
    if (!submission) return null;
    if (contributionType === "Open Task") {
      return (
        <OpenTaskView contribution={contribution} submission={submission} />
      );
    } else if (contributionType === "Quiz") {
      return (
        <QuizTaskView contribution={contribution} submission={submission} />
      );
    } else if (contributionType === "Retweet") {
      return (
        <RetweetTaskView contribution={contribution} submission={submission} />
      );
    } else {
      return null;
    }
  }, [submission]);

  return (
    <>
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          height: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative"
        }}
      >
        {contribution && <ContributionDetails contribution={contribution} />}
        {submissionTemplate}
      </Container>
    </>
  );
};

export default SubmissionDetails;
