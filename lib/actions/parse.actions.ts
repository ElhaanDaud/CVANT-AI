"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getFileViewUrl } from "../appwrite";
import { email, phone } from "../validations/resume";
import { number } from "zod";

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

${jobTitleGuidance}

In Experience section give summary in ATS friendly format in 50-100 words.

Add Projects in the Experience section after adding the work experiences where title will be the "<Project name> - Project", company name will be the the Languages used, and work summary will be the project description in detail in ATS friendly format in 100-200 words.

currentlyWorking should be true if the end date is empty.

startDate and endDate if not mentioned should be left empty.

${relevanceInstruction}

Normalize and standardize job titles, company names, and degree names.

Use a consistent date format (e.g., "MMM YYYY" or "YYYY-MM").

Enhance the summary with relevant, keyword-rich, professional content tailored for ATS.

Assign skills ratings on a scale from 1 to 5 based on emphasis and relevance.{Very Skilled: 5, Skilled: 4, Average: 3, Basic: 2, No Experience: 1}.Default 1 if no rating is provided.

Correct grammar, casing, punctuation, and formatting throughout.

Summarize achievements in experience using quantifiable impact and action verbs.

Remove redundancy and merge overlapping entries where applicable.`;

    if (jobDescription) {
      prompt += `

Additionally, a job description has been provided. Pay special attention to it. Tailor the resume parsing, keyword optimization, and summary enhancement to align with the requirements, skills, and keywords found in this job description:
---
JOB DESCRIPTION START
${jobDescription}
JOB DESCRIPTION END
---`;
    }

    prompt += `

Respond ONLY with valid,minified JSON strictly following the schema above. Do not include any explanation or extra text.
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
