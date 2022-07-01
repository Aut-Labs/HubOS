import SwGrid from '@components/SwGrid';
import { CircularProgress } from '@mui/material';
import { CommunityStatus, SelectedMember } from '@store/Community/community.reducer';
import { ResultState } from '@store/result-status';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import LeftProfile from './Left';
import RightProfile from './Right';

const UserProfile = () => {
  const params = useParams<{ memberAddress: string }>();
  const status = useSelector(CommunityStatus);
  const member = useSelector(SelectedMember(params.memberAddress));

  return (
    <>
      {status === ResultState.Loading ? (
        <div className="sw-loading-spinner">
          <CircularProgress
            sx={{
              justifyContent: 'center',
              alignContent: 'center',
            }}
          />
        </div>
      ) : (
        <SwGrid
          left={
            <>
              <div
                className="sw-user-info"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <LeftProfile member={member} />
              </div>
            </>
          }
          right={
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <RightProfile member={member} />
            </div>
          }
        />
      )}
    </>
  );
};

export default UserProfile;
