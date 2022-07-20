import axios from 'axios';
import { NFTStorage } from 'nft.storage';
import { environment } from './environment';

const client = new NFTStorage({ token: environment.nftStorageKey });

export const isValidUrl = (uri: string) => {
  let url = null;
  try {
    url = new URL(uri);
  } catch (_) {
    return false;
  }
  return url.protocol === 'ipfs:' || url.protocol === 'http:' || url.protocol === 'https:';
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

export function ipfsCIDToHttpUrl(url: string, isJson = false) {
  if (!url) {
    return url;
  }
  if (!url.includes('https://'))
    return isJson
      ? `${environment.nftStorageUrl}/${replaceAll(url, 'ipfs://', '')}/metadata.json`
      : `${environment.nftStorageUrl}/${replaceAll(url, 'ipfs://', '')}`;
  return url;
}

export function httpUrlToIpfsCID(url: string) {
  if (!url) {
    return url;
  }
  if (url.includes('https://')) {
    const notHttpsUrl = `${replaceAll(url, 'https://', '')}`;
    const [_, __, cid, name] = notHttpsUrl.split('/');
    if (name) {
      return `ipfs://${cid}/${name}`;
    }
    return `ipfs://${cid}`;
  }
  return url;
}

export const storeImageAsBlob = async (file: File): Promise<string> => {
  const cid = await client.storeBlob(file);
  return `ipfs://${cid}`;
};

export const storeAsBlob = async (json: any): Promise<string> => {
  const encodedJson = new TextEncoder().encode(JSON.stringify(json));
  const blob = new Blob([encodedJson], {
    type: 'application/json;charset=utf-8',
  });
  const file = new File([blob], 'metadata.json');
  const cid = await client.storeBlob(file);
  return `ipfs://${cid}`;
};

const storeAsJson = async (json: any): Promise<string> => {
  const metadata = await client.store(json as any);
  return metadata.ipnft;
};

export async function storeMetadata(json: any, convertImageBlobToFile: (blob: Blob) => File = null) {
  if (convertImageBlobToFile && isValidUrl(json.image)) {
    const result = await axios.get(json.image, {
      responseType: 'blob',
    });
    json.image = convertImageBlobToFile(result.data);
  }

  if (isValidUrl(json.image)) {
    return storeAsBlob(json);
  }
  return storeAsJson(json);
}
