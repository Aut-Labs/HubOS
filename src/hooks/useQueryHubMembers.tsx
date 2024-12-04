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
import { AutIdJoinedHubState } from "@aut-labs/d-aut";

const GET_HUB_MEMBERS = gql`
  query GeAutIDs($skip: Int, $first: Int, $where: AutID_filter) {
    autIDs(skip: $skip, first: $first, where: $where) {
      id
      owner
      tokenID
      username
      metadataUri
      joinedHubs {
        id
        role
        commitment
        hubAddress
      }
    }
  }
`;

const useQueryHubMembers = (props: QueryFunctionOptions<any, any> = {}) => {
  const { data, loading, ...rest } = useQuery(GET_HUB_MEMBERS, {
    fetchPolicy: "cache-and-network",
    ...props
  });

  const [autIDs, setAutIDs] = useState<HubOSAutID[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  useEffect(() => {
    if (data?.autIDs?.length) {
      const fetchAutIDsMetadata = () => {
        return data.autIDs.map(async ({ id, metadataUri, joinedHubs }) => {
          let metadata = await fetchMetadata<AutIDNFT>(
            metadataUri,
            environment.ipfsGatewayUrl
          );
          metadata = metadata || ({ properties: {} } as AutIDNFT);

          joinedHubs = [...joinedHubs].map((hub: AutIdJoinedHubState) => ({
            id: hub.id,
            role: hub.role,
            commitment: hub.commitment,
            hubAddress: hub.hubAddress.toLowerCase(),
            isAdmin: false
          }));
          return new HubOSAutID({
            ...metadata,
            properties: {
              ...metadata.properties,
              address: id,
              hubs: [],
              joinedHubs,
              ethDomain: null,
              network: null
            }
          } as HubOSAutID);
        });
      };
      const fetch = async () => {
        setLoadingMetadata(true);
        const autIds = await Promise.all([...fetchAutIDsMetadata()]);
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

export default useQueryHubMembers;
