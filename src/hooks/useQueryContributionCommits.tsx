import { Hub, TaskContributionProperties } from "@aut-labs/sdk";
import {
  gql,
  QueryFunctionOptions,
  QueryResult,
  useQuery
} from "@apollo/client";
import { useEffect, useState } from "react";
import { environment } from "@api/environment";
import axios from "axios";
import { useWalletConnector } from "@aut-labs/connector";

export enum ContributionStatus {
  Pending = 1,
  Rejected = 2,
  Complete = 3
}

export const ContributionStatusMap = {
  [ContributionStatus.Pending]: "Pending",
  [ContributionStatus.Rejected]: "Rejected",
  [ContributionStatus.Complete]: "Complete"
};

export interface ContributionCommit {
  id: string;
  hub: Hub;
  data: any;
  who: string;
  status: ContributionStatus;
  points: number;
  contribution: Partial<TaskContributionProperties>;
  dataDecrypted?: boolean;
}

export interface DecryptResponseData {
  isSuccess: boolean;
  data?: string;
  error?: string;
}

const GET_CONTRIBUTION_COMMITS = gql`
  query GetContributionCommits(
    $skip: Int
    $first: Int
    $where: ContributionCommit_filter
  ) {
    contributionCommits(skip: $skip, first: $first, where: $where) {
      id
      hub
      data
      who
      status
      points
      contribution {
        id
      }
    }
  }
`;

export const decodeHashesOfCommits = async ({
  hashes,
  autSig
}): Promise<DecryptResponseData[]> => {
  return axios
    .post(`${environment.apiUrl}/task/contribution/viewByHashes`, {
      hashes,
      autSig
    })
    .then((r) => r.data);
};

const useQueryContributionCommits = (
  props: QueryFunctionOptions<any, any> = {}
) => {
  const { state } = useWalletConnector();
  const { data, loading, ...rest } = useQuery(GET_CONTRIBUTION_COMMITS, {
    fetchPolicy: "cache-and-network",
    ...props
  });

  const [commits, setCommits] = useState<ContributionCommit[]>([]);

  useEffect(() => {
    if (data?.contributionCommits && !!state?.authSig) {
      const hashes = data.contributionCommits.map(
        (commit: ContributionCommit) => commit.data
      );
      const fetch = async () => {
        try {
          const decodedCommits = await decodeHashesOfCommits({
            hashes,
            autSig: state.authSig
          });
          const commits = data.contributionCommits.map(
            (commit: ContributionCommit, i: number) => {
              const data = decodedCommits[i];
              return {
                ...commit,
                points: +commit.points,
                data: data?.data || commit.data,
                dataDecrypted: data?.isSuccess
              };
            }
          );
          setCommits(commits);
        } catch (e) {
          setCommits(data?.contributionCommits);
        }
      };
      fetch();
    }
  }, [data, state?.authSig]);

  return {
    data: commits || [],
    ...rest,
    loading: loading
  } as QueryResult<ContributionCommit[]>;
};

export default useQueryContributionCommits;
