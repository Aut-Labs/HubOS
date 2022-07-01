export interface SWIDParams {
  title: string;
  timestamp: string;
  avatar?: string;
  tokenId?: string;
  canvas?: HTMLCanvasElement;
  config?: ContentConfig;
}

export interface SWIDOutput {
  previewElement: HTMLCanvasElement;
  download: (filename?: string) => void;
  toBase64: (mimeType?: string) => string;
  toFile: (filename?: string, mimeType?: string) => Promise<File>;
}

export interface QRConfig {
  text: string;
  logo: string;
  width: number;
  height: number;
  logoSize: number;
  logoWidth: number;
  logoHeight: number;
  logoBorderWidth: number;
  top: number;
}

export interface ContentConfig {
  width: number;
  height: number;
  canvasFont: {
    name: string;
    url: string;
    fontFamily: string;
  };
  qrImage: QRConfig;
  title: {
    fontSize: string;
    fontWeight: string;
    text: string;
    top: number;
    color: string;
  };
  timestamp: {
    fontSize: string;
    fontWeight: string;
    text: string;
    top: number;
    color: string;
  };
}
