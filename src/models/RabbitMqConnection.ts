import amqp, { Channel, Connection, ConsumeMessage } from "amqplib";

class RabbitMqConnection {
  private connection: Connection | null;
  private channel: Channel | null;

  constructor() {
    this.connection = null;
    this.channel = null;
  }

  public connect = async () => {
    if (this.connection) {
      return;
    }

    try {
      this.connection = await amqp.connect(
        process.env.RABBITMQ_URL || "amqp://localhost"
      );
      this.channel = await this.connection.createChannel();

      this.connection.on("error", (error: Error) => {
        console.error("RabbitMQ 연결 에러", error);
        setTimeout(() => this.connect(), 5000);
      });

      this.connection.on("close", () => {
        console.log("RabbitMQ 연결이 닫혔습니다. 재연결 시도 중...");
        setTimeout(() => this.connect(), 5000);
      });

      console.log("Connected to RabbitMQ");
    } catch (error) {
      console.error("RabbitMQ 연결 에러", error);
      setTimeout(() => this.connect(), 5000);
    }
  };

  public consumeQueue = async (
    queue: string,
    callback: (msg: ConsumeMessage | null) => void
  ) => {
    if (!this.channel) {
      throw new Error("채널이 설정되지 않음");
    }

    await this.channel.assertQueue(queue, { durable: true });
    console.log(`Waiting for messages in ${queue}. To exit press CTRL+C`);

    this.channel.consume(queue, (msg) => {
      callback(msg);
      if (msg) {
        this.channel?.ack(msg);
      }
    });
  };

  public close = async () => {
    if (this.channel) {
      await this.channel.close();
    }

    if (this.connection) {
      await this.connection.close();
    }
  };
}

export default new RabbitMqConnection();
