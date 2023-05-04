import { SpideyOptions, Spidey } from 'spidey';
import { createClient, RedisClientType } from 'redis';
import { RedisPipeline } from './pipeline';

interface RedisSpideyOptions extends SpideyOptions {
  redisUrl?: string;
  urlsKey?: string;
  dataKey?: string;
  sleepDelay?: number;
}

class RedisSpidey extends Spidey {
  private client: RedisClientType;
  private urlsKey: string;
  private sleepDelay: number;

  constructor(private spideyOptions?: RedisSpideyOptions) {
    super({
      ...spideyOptions,
      // Long running spidey processes should be marked as continuous
      continuous: true,
    });

    if (!this.spideyOptions?.redisUrl) {
      throw new Error('Redis url is not defined');
    }

    this.client = createClient({
      url: this.spideyOptions?.redisUrl,
    });
    this.client.connect();
    this.urlsKey = this.spideyOptions?.urlsKey as string;
    this.sleepDelay = this.spideyOptions?.sleepDelay ?? 5000;

    if (!this.urlsKey) {
      throw new Error('Url queue is not defined');
    }
  }

  async start() {
    const concurrency = this.spideyOptions?.concurrency as number;
    while (true) {
      const batchSize = concurrency - this.scheduledRequestsCount();
      if (batchSize > 0) {
        const urls = await this.getBatch(batchSize);

        if (urls.length === 0) {
          await this.sleep(this.sleepDelay);
          continue;
        }

        for (const url of urls)
          this.request({ url: url as string }, this.parse.bind(this));
      }
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async getBatch(size: number) {
    const data: string[] = [];

    while (size) {
      const item = await this.client.lPop(this.urlsKey);
      if (!item) break;

      data.push(item);
      size--;
    }

    this.logger.debug(`Found ${data.length} items from the ${this.urlsKey}`);
    return data;
  }
}

export { RedisSpidey, RedisSpideyOptions, RedisPipeline };
