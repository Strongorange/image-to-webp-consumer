import dotenv from "dotenv";
dotenv.config();
import "tsconfig-paths/register";
import RabbitMqConnection from "@/models/RabbitMqConnection";

const QUEUE_NAME = "image_conversion";

const processMessage = async (message: string) => {
  try {
    const job = JSON.parse(message);
    console.log("Received job:", job);
    // 여기에 이미지 변환 로직을 구현합니다.
    // 예: await convertImage(job.imagePath);
    console.log("Job processed successfully");
  } catch (error) {
    console.error("Error processing message:", error);
  }
};

const main = async () => {
  try {
    await RabbitMqConnection.connect();

    await RabbitMqConnection.consumeQueue(QUEUE_NAME, (msg) => {
      if (msg !== null) {
        processMessage(msg.content.toString());
      }
    });

    // 정상적인 종료를 위한 이벤트 리스너
    process.on("SIGINT", async () => {
      console.log("Closing RabbitMQ connection");
      await RabbitMqConnection.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("에러 발생", error);
    process.exit(1);
  }
};

main();
