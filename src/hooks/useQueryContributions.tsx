import AutSDK, {
  BaseNFTModel,
  fetchMetadata,
  Hub,
  TaskContributionNFT,
  TaskFactoryContract
} from "@aut-labs/sdk";
import {
  gql,
  QueryFunctionOptions,
  QueryResult,
  useQuery
} from "@apollo/client";
import { useEffect, useState } from "react";
import { environment } from "@api/environment";
import { useSelector } from "react-redux";
import { HubData, TaskTypes } from "@store/Hub/hub.reducer";
import { TaskType } from "@api/models/task-type";
import { ContributionFactory } from "@api/contribution.model";

const GET_HUB_CONTRIBUTIONS = gql`
  query GetContributions($skip: Int, $first: Int, $where: Contribution_filter) {
    contributions(skip: $skip, first: $first, where: $where) {
      id
      taskId
      role
      startDate
      endDate
      points
      quantity
      descriptionId
    }
  }
`;

const contributionsMetadata = (
  contributions: any[],
  taskFactory: TaskFactoryContract,
  taskTypes: TaskType[]
) => {
  return contributions.map(async (contribution) => {
    const { uri } = await taskFactory.functions.getDescriptionById(
      contribution?.descriptionId
    );
    let metadata = await fetchMetadata<BaseNFTModel<any>>(
      uri,
      environment.ipfsGatewayUrl
    );
    metadata = metadata || ({ properties: {} } as BaseNFTModel<any>);
    return ContributionFactory(metadata, contribution, taskTypes);
  });
};

const useQueryContributions = (props: QueryFunctionOptions<any, any> = {}) => {
  const hubData = useSelector(HubData);
  const taskTypes = useSelector(TaskTypes);
  const { data, loading, ...rest } = useQuery(GET_HUB_CONTRIBUTIONS, {
    skip: !hubData?.properties?.address || !taskTypes.length,
    fetchPolicy: "cache-and-network",
    variables: {
      ...props.variables,
      where: {
        hubAddress: hubData.properties.address,
        ...(props.variables?.where || {})
      }
    },
    // ...props
  });

  const [contributions, setContributions] = useState<TaskContributionNFT[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(true);

  useEffect(() => {
    if (hubData?.properties?.address && data?.contributions?.length && taskTypes.length) {
      const fetch = async () => {
        const sdk = await AutSDK.getInstance();
        const hubService: Hub = sdk.initService<Hub>(
          Hub,
          hubData.properties.address
        );
        const taskFactory = await hubService.getTaskFactory();
        setLoadingMetadata(true);
        const contributions = await Promise.all(
          contributionsMetadata(data?.contributions, taskFactory, taskTypes)
        );
        setLoadingMetadata(false);
        setContributions(contributions);
      };
      fetch();
    }
  }, [hubData?.properties?.address, data, taskTypes]);

  return {
    data: contributions || [],
    ...rest,
    loading: loading || loadingMetadata
  } as QueryResult<TaskContributionNFT[]>;
};

export default useQueryContributions;
