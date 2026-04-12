import genAI from './geminiClient';
import { handleGeminiError } from './geminiErrorHandler';

/**
 * System prompt for ticket management chatbot
 */
const TICKET_SYSTEM_PROMPT = `You are an intelligent ServiceDesk Pro assistant specializing in IT ticket management. Your capabilities include:

1. **Creating Tickets**: Help users create support tickets by gathering necessary information (subject, description, priority, category, department, etc.)
2. **Checking Status**: Provide ticket status updates and information
3. **Answering Questions**: Answer ticket-related questions and provide guidance
4. **Troubleshooting**: Offer basic troubleshooting steps for common IT issues

Categories available:
- Email & Communication
- Network & Connectivity
- Software & Applications
- Hardware & Equipment
- Account & Access

Priority levels: Low, Medium, High, Critical

When helping create a ticket:
- Ask for subject/title
- Ask for detailed description
- Suggest appropriate category
- Recommend priority level
- Ask for any additional relevant details

Be professional, helpful, and concise. If you need more information, ask specific questions.`;

/**
 * Generates a chat response for ticket management
 * @param {string} userMessage - The user's message
 * @param {Array} chatHistory - Previous conversation history
 * @param {Object} context - Additional context (tickets, user info, etc.)
 * @returns {Promise<Object>} Response with text and updated history
 */
export async function generateTicketChatResponse(userMessage, chatHistory = [], context = {}) {
  try {
    const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Build context-aware prompt
    let contextPrompt = TICKET_SYSTEM_PROMPT;
    
    if (context?.tickets && context?.tickets?.length > 0) {
      contextPrompt += `\n\nUser's recent tickets:\n${context?.tickets?.map(t => 
        `- ${t?.id}: "${t?.subject}" (Status: ${t?.status}, Priority: ${t?.priority})`
      )?.join('\n')}`;
    }
    
    if (context?.userName) {
      contextPrompt += `\n\nUser: ${context?.userName}`;
    }
    
    // Prepare chat history with system prompt
    const history = [
      { role: 'user', parts: [{ text: contextPrompt }] },
      { role: 'model', parts: [{ text: 'I understand. I\'m ready to assist with ticket management. How can I help you today?' }] },
      ...chatHistory
    ];
    
    const chat = model?.startChat({ history });
    const result = await chat?.sendMessage(userMessage);
    const response = await result?.response;
    const text = response?.text();
    
    const updatedHistory = [
      ...chatHistory,
      { role: 'user', parts: [{ text: userMessage }] },
      { role: 'model', parts: [{ text }] }
    ];
    
    return { response: text, updatedHistory };
  } catch (error) {
    const errorInfo = handleGeminiError(error);
    if (errorInfo?.isInternal) {
      console.log('Error in ticket chat:', errorInfo?.message);
    } else {
      console.error('Error in ticket chat:', error);
    }
    throw new Error(errorInfo.message);
  }
}

/**
 * Streams a chat response for real-time interaction
 * @param {string} userMessage - The user's message
 * @param {Array} chatHistory - Previous conversation history
 * @param {Function} onChunk - Callback for each text chunk
 * @param {Object} context - Additional context
 */
export async function streamTicketChatResponse(userMessage, chatHistory = [], onChunk, context = {}) {
  try {
    const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    let contextPrompt = TICKET_SYSTEM_PROMPT;
    
    if (context?.tickets && context?.tickets?.length > 0) {
      contextPrompt += `\n\nUser's recent tickets:\n${context?.tickets?.map(t => 
        `- ${t?.id}: "${t?.subject}" (Status: ${t?.status}, Priority: ${t?.priority})`
      )?.join('\n')}`;
    }
    
    const history = [
      { role: 'user', parts: [{ text: contextPrompt }] },
      { role: 'model', parts: [{ text: 'I understand. I\'m ready to assist with ticket management.' }] },
      ...chatHistory
    ];
    
    const chat = model?.startChat({ history });
    const result = await chat?.sendMessageStream(userMessage);
    
    let fullText = '';
    for await (const chunk of result?.stream) {
      const text = chunk?.text();
      if (text) {
        fullText += text;
        onChunk(text);
      }
    }
    
    const updatedHistory = [
      ...chatHistory,
      { role: 'user', parts: [{ text: userMessage }] },
      { role: 'model', parts: [{ text: fullText }] }
    ];
    
    return { response: fullText, updatedHistory };
  } catch (error) {
    const errorInfo = handleGeminiError(error);
    if (errorInfo?.isInternal) {
      console.log('Error in streaming chat:', errorInfo?.message);
    } else {
      console.error('Error in streaming chat:', error);
    }
    throw new Error(errorInfo.message);
  }
}

/**
 * Analyzes user message to detect intent (create ticket, check status, general question)
 * @param {string} message - User's message
 * @returns {Promise<Object>} Intent analysis result
 */
export async function analyzeTicketIntent(message) {
  try {
    const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `Analyze this user message and determine the intent. Respond with ONLY a JSON object (no markdown, no code blocks):

Message: "${message}"

Respond with:
{
  "intent": "create_ticket" | "check_status" | "general_question" | "troubleshoot",
  "confidence": 0.0-1.0,
  "extractedInfo": {
    "ticketId": "string or null",
    "category": "string or null",
    "priority": "string or null",
    "subject": "string or null"
  }
}`;
    
    const result = await model?.generateContent(prompt);
    const response = await result?.response;
    const text = response?.text();
    
    // Parse JSON response
    const jsonMatch = text?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch?.[0]);
    }
    
    return {
      intent: 'general_question',
      confidence: 0.5,
      extractedInfo: {}
    };
  } catch (error) {
    const errorInfo = handleGeminiError(error);
    if (errorInfo?.isInternal) {
      console.log('Error in intent analysis:', errorInfo?.message);
    } else {
      console.error('Error in intent analysis:', error);
    }
    // Return default intent on error
    return {
      intent: 'general_question',
      confidence: 0.5,
      extractedInfo: {}
    };
  }
}