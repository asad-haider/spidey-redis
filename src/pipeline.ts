import { RedisClientType, createClient } from 'redis';
import { SpideyOptions, SpideyPipeline } from 'spidey';

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
