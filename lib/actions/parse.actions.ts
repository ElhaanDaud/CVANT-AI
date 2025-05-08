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

    const prompt = `You are a professional resume parser and optimizer. Your task is to extract and enhance structured resume data from raw resume text and return it in a standardized, ATS-friendly JSON format using the following schema:
     - no markdown, no code blocks, no backticks, just the raw JSON:

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

Enhancement Guidelines:

Normalize and standardize job titles, company names, and degree names.

Use a consistent date format (e.g., "MMM YYYY" or "YYYY-MM").

Enhance the summary with relevant, keyword-rich, professional content tailored for ATS.

Assign skills ratings on a scale from 20 to 100 based on emphasis and relevance.{Very Skilled: 100, Skilled: 80, Average: 60, Basic: 40, No Experience: 20}.Default 60 if no rating is provided.
by defaulkt, set the rating to 60.

Correct grammar, casing, punctuation, and formatting throughout.

Summarize achievements in experience using quantifiable impact and action verbs.

Remove redundancy and merge overlapping entries where applicable.

Respond ONLY with valid, minified JSON strictly following the schema above. Do not include any explanation or extra text.

`;

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
