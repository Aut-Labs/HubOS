import {
  useAddPluginToDAOMutation,
  useGetAllPluginDefinitionsByDAOQuery
} from "@api/plugin-registry.api";
import { Typography } from "@mui/material";
import { CommunityData } from "@store/Community/community.reducer";
import { memo } from "react";
import { useSelector } from "react-redux";

const Onboarding = () => {
  const community = useSelector(CommunityData);
  const {
    data: plugins,
    error: pluginError,
    isLoading,
    isFetching
  } = useGetAllPluginDefinitionsByDAOQuery(null, {
    // pollingInterval: 4000,
    refetchOnMountOrArgChange: false,
    skip: false
  });
  const [addPlugin, { error: addPluginError, data: addPluginData }] =
    useAddPluginToDAOMutation();
  return (
    <>
      <Typography variant="h2" color="white">
        Onboarding
      </Typography>
      {plugins?.map((p, index) => (
        <div
          key={index}
          onClick={() => {
            addPlugin({
              ...p,
              daoAddress: community?.properties?.address
            });
          }}
        >
          {p.metadata.name}
        </div>
      ))}
    </>
  );
};

export default memo(Onboarding);
