
import { Avatar, styled, Typography } from "@mui/material";
import {
  Hubs,
  hubUpdateState
} from "@store/Hub/hub.reducer";
import { pxToRem } from "@utils/text-size";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@store/store.model";
import CopyAddress from "@components/CopyAddress";
import { ipfsCIDToHttpUrl } from "@api/storage.api";
import DialogWrapper from "./DialogWrapper";
import { HubOSHub } from "@api/hub.model";

const HubItem = styled("div")({
  width: "100%",
  borderStyle: "solid",
  borderWidth: "1px",
  borderTopColor: "white",
  display: "flex",
  alignItems: "center",
  padding: `0 ${pxToRem(40)}`,
  cursor: "pointer",
  margin: "0 auto",
  ":hover": {
    backgroundColor: "#6FA1C3"
  },
  "&.stat:last-child": {
    borderBottomColor: "white"
  }
});

const HubItemWrapper = styled("div")({
  width: "100%",
  flex: 1,
  marginTop: "20px"
});

const HubSwitcherPopup = ({ open, onClose }: any) => {
  const dispatch = useAppDispatch();
  const hubs = useSelector(Hubs);

  const selectHub = (hub: HubOSHub) => {
    dispatch(
      hubUpdateState({
        selectedHubAddress: hub.properties.address
      })
    );
    onClose();
  };

  return (
    <DialogWrapper open={open} onClose={onClose}>
      <div
        className="sw-join-dialog-content"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1
        }}
      >
        <Typography color="white" variant="subtitle1">
          Hub Swicher
        </Typography>
        <Typography color="white" mb="4" variant="body">
          Pick the Hub you wish to work with.
        </Typography>
        <HubItemWrapper
          sx={{
            height: {
              md: "60px"
            }
          }}
        >
          {hubs.map((hub) => (
            <HubItem
              key={`hub-select-item-${hub.name}`}
              className="stat"
              onClick={() => selectHub(hub)}
            >
              <Avatar
                variant="square"
                sx={{
                  width: pxToRem(50),
                  height: pxToRem(50),
                  border: "2px solid white",
                  backgroundColor: "white",
                  mr: pxToRem(50)
                }}
                src={ipfsCIDToHttpUrl(hub.image as string)}
              />
              <div>
                <Typography
                  sx={{ color: "white", fontSize: pxToRem(21), mb: "3px" }}
                  component="div"
                >
                  {hub.name}
                </Typography>
                <CopyAddress
                  address={hub.properties.address}
                  variant="body1"
                />
              </div>
            </HubItem>
          ))}
        </HubItemWrapper>
      </div>
    </DialogWrapper>
  );
};

export default HubSwitcherPopup;
