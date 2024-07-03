import { createWorker } from "tesseract.js";

export const convertor = async (image: string) => {
  const worker = await createWorker("eng");
  const ret = await worker.recognize(image);
  await worker.terminate();
  return ret.data.text;
};
