import Redis from "ioredis";

class RedisConnection {
  private client: Redis;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

    this.client.on("error", (error) => {
      console.error("Redis 연결 에러:", error);
    });

    this.client.on("connect", () => {
      console.log("Connected to Redis");
    });
  }

  public async set(key: string, value: string): Promise<"OK"> {
    return this.client.set(key, value);
  }

  public async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  public async close(): Promise<void> {
    await this.client.quit();
  }
}

export default new RedisConnection();
