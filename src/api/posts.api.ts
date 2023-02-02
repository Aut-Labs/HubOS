import AutSDK from "@aut-labs-private/sdk";
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery
} from "@reduxjs/toolkit/query/react";

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  function sleeper(ms) {
    return function (x) {
      return new Promise((resolve) => setTimeout(() => resolve(x), ms));
    };
  }

  console.log(args, "args");
  return sleeper(2000)({
    data: "Test"
  }) as any;
};

export const postApi = createApi({
  reducerPath: "postApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getPostsByName: builder.query({
      query: (sdk: AutSDK) => {
        return {
          body: {},
          url: "isMember"
        } as FetchArgs;
      }
    })
  })
});

export const { useGetPostsByNameQuery } = postApi;
