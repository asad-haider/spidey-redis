
[![npm package](https://nodei.co/npm/spidey-redis.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/spidey-redis/)

[![NPM download][download-image]][download-url]
[![Package Quality][quality-image]][quality-url]

[quality-image]: https://packagequality.com/shield/spidey-redis.svg
[quality-url]: https://packagequality.com/#?package=spidey-redis
[download-image]: https://img.shields.io/npm/dm/spidey-redis.svg?style=flat-square
[download-url]: https://npmjs.org/package/spidey-redis

# Redis Spidey - Distributed Web Scraping Solution Powered by Redis

RedisSpidey is a powerful tool that combines the capabilities of [Spidey](https://github.com/asad-haider/spidey) and Redis to enable efficient distributed crawling and web scraping. Leveraging the advanced features of Redis, RedisSpidey features a distributed architecture that supports parallel operation of multiple instances, all listening to the same queue. Additionally, RedisSpidey pushes scraped data back to Redis queues for easy distributed post-processing, enhancing the overall efficiency of the scraping process.

## Features

- Distributed Crawling: RedisSpidey enables seamless operation of multiple instances of crawlers, all listening to the same queue, for efficient distributed crawling.
- RedisPipeline: RedisSpidey provides support to push crawled data back to Redis queues for distributed post-processing

## Installation

```
npm install spidey-redis
```

## Options
| Configuration | Type | Description | Default | Required |
| --- | --- | --- | --- | --- |
| `redisUrl` | `string` | Redis url such as `redis://localhost:6379` | `null` | Yes |
| `urlsKey` | `string` | Redis input queue name such as `urls:queue` | `null` | Yes |
| `dataKey` | `string` | Redis output queue name such as `data:queue` | `null` | Yes if using RedisPipeline |
| `sleepDelay` | `number` | Wait for new items in queue if empty | `5000ms` | No |

## Usage

```typescript
import { RedisSpidey, RedisPipeline } from 'spidey-redis';

class AmazonSpidey extends RedisSpidey {
  constructor() {
    super({
      // spidey options ...
      redisUrl: 'redis://localhost:6379',

      // Input queue
      urlsKey: 'amazon:urls',

      // Output queue
      dataKey: 'amazon:data',

      // Redis pipeline to push crawled data to data queue 
      pipelines: [RedisPipeline],
    });
  }
}
```

## Conclusion

RedisSpidey is the ultimate solution for distributed web scraping and crawling, offering unparalleled performance, scalability, and flexibility. With RedisSpidey, you can easily handle large-scale web scraping tasks with ease, while taking advantage of advanced Redis and [Spidey](https://github.com/asad-haider/spidey) technology for efficient distributed crawling and post-processing of data.


## License

Spidey is licensed under the [MIT License](https://opensource.org/licenses/MIT).
