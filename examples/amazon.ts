import { SpideyOptions, SpideyPipeline, SpideyResponse } from 'spidey';
import { RedisPipeline, RedisSpidey } from '../dist/index';

export class ASINPipeline implements SpideyPipeline {
  constructor(private options?: SpideyOptions) {}

  process(data: any) {
    data.url = data.url.split('/ref').shift() as string;
    data.asin = data.url.split('/').pop() as string;

    // always return data to process from next pipelines
    return data;
  }
}

class AmazonSpidey extends RedisSpidey {
  constructor() {
    super({
      concurrency: 50,
      retries: 5,
      logLevel: 'debug',
      pipelines: [ASINPipeline, RedisPipeline],
      redisUrl: 'redis://localhost:6379',
      urlsKey: 'amazon:urls',
      dataKey: 'amazon:data',
    });
  }

  headers = {
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
  };

  parse(response: SpideyResponse) {
    const url = response.url;
    const title = response
      .xpath('//*[@id="productTitle"]/text()')[0]
      .data.trim();
    this.save({ url, title });
  }
}

new AmazonSpidey().start();
