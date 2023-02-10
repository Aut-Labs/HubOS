import { PluginDefinition } from "@aut-labs-private/sdk";
import React from "react";
import { Route } from "react-router-dom";
import { SidebarMenuItem } from "@components/Sidebar/MenuItems";
import ExtensionIcon from "@mui/icons-material/Extension";

const Quests = React.lazy(() => import("./Quest/Quests"));
const CreateQuest = React.lazy(() => import("./Quest/CreateQuest"));
const Quest = React.lazy(() => import("./Quest/Quest"));
const Onboarding = React.lazy(() => import("../Onboarding"));

const Tasks = React.lazy(() => import("./Tasks/Tasks"));

export const onboardingRoutes = (
  plugin: PluginDefinition
): {
  menuItem: SidebarMenuItem;
  routes: any[];
} => {
  const stack = plugin.metadata.properties.stack.type;
  const path = `my-stack/${stack}/${plugin.metadata.properties.type}`;
  const menuItem = {
    icon: ExtensionIcon,
    title: plugin.metadata.properties.title,
    route: path
  };
  const routes = [
    <Route
      key={`my-stack/${stack}`}
      path={`my-stack/${stack}`}
      element={<Onboarding />}
    />
  ];
  if (plugin.metadata.properties.type === "QuestOnboardingPlugin") {
    routes.push(
      <Route key={path} path={path} element={<Quests plugin={plugin} />} />,
      <Route
        key={`${path}/:questId`}
        path={`${path}/:questId`}
        element={<Quest plugin={plugin} />}
      />,
      <Route
        key={`${path}/new/create`}
        path={`${path}/new/create`}
        element={<CreateQuest plugin={plugin} />}
      />
    );
  } else if (plugin.metadata.properties.type === "OnboardingOpenTaskPlugin") {
    routes.push(
      <Route key={path} path={path} element={<Tasks plugin={plugin} />} />
    );
  }

  return {
    menuItem,
    routes
  };
};
