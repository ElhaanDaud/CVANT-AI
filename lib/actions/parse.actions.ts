"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getFileViewUrl } from "../appwrite";

interface ParsedResume {
  firstName: string;
  lastName: string;
  jobTitle: string;
  address: string;
  phone: string;
  email: string;
  summary: string;
  skills: Array<{ id: number; name: string; rating: number }>;
  experience: Array<{
    id: number;
    title: string;
    companyName: string;
    city: string;
    state: string;
    startDate: string;
    endDate: string;
    currentlyWorking?: boolean;
    workSummary: string;
  }>;
  education: Array<{
    id: number;
    universityName: string;
    degree: string;
    major: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
}

export async function parseResumeWithGemini(
  fileId: string,
): Promise<ParsedResume | null> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const fileUrl = getFileViewUrl(fileId);

    const response = await fetch(fileUrl.toString());
    const arrayBuffer = await response.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `Extract the following information from this resume and respond with ONLY a valid JSON object - no markdown, no code blocks, no backticks, just the raw JSON:

{
  "firstName": string,
  "lastName": string,
  "jobTitle": string,
  "address": string,
  "phone": string,
  "email": string,
  "summary": string,
  "skills": Array<{ "id": number, "name": string, "rating": number }>,
  "experience": Array<{
    "id": number,
    "title": string,
    "companyName": string,
    "city": string,
    "state": string,
    "startDate": string,
    "endDate": string,
    "currentlyWorking": boolean,
    "workSummary": string
  }>,
  "education": Array<{
    "id": number,
    "universityName": string,
    "degree": string,
    "major": string,
    "startDate": string,
    "endDate": string,
    "description": string
  }>
}

Respond only with the raw JSON, with no explanations, code blocks, or other text.`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64Data,
        },
      },
    ]);

    const responseText = result.response.text();

    // Response clean up
    let cleanResponse = responseText
      .replace(/^```json\s*/g, "")
      .replace(/^```\s*/g, "")
      .replace(/\s*```$/g, "")
      .trim();

    try {
      const parsedData = JSON.parse(cleanResponse) as ParsedResume;
      return parsedData;
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      console.error("Raw response:", responseText);
      console.error("Cleaned response:", cleanResponse);
      return null;
    }
  } catch (error) {
    console.error("Error parsing resume with Gemini:", error);
    return null;
  }
}
