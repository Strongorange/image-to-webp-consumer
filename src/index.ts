import dotenv from "dotenv";
dotenv.config();
import "tsconfig-paths/register";
import RabbitMqConnection from "@/models/RabbitMqConnection";
import ImageConversionService from "./services/ImageConversionService";

const QUEUE_NAME = "image_conversion";
const imageService = new ImageConversionService();

const processMessage = async (message: string) => {
  try {
    const job = JSON.parse(message);
    console.log("받은 Job:", job);

    const outputPath = imageService.generateOutputPath(job.path);
    const convertedImagePath = await imageService.convertToWebP(
      job.path,
      outputPath,
      job.options
    );

    // const originalInfo = await imageService.getImageInfo(job.path);
    const convertedInfo = await imageService.getImageInfo(convertedImagePath);

    console.log(`Job ${job.id} 수행 성공.`);
    // console.log(
    //   `Original image: ${originalInfo.width}x${originalInfo.height}, ${originalInfo.size} bytes`
    // );
    console.log(
      `변환된 이미지: ${convertedInfo.width}x${convertedInfo.height}, ${convertedInfo.size} bytes`
    );

    // 여기에 변환된 이미지 경로를 데이터베이스에 저장하거나 다른 처리를 추가할 수 있습니다.

    // 원본 이미지 삭제 (선택적)
    // await imageService.deleteFile(job.path);
  } catch (error) {
    console.error("메세지 처리중 에러:", error);
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
