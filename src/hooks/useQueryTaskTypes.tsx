import { BaseNFTModel, fetchMetadata } from "@aut-labs/sdk";
import {
  gql,
  QueryFunctionOptions,
  QueryResult,
  useQuery
} from "@apollo/client";
import { useEffect, useState } from "react";
import { environment } from "@api/environment";
import { TaskType } from "@api/models/task-type";
import { useDispatch } from "react-redux";
import { hubUpdateState } from "@store/Hub/hub.reducer";

const GET_TASK_TYPES = gql`
  query GetTaskTypes($skip: Int, $first: Int, $where: HubAdmin_filter) {
    tasks(skip: $skip, first: $first, where: $where) {
      id
      metadataUri
      taskId
      creator
    }
  }
`;

const fetchTaskTypesMetadata = (taskTypes: TaskType[]) => {
  return taskTypes.map(
    async ({ id, metadataUri, taskId, creator }) => {
      let metadata = await fetchMetadata<BaseNFTModel<any>>(
        metadataUri,
        environment.ipfsGatewayUrl
      );
      metadata = metadata || ({ properties: {} } as BaseNFTModel<any>);
      return {
        id,
        metadataUri,
        taskId,
        creator,
        metadata
      };
    }
  );
};

const useQueryTaskTypes = (props: QueryFunctionOptions<any, any> = {}) => {
  const dispatch = useDispatch();
  const { data, loading, ...rest } = useQuery(GET_TASK_TYPES, {
    fetchPolicy: "cache-and-network",
    ...props
  });

  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  useEffect(() => {
    if (data?.tasks?.length) {
      const fetch = async () => {
        setLoadingMetadata(true);
        const taskTypes = await Promise.all([...fetchTaskTypesMetadata(data?.tasks)]);
        dispatch(hubUpdateState({ taskTypes }));
        setLoadingMetadata(false);
        setTaskTypes(taskTypes);
      };
      fetch();
    }
  }, [data]);

  return {
    data: taskTypes || [],
    ...rest,
    loading: loadingMetadata || loading
  } as QueryResult<TaskType[]>;
};

export default useQueryTaskTypes;
