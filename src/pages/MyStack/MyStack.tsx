import {
  useAddPluginToDAOMutation,
  useGetAllPluginDefinitionsByDAOQuery
} from "@api/plugin-registry.api";
import { Typography } from "@mui/material";
import { CommunityData } from "@store/Community/community.reducer";
import { memo } from "react";
import { useSelector } from "react-redux";

const MyStack = () => {
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

  console.log(plugins, "data");
  const [addPlugin, { error: addPluginError, data: addPluginData }] =
    useAddPluginToDAOMutation();
  return (
    <>
      <Typography variant="h2" color="white">
        My Stack
      </Typography>
      {plugins?.map((p) => (
        <div
          onClick={() => {
            addPlugin({
              ...p,
              daoAddress: community?.properties?.address
            });
          }}
        >
          {p.metadata.properties.title}
        </div>
      ))}
    </>
  );
};

export default memo(MyStack);
