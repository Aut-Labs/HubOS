import {
  BaseNFTModel,
  fetchMetadata,
  TaskContributionNFT
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
      uri
    }
  }
`;

const contributionsMetadata = (contributions: any[], taskTypes: TaskType[]) => {
  return contributions.map(async (contribution) => {
    let metadata = await fetchMetadata<BaseNFTModel<any>>(
      contribution.uri,
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
    }
    // ...props
  });

  const [contributions, setContributions] = useState<TaskContributionNFT[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  useEffect(() => {
    if (
      hubData?.properties?.address &&
      data?.contributions?.length &&
      taskTypes.length
    ) {
      setLoadingMetadata(true);
      const fetch = async () => {
        setLoadingMetadata(true);
        const contributions = await Promise.all(
          contributionsMetadata(data?.contributions, taskTypes)
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
