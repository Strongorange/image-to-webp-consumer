import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

interface ConversionOptions {
  quality?: number;
  width?: number;
  height?: number;
}

class ImageConversionService {
  private readonly DEFAULT_QUALITY = 80;

  public convertToWebP = async (
    inputPath: string,
    outputPath: string,
    options: ConversionOptions = {}
  ) => {
    try {
      await fs.access(inputPath);
      let sharpInstance = sharp(inputPath);

      if (options.width || options.height) {
        sharpInstance = sharpInstance.resize({
          width: options.width,
          height: options.height,
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      await sharpInstance
        .webp({ quality: options.quality || this.DEFAULT_QUALITY })
        .toFile(outputPath);

      await this.deleteFile(inputPath);

      return outputPath;
    } catch (error) {
      console.error("이미지 변환 에러", error);
      throw new Error(`이미지 변환 실패: ${(error as Error).message}`);
    }
  };

  public async getImageInfo(imagePath: string): Promise<sharp.Metadata> {
    try {
      return await sharp(imagePath).metadata();
    } catch (error) {
      console.error("이미지 정보 조회 에러:", error);
      throw new Error(`이미지 정보 조회 에러: ${(error as Error).message}`);
    }
  }

  public generateOutputPath(inputPath: string): string {
    const dir = path.dirname(inputPath);
    const filename = path.basename(inputPath, path.extname(inputPath));
    return path.resolve(dir, `${filename}.webp`);
  }

  public async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error("파일 삭제 실패:", error);
      throw new Error(`파일 삭제 실패: ${(error as Error).message}`);
    }
  }
}

export default ImageConversionService;
