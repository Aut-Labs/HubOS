// @ts-ignore
import { Player } from '@lottiefiles/react-lottie-player';
import * as animationData from '@assets/aut-load.json';

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
};

const AutLoading = ({ width = 300, height = 300 }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%)`,
      }}
    >
      <Player
        loop
        autoplay
        rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
        src={animationData}
        style={{ height: '300px', width: '300px' }}
      />
    </div>
  );
};

export default AutLoading;
