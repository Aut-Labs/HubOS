/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable max-len */
import { Avatar, Dialog, DialogContent, styled, Typography } from '@mui/material';
import { Communities, communityUpdateState } from '@store/Community/community.reducer';
import { pxToRem } from '@utils/text-size';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@store/store.model';
import { Community } from '@api/community.model';
import { ReactComponent as Logo } from '@assets/daut-logo.svg';
import CopyAddress from '@components/CopyAddress';

const CommunityItem = styled('div')({
  width: '100%',
  height: pxToRem(100),
  borderStyle: 'solid',
  borderWidth: '1px',
  borderTopColor: 'white',
  display: 'flex',
  alignItems: 'center',
  padding: `0 ${pxToRem(40)}`,
  cursor: 'pointer',
  margin: '0 auto',
  ':hover': {
    backgroundColor: '#6FA1C3',
  },
  '&.stat:last-child': {
    borderBottomColor: 'white',
  },
});

const CommunityItemWrapper = styled('div')({
  width: '100%',
});

const CommunitySwitcherPopup = ({ open, onClose }: any) => {
  const dispatch = useAppDispatch();
  const communities = useSelector(Communities);

  const selectCommunity = (community: Community) => {
    dispatch(
      communityUpdateState({
        community,
      })
    );
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        borderWidth: '0',
      }}
    >
      <DialogContent
        sx={{
          maxWidth: pxToRem(550),
          minWidth: pxToRem(550),
          minHeight: pxToRem(550),
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          background: '#000',
          borderStyle: 'solid',
          borderImage:
            'linear-gradient(45deg, #009fe3 0%, #0399de 8%, #0e8bd3 19%, #2072bf 30%, #3a50a4 41%, #5a2583 53%, #453f94 71%, #38519f 88%, #3458a4 100%) 1',
          borderWidth: pxToRem(15),
        }}
      >
        <Logo
          style={{
            marginBottom: pxToRem(30),
          }}
        />
        <Typography sx={{ color: 'white', fontSize: pxToRem(25), mb: pxToRem(15), textTransform: 'uppercase' }} component="div">
          Community Swicher
        </Typography>
        <Typography sx={{ color: 'white', fontSize: pxToRem(18), mb: pxToRem(30) }} component="div">
          Pick the Community you wish to work with.
        </Typography>
        <CommunityItemWrapper>
          {communities.map((community) => (
            <CommunityItem key={`community-select-item-${community.name}`} className="stat" onClick={() => selectCommunity(community)}>
              <Avatar
                variant="square"
                sx={{
                  width: pxToRem(50),
                  height: pxToRem(50),
                  border: '2px solid white',
                  backgroundColor: 'white',
                  mr: pxToRem(50),
                }}
                src={community.image as string}
              />
              <div>
                <Typography sx={{ color: 'white', fontSize: pxToRem(21), mb: '3px' }} component="div">
                  {community.name}
                </Typography>
                <CopyAddress address={community.properties.address} />
              </div>
            </CommunityItem>
          ))}
        </CommunityItemWrapper>
      </DialogContent>
    </Dialog>
  );
};

export default CommunitySwitcherPopup;
