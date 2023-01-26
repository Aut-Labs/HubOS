import { useEffect, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useAppDispatch } from "@store/store.model";
import { resetAuthState, setAuthenticated } from "@auth/auth.reducer";
import { AutID } from "@api/aut.model";
import { useSelector } from "react-redux";
import {
  NetworkWalletConnectors,
  NetworksConfig
} from "@store/WalletProvider/WalletProvider";
import { Init } from "@aut-labs/d-aut";
import { communityUpdateState } from "@store/Community/community.reducer";

function Web3DautConnect({ setLoading }) {
  const dispatch = useAppDispatch();
  const connectors = useSelector(NetworkWalletConnectors);
  const networks = useSelector(NetworksConfig);
  const location = useLocation<any>();
  const history = useHistory();
  const abort = useRef<AbortController>();

  const onAutInit = async () => {
    setLoading(false);
  };

  const onAutLogin = async ({ detail }: any) => {
    const autID = new AutID(detail);
    dispatch(
      setAuthenticated({
        isAuthenticated: true,
        userInfo: autID
      })
    );

    dispatch(
      communityUpdateState({
        communities: autID.properties.communities,
        selectedCommunityAddress:
          autID.properties.communities[0].properties.address
      })
    );
    const shouldGoToDashboard = location.pathname === "/";
    const goTo = shouldGoToDashboard ? "/aut-dashboard" : location.pathname;
    const returnUrl = location.state?.from;
    history.push(returnUrl || goTo);
  };

  // const onAutLogin = async ({ detail }: any) => {
  //   if (abort.current) {
  //     abort.current.abort();
  //   }
  //   const profile = JSON.parse(JSON.stringify(detail));

  //   const autID = new AutID(profile);
  //   autID.properties.communities = autID.properties.communities.filter((c) => {
  //     return c.properties.userData?.isActive;
  //   });
  //   autID.properties.address = profile.address;
  //   autID.properties.network = profile.network?.toLowerCase();
  //   const ethDomain = await fetchHolderEthEns(autID.properties.address);
  //   autID.properties.ethDomain = ethDomain;

  //   const params = new URLSearchParams(window.location.search);
  //   params.set("network", autID.properties.network?.toLowerCase());
  //   history.push({
  //     pathname: `/${autID.name}`,
  //     search: `?${params.toString()}`
  //   });

  //   await dispatch(
  //     setConnectedUserInfo({
  //       connectedAddress: autID.properties.address,
  //       connectedNetwork: autID.properties.network?.toLowerCase()
  //     })
  //   );
  //   await dispatch(
  //     updateHolderState({
  //       profiles: [autID],
  //       selectedProfileAddress: autID.properties.address,
  //       selectedProfileNetwork: autID.properties.network?.toLowerCase(),
  //       fetchStatus: ResultState.Success,
  //       status: ResultState.Idle
  //     })
  //   );

  //   const [connector] = connectors[profile.provider];
  //   if (connector) {
  //     const config = networks.find(
  //       (n) => n.network?.toLowerCase() === profile?.network?.toLowerCase()
  //     );
  //     await connector.activate(config.chainId);
  //     try {
  //       await EnableAndChangeNetwork(connector.provider, config);
  //       await dispatch(setNetwork(config.network));
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  // };

  const onDisconnected = () => {
    dispatch(resetAuthState());
    history.push("/");
  };

  useEffect(() => {
    window.addEventListener("aut-Init", onAutInit);
    window.addEventListener("aut-onConnected", onAutLogin);
    window.addEventListener("aut-onDisconnected", onDisconnected);

    Init();

    return () => {
      window.removeEventListener("aut-Init", onAutInit);
      window.removeEventListener("aut-onConnected", onAutLogin);
      window.removeEventListener("aut-onDisconnected", onAutLogin);
      if (abort.current) {
        abort.current.abort();
      }
    };
  }, []);

  return (
    <d-aut
      style={{
        width: "220px",
        height: "50px",
        display: "none",
        position: "absolute",
        zIndex: 99999
      }}
      id="d-aut"
      dao-expander="0x1d9258482896F8671d01Fa5b44d953693d801174"
      button-type="simple"
    />
  );
}

export default Web3DautConnect;
