import { AutIDNFT, fetchMetadata } from "@aut-labs/sdk";
import {
  gql,
  QueryFunctionOptions,
  QueryResult,
  useQuery
} from "@apollo/client";
import { useEffect, useState } from "react";
import { environment } from "@api/environment";
import { HubOSAutID } from "@api/aut.model";

const GET_HUB_ADMINS = gql`
  query GetHubAdmins($skip: Int, $first: Int, $where: HubAdmin_filter) {
    hubAdmins(skip: $skip, first: $first, where: $where) {
      id
      hubAddress
      autID {
        username
        metadataUri
      }
    }
  }
`;

const fetchAutIDsMetadata = (admins: any[]) => {
  return admins.map(
    async ({ id, autID: { metadataUri } }) => {
      let metadata = await fetchMetadata<AutIDNFT>(
        metadataUri,
        environment.ipfsGatewayUrl
      );
      metadata = metadata || ({ properties: {} } as AutIDNFT);
      return new HubOSAutID({
        ...metadata,
        properties: {
          ...metadata.properties,
          address: id,
          hubs: [],
          joinedHubs: [],
          ethDomain: null,
          network: null
        }
      } as HubOSAutID);
    }
  );
};

const useQueryHubAdmins = (props: QueryFunctionOptions<any, any> = {}) => {
  const { data, loading, ...rest } = useQuery(GET_HUB_ADMINS, {
    fetchPolicy: "cache-and-network",
    ...props
  });

  const [autIDs, setAutIDs] = useState<HubOSAutID[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  useEffect(() => {
    if (data?.hubAdmins?.length) {
      const fetch = async () => {
        setLoadingMetadata(true);
        const autIds = await Promise.all([...fetchAutIDsMetadata(data?.hubAdmins)]);
        setLoadingMetadata(false);
        setAutIDs(autIds);
      };
      fetch();
    }
  }, [data]);

  return {
    data: autIDs || [],
    ...rest,
    loading: loadingMetadata || loading
  } as QueryResult<HubOSAutID[]>;
};

export default useQueryHubAdmins;
