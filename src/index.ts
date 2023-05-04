import { SpideyOptions, SpideyPipeline, Spidey } from 'spidey';
import { createClient, RedisClientType } from 'redis';

export interface RedisSpideyOptions extends SpideyOptions {
  redisUrl?: string;
  urlsKey?: string;
  dataKey?: string;
  sleepDelay?: number;
}

export class RedisPipeline implements SpideyPipeline {
  client: RedisClientType;
  dataKey: string;

  constructor(private options?: SpideyOptions) {
    if (!this.options?.redisUrl) {
      throw new Error('Redis url is not defined');
    }

    this.client = createClient({
      url: this.options?.redisUrl,
    });
    this.dataKey = this.options?.dataKey as string;
  }

  async start() {
    await this.client.connect();
  }

  async complete() {
    await this.client.disconnect();
  }

  async process(data: any) {
    await this.client.lPush(this.dataKey, JSON.stringify(data));

    // Return data back for other pipelines
    return data;
  }
}

export class RedisSpidey extends Spidey {
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
