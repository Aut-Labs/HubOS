export const LoadImage = (
  url: string,
  width: number = null,
  height: number = null
): Promise<HTMLImageElement> => {
  const image = new Image();
  return new Promise<HTMLImageElement>((resolve, reject) => {
    if (width) {
      image.width = width;
    }

    if (height) {
      image.height = height;
    }
    image.onerror = reject;
    image.onload = () => {
      resolve(image);
    };
    image.crossOrigin = "Anonymous";
    image.src = url;
  });
};
