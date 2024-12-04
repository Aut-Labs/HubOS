import { BaseQueryApi, createApi } from "@reduxjs/toolkit/query/react";

export const verifyENS = async (address: any, api: BaseQueryApi) => {
  try {
    return {
      data: "name"
    };
  } catch (error) {
    return {
      error: error?.shortMessage || error?.message || error
    };
  }
};

export const socialsApi = createApi({
  reducerPath: "socialsApi",
  baseQuery: async (args, api, extraOptions) => {
    const { url, body } = args;
    if (url === "verifyENS") {
      return verifyENS(body, api);
    }
  },
  tagTypes: [],
  endpoints: (builder) => ({
    verifyENS: builder.mutation<boolean, string>({
      // @ts-ignore
      query: (body) => ({
        body,
        url: "verifyENS"
      })
    })
  })
});

export const { useVerifyENSMutation } = socialsApi;
