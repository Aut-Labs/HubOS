import AutSDK, {
  BaseNFTModel,
  fetchMetadata,
  Hub,
  TaskContribution,
  TaskContributionNFT
} from "@aut-labs/sdk";
import { QueryFunctionOptions, QueryResult } from "@apollo/client";
import { useEffect, useState } from "react";
import { environment } from "@api/environment";
import { useSelector } from "react-redux";
import { HubData } from "@store/Hub/hub.reducer";
import { HubOSHub } from "@api/hub.model";

const fetchOnChainContributions = async (
  hubData: HubOSHub
): Promise<TaskContributionNFT[]> => {
  const sdk = await AutSDK.getInstance();
  const hubService: Hub = sdk.initService<Hub>(Hub, hubData.properties.address);
  const taskFactory = await hubService.getTaskFactory();
  const ids = (await taskFactory.functions.contributionIds()) as string[];

  const contributions = await Promise.all(
    ids.map(async (id) => {
      const _contribution = await taskFactory.functions.getContributionById(id);
      const contribution = TaskContribution.mapFromTuple(_contribution as any);
      const { uri } = await taskFactory.functions.getDescriptionById(
        contribution.descriptionId
      );
      const metadata = await fetchMetadata<BaseNFTModel<any>>(
        uri,
        environment.ipfsGatewayUrl
      );
      return {
        ...metadata,
        properties: {
          ...metadata.properties,
          ...contribution
        }
      };
    })
  );
  return contributions;
};

const useQueryContributions = (props: QueryFunctionOptions<any, any> = {}) => {
  const [contributions, setContributions] = useState<TaskContributionNFT[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const hubData = useSelector(HubData);

  useEffect(() => {
    if (hubData) {
      const fetch = async () => {
        setLoadingMetadata(true);
        const contributions = await fetchOnChainContributions(hubData);
        setLoadingMetadata(false);
        setContributions(contributions);
      };
      fetch();
    }
  }, [hubData]);

  return {
    data: contributions || [],
    loading: loadingMetadata
  } as QueryResult<TaskContributionNFT[]>;
};

export default useQueryContributions;
