import { useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Container } from "@mui/material";
import { resetActivityGroupCall } from "@store/Activity/group-call.reducer";
import CalendarStep from "./CalendarStep/CalendarStep";
import CallInformationStep from "./CallInformationStep/CallInformationStep";
import SuccessStep from "./SuccessStep/SuccessStep";

const GroupCall = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    return () => {
      dispatch(resetActivityGroupCall());
    };
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
          path="/aut-dashboard/event-factory/group-call"
          component={CalendarStep}
        />
        <Route
          path="/aut-dashboard/event-factory/group-call/info"
          component={CallInformationStep}
        />
        <Route
          path="/aut-dashboard/event-factory/group-call/success"
          component={SuccessStep}
        />
      </Switch>
    </Container>
  );
};

export default GroupCall;
