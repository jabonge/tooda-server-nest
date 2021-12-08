import ogs, {
  OpenGraphImage,
  Options,
  SuccessResult,
} from 'open-graph-scraper';

export function findHashTags(str: string): string[] {
  const hashTagRegex = /\#([a-zA-Z가-힣]{2,})/g;
  const matches = [];
  let match;
  while ((match = hashTagRegex.exec(str))) {
    matches.push((match[0] as string).substr(1));
  }
  return Array.from(new Set(matches));
}

export async function getOgTags(link: string) {
  const options: Options = {
    url: link,
    onlyGetOpenGraphInfo: true,
    ogImageFallback: false,
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
    },
  };
  try {
    const ogTag = await ogs(options);
    if (ogTag.error) {
      return null;
    }
    const result = (ogTag as SuccessResult).result;
    console.log(result);
    let ogImage: string;
    if (typeof result.ogImage === 'string') {
      ogImage = result.ogImage;
    } else if (typeof result.ogImage === 'object') {
      ogImage = (result.ogImage as OpenGraphImage).url;
    } else if (Array.isArray(result.ogImage)) {
      ogImage = (result.ogImage as OpenGraphImage[])[0].url;
    }
    return {
      ogSiteName: result.ogSiteName,
      ogImage: ogImage,
      ogTitle: result.ogTitle,
      ogDescription: result.ogDescription,
      ogUrl: result.ogUrl ?? link,
    };
  } catch (e) {
    return null;
  }
}

export function getEnvFilePath() {
  const env = process.env.NODE_ENV;
  if (env === 'production') {
    return '.env.production';
  } else {
    return '.env.dev';
  }
}

export interface ogMeta {
  ogSiteName?: string;
  ogImage?: string;
  ogTitle: string;
  ogDescription?: string;
  ogUrl: string;
}
