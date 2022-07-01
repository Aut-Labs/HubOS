import QRCode from 'easyqrcodejs';
import { QRConfig } from './Badge.model';
import { DrawScaledImage } from './DrawScaledImage';
import { LoadImage } from './ImageLoader';

export const GenerateQRCodeImage = async ({
  text,
  logo,
  width,
  height,
  logoSize,
  logoWidth,
  logoHeight,
  logoBorderWidth,
}: QRConfig): Promise<string> => {
  const wrapper = document.createElement('div');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const LOGO_SIZE = logoSize;

  canvas.width = LOGO_SIZE;
  canvas.height = LOGO_SIZE;

  const image = await LoadImage(logo);

  DrawScaledImage(ctx, image, 0, 0, LOGO_SIZE, LOGO_SIZE, 0, 0);

  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.arc(
    LOGO_SIZE / 2, // x
    LOGO_SIZE / 2, // y
    LOGO_SIZE / 2, // radius
    0, // start angle
    2 * Math.PI // end angle
  );
  ctx.fill();

  ctx.globalCompositeOperation = 'source-over';

  const STROKE_OFFSET = logoBorderWidth / 2;
  ctx.lineWidth = logoBorderWidth;
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.arc(
    LOGO_SIZE / 2, // x
    LOGO_SIZE / 2, // y
    LOGO_SIZE / 2 - STROKE_OFFSET, // radius
    LOGO_SIZE / 2, // start angle
    0, // end angle
    true
  );
  ctx.stroke();

  return new Promise((resolve) => {
    const qrcode: any = new QRCode(wrapper, {
      width,
      height,
      crossOrigin: 'anonymous',
      text,
      correctLevel: QRCode.CorrectLevel.H,
      format: 'JPG',
      quality: 1,
      autoColor: true,
      logoWidth,
      logoHeight,
      logo: canvas.toDataURL('image/png', 1.0),
      logoBackgroundColor: 'transparent',
      logoBackgroundTransparent: false,
      onRenderingEnd: (data: any, base64: string) => resolve(base64),
    });
  });
};
