/* eslint-disable max-len */
import { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@store/store.model';
import { CommunityData } from '@store/Community/community.reducer';
import AutShare from '@components/Share';
import { getPAUrl } from '@api/community.api';

const AutCommunityShare = (props) => {
  const dispatch = useAppDispatch();
  const community = useSelector(CommunityData);
  const { paUrl } = useSelector((state: RootState) => state.partner);

  const [openShare, setOpenShare] = useState(true);

  const handleShareClose = () => {
    setOpenShare(false);
  };

  useEffect(() => {
    const promise = dispatch(getPAUrl(null));
    return () => promise.abort();
  }, [dispatch]);

  const shareMessage = `Hey there! We've just deployed ${community?.name} on Aut - choose your Role in our Community, pick your Skills, and let's build something great together!`;

  return (
    <>
      <AutShare
        mode="light"
        url={paUrl || 'https://Aut.id/'}
        title="with friends"
        sx={{
          '.MuiTypography-h2': {
            mt: 0,
          },
        }}
        twitterProps={{
          title: shareMessage,
          hashtags: ['Aut', 'DAO', 'Blockchain'],
        }}
        linkedinProps={{
          title: shareMessage,
          summary: 'Do more with DAO',
          source: paUrl || 'https://Aut.id/',
        }}
        telegramProps={{
          title: shareMessage,
        }}
        open={openShare}
        onClose={handleShareClose}
      />
    </>
  );
};

export default memo(AutCommunityShare);
