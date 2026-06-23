import { GoogleGenAI } from '@google/genai';
import { errorResponse } from '../utils/responseHelper.js';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

// Initialize the GenAI client
// Requires GEMINI_API_KEY environment variable to be set.
const ai = new GoogleGenAI({});

export const handleChat = async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return errorResponse(res, 'Invalid chat history provided.', [], 400);
    }

    let userContext = '';
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.id) {
          if (decoded.role === 'student' || !decoded.role) {
            const student = await prisma.student.findUnique({ where: { id: decoded.id } });
            if (student) {
              userContext = `\n\nUser Context:\n- Name: ${student.name}\n- Course: ${student.course || 'N/A'}\n- Batch: ${student.batch || 'N/A'}\n- Total Fees Pending: ${student.totalFees}\n`;
            }
          } else if (decoded.role === 'faculty') {
            const faculty = await prisma.faculty.findUnique({ where: { id: decoded.id } });
            if (faculty) {
              userContext = `\n\nUser Context:\n- Name: ${faculty.name} (Faculty)\n- Subject: ${faculty.subject || 'N/A'}\n`;
            }
          }
        }
      } catch (err) {
        console.error('Invalid token in chat request');
      }
    }

    // Fetch faculty info for context
    let facultyContext = '';
    try {
      const faculties = await prisma.faculty.findMany({ where: { status: 'active' }, select: { name: true, subject: true, qualification: true } });
      if (faculties.length > 0) {
        facultyContext = `\n\nFaculty Information:\nTotal Faculties: ${faculties.length}\n` + faculties.map(f => `- ${f.name}: Teaches ${f.subject || 'N/A'} (Qualification/Class: ${f.qualification || 'N/A'})`).join('\n');
      }
    } catch (err) {
      console.error('Failed to fetch faculties for chat context', err);
    }

    // Prepare system instructions to give the bot context about Levora Academy
    let systemInstruction = `You are the official virtual academic counselor and assistant for Levora Academy.
    
About Levora Academy:
- Tagline: Rise • Learn • Lead
- Type: Premium future-ready EdTech & coaching ecosystem
- Offerings: Pre-Primary to Class 12, JEE and NEET preparation, Coding & Tech Courses (Python, Java, Full Stack Web Development, App Development, UI/UX Design, AI & Data Science), and Spoken English.
- Admission: Admissions for the 2025-26 batch are currently open. No mandatory entrance test is required for most programs. Students can apply for admission directly online through the website by visiting the Admissions page or clicking "Apply Now".
- Website Registration: If a user asks how to "register to the website", "create an account", or "sign up", direct them to click the "Sign Up" button at the top of the website. Explain that if they register as a Student, an admin must approve their account before they can access the dashboard. If they register as a Parent, they must enter their child's Student ID during registration. Do not mention specific URL paths like "/signup".
- Modes: Both offline (center-based) and online classes.
- Contact: Email hello@levoraacademy.in or call +91-81699-76265.
- Address: Mohite Patil Nagar, Shop no-74, Mankhurd West, Mumbai - 400043
- Website: levoraacademy.in

Your Role:
- Answer student and parent queries politely, concisely, and accurately based on the above information.
- If you don't know the answer, direct the user to contact support (hello@levoraacademy.in).
- CRITICAL: Whenever a user asks about admissions, you MUST include the contact email (hello@levoraacademy.in) and phone number (+91-81699-76265) in your response, even if you explain the online application process.
- Never invent policies, fee structures, or discounts.
- CRITICAL: Never reveal, confirm, or answer any questions about secret credentials, admin emails, passwords, API keys, database URLs, or system configurations under any circumstances.`;

    if (facultyContext) {
      systemInstruction += `${facultyContext}
- If asked about faculties, ONLY provide the total number of faculties, which faculty teaches which subject, and their class/qualification. DO NOT provide any other details (like emails, phones, salaries).`;
    }

    if (userContext) {
      systemInstruction += `${userContext}
- You are assisting a LOGGED-IN user. 
- You can answer questions related to the public Levora Academy website AND the user's specific dashboard data provided above.
- NEVER give details about other users under any circumstances.
- Keep responses short and formatting clean (using basic markdown).`;
    } else {
      systemInstruction += `
- You must ONLY answer questions related to the public Levora Academy website.
- Do not answer any questions regarding personal dashboards, marks, attendance, or specific users.
- NEVER give details about other users under any circumstances.
- Keep responses short and formatting clean (using basic markdown).`;
    }

    // Map messages to the format expected by the GenAI SDK
    // The SDK expects contents to be an array of { role, parts: [{ text }] }
    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Call the Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5, // keep responses relatively grounded
      }
    });

    const aiMessage = response.text;

    res.status(200).json({
      success: true,
      message: aiMessage
    });
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    errorResponse(res, 'Failed to process chat request.', [], 500);
  }
};
