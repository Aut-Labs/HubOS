// @ts-ignore
import Lottie from 'react-lottie';
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
      <Lottie options={defaultOptions} height={width} width={height} />
    </div>
  );
};

export default AutLoading;
