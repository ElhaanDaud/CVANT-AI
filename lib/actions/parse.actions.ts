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
  jobDescription: string,
): Promise<ParsedResume | null> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const fileUrl = getFileViewUrl(fileId);
    const response = await fetch(fileUrl.toString());
    const arrayBuffer = await response.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    let jobTitleGuidance: string;
    let relevanceInstruction: string;

    if (jobDescription && jobDescription.trim() !== "") {
      jobTitleGuidance = `Based on the following job description, tailor the resume. Job Description: "${jobDescription}". Extract relevant keywords, skills, and experiences from the resume that align with this job description. The job title in the parsed output should reflect the target role described in the job description. Prioritize and list skills relevant to this job description first.`;
      relevanceInstruction = `Ensure the extracted information and summaries are highly relevant to the provided job description, focusing on ATS-friendly keywords pertinent to that description.`;
    } else {
      jobTitleGuidance = `Use the most prominent job title mentioned in the resume to guide parsing. If no clear job title is present, use "Professional" as a default. Prioritize skills and content generally suitable for a professional resume.`;
      relevanceInstruction = `Ensure the extracted information and summaries are relevant to the identified job title, focusing on common ATS-friendly keywords for that role.`;
    }

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
