import { PluginDefinition } from "@aut-labs/sdk";
import React, { lazy } from "react";
import { Route } from "react-router-dom";
import GatheringInitialStep from "./Gatherings/GatheringIntialStep";

export const botActionRoutes = () => {
  return {
    allRoutes: [
      <Route path="bot/gathering" element={<GatheringInitialStep />} />
    ]
  };
};
