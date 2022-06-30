import { useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Container } from "@mui/material";
import { resetCreatePollState } from "@store/Activity/create-poll.reducer";
import CreatePollOptionsStep from "./CreatePollOptionsStep/CreatePollOptionsStep";
import CreatePollInfoStep from "./CreatePollInfoStep/CreatePollInfoStep";
import CreatePollParticipantsStep from "./CreatePollParticipantsStep/CreatePollParticipantsStep";
import SuccessStep from "./SuccessStep/SuccessStep";
import { setTitle } from "@store/ui-reducer";

const Polls = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    return () => {
      dispatch(resetCreatePollState());
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      setTitle(`Polls - Sublime Here`)
    );
  }, [dispatch]);

  return (
    <Container
      maxWidth="md"
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Switch>
        <Route
          exact
          path="/aut-dashboard/event-factory/polls"
          component={CreatePollInfoStep}
        />
        <Route
          path="/aut-dashboard/event-factory/polls/options"
          component={CreatePollOptionsStep}
        />
        <Route
          path="/aut-dashboard/event-factory/polls/participants"
          component={CreatePollParticipantsStep}
        />
        <Route
          path="/aut-dashboard/event-factory/polls/success"
          component={SuccessStep}
        />
      </Switch>
    </Container>
  );
};

export default Polls;
