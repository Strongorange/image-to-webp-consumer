import { DeleteObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../config/s3.config";
const bucketName = process.env.S3_BUCKET_NAME!;
/**
 * 이미지 파일을 s3에 업로드 후 해당 이미지의 주소를 배열에 담아서 리턴
 * @param files image files
 * @returns url[]
 */
export const uploadFilesToS3 = async (
  files: Express.Multer.File[],
  folderName?: string
): Promise<string[]> => {
  const uploads = files.map(async (file): Promise<string> => {
    const timestamp = Date.now();
    const key = folderName
      ? `${folderName}/${timestamp}${file.originalname}`
      : `${timestamp}${file.originalname}`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );
    return `https://${bucketName}.s3.amazonaws.com/${key}`;
  });

  return Promise.all(uploads);
};

export const deleteObjectsUtil = async (objects: string[]) => {
  console.log("이미지 삭제시도");
  try {
    const Objects = objects.map((Key) => ({ Key }));
    const deleteParams = {
      Bucket: bucketName,
      Delete: {
        Objects,
        Quiet: true, // 삭제 결과에 대한 세부 정보를 반환받지 않으려면 true로 설정
      },
    };

    const response = await s3Client.send(
      new DeleteObjectsCommand(deleteParams)
    );
    console.log("Delete response:", response);
  } catch (error) {
    console.error("Error delete objects : ", error);
  }
};

/**
 * 이미지 파일을 s3에 업로드 후 해당 이미지의 주소를 배열에 담아서 리턴
 * @param files image files
 * @returns url[]
 */
export const uploadAPKToS3 = async (
  file: Express.Multer.File
): Promise<string> => {
  if (!file || !file.buffer) {
    throw new Error("File is not defined or buffer is missing");
  }

  const key = "apk/send_now.apk";

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );
  return `https://${bucketName}.s3.amazonaws.com/${key}`;
};

// presignedUrl
export const generatePresignedUrl = async (
  filename: string,
  filetype: string
) => {
  console.log("있나요?", filename, filetype);
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: filename,
    ContentType: filetype,
  };

  const command = new PutObjectCommand(params);

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    return url;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to create presigned URL: ${errorMessage}`);
  }
};
