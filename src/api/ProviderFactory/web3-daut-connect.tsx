import { useEffect, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useAppDispatch } from "@store/store.model";
import { resetAuthState, setAuthenticated } from "@auth/auth.reducer";
import { AutID } from "@api/aut.model";
import { Init } from "@aut-labs/d-aut";
import { communityUpdateState } from "@store/Community/community.reducer";
import { useEthers } from "@usedapp/core";

function Web3DautConnect({ setLoading }) {
  const dispatch = useAppDispatch();
  const location = useLocation<any>();
  const history = useHistory();
  const abort = useRef<AbortController>();
  const { activateBrowserWallet } = useEthers();

  const onAutInit = async () => {
    setLoading(false);
  };

  const onAutLogin = async ({ detail }: any) => {
    const profile = JSON.parse(JSON.stringify(detail));
    const autID = new AutID(profile);
    autID.properties.communities = autID.properties.communities.filter((c) => {
      return c.properties.userData?.isActive;
    });
    autID.properties.address = profile.address;
    autID.properties.network = profile.network?.toLowerCase();

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
    activateBrowserWallet({ type: profile.provider });
    const shouldGoToDashboard = location.pathname === "/";
    const goTo = shouldGoToDashboard ? "/aut-dashboard" : location.pathname;
    const returnUrl = location.state?.from;
    history.push(returnUrl || goTo);
  };

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
