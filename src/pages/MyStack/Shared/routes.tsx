import { PluginDefinition } from "@aut-labs-private/sdk";
import React from "react";
import { Route } from "react-router-dom";
import { SidebarMenuItem } from "@components/Sidebar/MenuItems";
import ExtensionIcon from "@mui/icons-material/Extension";
import { PluginDefinitionType } from "@aut-labs-private/sdk/dist/models/plugin";
import { ReactComponent as SubStackIcon } from "@assets/aut/sub-stack.svg";

const Quests = React.lazy(() => import("../Plugins/Onboarding/Quest/Quests"));
const CreateQuest = React.lazy(
  () => import("../Plugins/Onboarding/Quest/CreateQuest")
);
const Quest = React.lazy(() => import("../Plugins/Onboarding/Quest/Quest"));
const Plugins = React.lazy(() => import("./Plugins"));
const OpenTasks = React.lazy(() => import("../Plugins/Task/Open/OpenTasks"));
const CreateOpenTask = React.lazy(
  () => import("../Plugins/Task/Open/CreateOpenTask")
);
const CreateQuizTask = React.lazy(
  () => import("../Plugins/Task/Quiz/CreateQuizTask")
);
const QuizTasks = React.lazy(() => import("../Plugins/Task/Quiz/QuizTasks"));
const CreateJoinDiscordTask = React.lazy(
  () => import("../Plugins/Task/JoinDiscord/CreateJoinDiscordTask")
);
const JoinDiscordTasks = React.lazy(
  () => import("../Plugins/Task/JoinDiscord/JoinDiscordTasks")
);
const CreateTransactionTask = React.lazy(
  () => import("../Plugins/Task/Transaction/CreateTransactionTask")
);
const TransactionTasks = React.lazy(
  () => import("../Plugins/Task/Transaction/TransactionTasks")
);

export const pluginRoutes = (
  plugins: PluginDefinition[]
): {
  menuItems: SidebarMenuItem[];
  allRoutes: React.ReactElement[];
} => {
  const menuItems: SidebarMenuItem[] = [];
  const allRoutes: React.ReactElement[] = [];

  plugins.forEach((plugin) => {
    const stackType = plugin.metadata.properties.stack.type;
    const stack = `my-stack/${stackType}`;

    let mainMenu = menuItems.find((m) => m.route === stack);

    if (!mainMenu) {
      allRoutes.push(
        <Route
          key={stack}
          path={stack}
          element={<Plugins definition={plugin.metadata} />}
        />
      );

      if (stackType === "Onboarding") {
        mainMenu = {
          title: plugin.metadata.properties.stack.title,
          route: stack,
          icon: SubStackIcon,
          exact: true,
          children: []
        };
        menuItems.push(mainMenu);
      }
    }

    if (plugin.pluginAddress) {
      const path = `${stack}/${
        PluginDefinitionType[plugin.pluginDefinitionId]
      }`;
      if (mainMenu) {
        const childMenuItem: SidebarMenuItem = {
          icon: ExtensionIcon,
          title: plugin.metadata.properties.title,
          route: path,
          children: []
        };
        mainMenu.children.push(childMenuItem);
      }
      switch (plugin.pluginDefinitionId) {
        case PluginDefinitionType.QuestOnboardingPlugin:
          allRoutes.push(
            <Route
              key={path}
              path={path}
              element={<Quests plugin={plugin} />}
            />,
            <Route
              key={`${path}/create`}
              path={`${path}/create`}
              element={<CreateQuest plugin={plugin} />}
            />,
            <Route
              key={`${path}/:questId`}
              path={`${path}/:questId`}
              element={<Quest plugin={plugin} />}
            />
          );
          break;
        case PluginDefinitionType.OnboardingOpenTaskPlugin:
          allRoutes.push(
            <Route
              key={path}
              path={path}
              element={<OpenTasks plugin={plugin} />}
            />,
            <Route
              key={`${path}/create`}
              path={`${path}/create`}
              element={<CreateOpenTask plugin={plugin} />}
            />
          );
          break;
        case PluginDefinitionType.OnboardingTransactionTaskPlugin:
          allRoutes.push(
            <Route
              key={path}
              path={path}
              element={<TransactionTasks plugin={plugin} />}
            />,
            <Route
              key={`${path}/create`}
              path={`${path}/create`}
              element={<CreateTransactionTask plugin={plugin} />}
            />
          );
          break;
        case PluginDefinitionType.OnboardingJoinDiscordTaskPlugin:
          allRoutes.push(
            <Route
              key={path}
              path={path}
              element={<JoinDiscordTasks plugin={plugin} />}
            />,
            <Route
              key={`${path}/create`}
              path={`${path}/create`}
              element={<CreateJoinDiscordTask plugin={plugin} />}
            />
          );
          break;
        case PluginDefinitionType.OnboardingQuizTaskPlugin:
          allRoutes.push(
            <Route
              key={path}
              path={path}
              element={<QuizTasks plugin={plugin} />}
            />,
            <Route
              key={`${path}/create`}
              path={`${path}/create`}
              element={<CreateQuizTask plugin={plugin} />}
            />
          );
          break;
      }
    }
  });

  return {
    allRoutes,
    menuItems
  };
};
