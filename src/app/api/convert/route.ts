import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AxiosError } from "axios";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { image } = structuredClone(body);

    const ocrResult = await cloudinary.uploader.upload(image, {
      ocr: "adv_ocr",
    });

    const { textAnnotations } = ocrResult.info.ocr.adv_ocr.data[0];

    const extractedText = textAnnotations
      .map((anno: { description: string }, i: number) =>
        i > 0 ? anno.description.replace(/[^0-9a-z]/gi, "") : ""
      )
      .filter((entry: any) => typeof entry === "string")
      .join(" ");

    const messageContent = `${process.env.PROMPT_TEXT} ${extractedText}`;

    const googleResult = await model.generateContent(messageContent);
    const response = googleResult.response;
    const text = response.text();

    return NextResponse.json({ data: text }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as AxiosError).response!.data },
      { status: 500 }
    );
  }
};
