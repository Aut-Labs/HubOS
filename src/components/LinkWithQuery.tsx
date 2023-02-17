import { RefAttributes, forwardRef, memo, useEffect } from "react";
import {
  Link,
  URLSearchParamsInit,
  useLocation,
  useSearchParams
} from "react-router-dom";

interface LinkWithQueryParams {
  children: React.ReactNode;
  to: string;
  innerRef?: any;
  preserveParams?: boolean;
  queryParams?: URLSearchParamsInit;
}

const CustomLink = ({
  children,
  to,
  queryParams,
  preserveParams,
  innerRef,
  ...props
}: LinkWithQueryParams) => {
  const [searchParams] = useSearchParams(queryParams);

  console.log("searchParams: ", searchParams.toString());
  return (
    <Link
      ref={innerRef}
      to={{
        pathname: to,
        search: preserveParams
          ? searchParams.toString()
          : new URLSearchParams(queryParams as URLSearchParams).toString()
      }}
      {...props}
    >
      {children}
    </Link>
  );
};

const LinkWithQuery = forwardRef((props: LinkWithQueryParams, ref) => (
  <CustomLink innerRef={ref} {...props} />
));

export default memo(LinkWithQuery);
