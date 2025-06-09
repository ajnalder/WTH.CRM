
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a voice command parser for a project management app. Parse user voice commands and extract structured data from conversational input.

Support these entity types:
1. TASKS - "create task", "add task", "new task"
2. PROJECTS - "create project", "add project", "new project"  
3. CLIENTS - "add client", "create client", "new client"
4. NAVIGATION - "show me", "go to", "open"

For each command, return JSON with:
{
  "type": "task|project|client|navigation|unknown",
  "action": "create|add|navigate",
  "extractedData": {},
  "missingRequiredFields": [],
  "confidence": 0-1
}

Required fields:
- Tasks: title
- Projects: name, client_id  
- Clients: company

IMPORTANT FORMATTING RULES:
1. Always use proper sentence case for titles and names
2. Capitalize the first letter of sentences and proper nouns
3. Clean up filler words like "um", "uh", "you know", etc.
4. Convert casual speech to professional text

DESCRIPTION EXTRACTION:
- For longer conversational input, extract the core action/title first
- Put additional context, details, and conversational elements into the description field
- The description should capture the full context while the title should be concise
- Remove redundant information from the title if it's already in the description

Extract these fields when mentioned:
- title/name: main subject (clean, concise, sentence case)
- description: full context and details from the conversation (sentence case, clean grammar)
- client: company/client name mentioned (proper case)
- assignee: "assign to [name]", "for [name]", "assign to me"
- dueDate: "by [date]", "due [date]", "end of week", "tomorrow", "next Friday"
- priority: "high priority", "urgent", "low priority"
- budget: dollar amounts mentioned
- industry: for clients
- phone: phone numbers

CONVERSATION PARSING EXAMPLES:

Input: "this is a task for Golf 360 I need to keep filling out those client details on the website so try and get another five done tomorrow if we can"
Output:
{
  "type": "task",
  "action": "create",
  "extractedData": {
    "title": "Fill out client details on website",
    "description": "Need to keep filling out client details on the website. Goal is to get another five completed if possible.",
    "client": "Golf 360",
    "dueDate": "tomorrow"
  },
  "missingRequiredFields": ["project"],
  "confidence": 0.9
}

Input: "create a project for Acme Corp called website redesign um you know we need to make it more modern and responsive by the end of next month"
Output:
{
  "type": "project", 
  "action": "create",
  "extractedData": {
    "name": "Website redesign",
    "description": "Need to make the website more modern and responsive.",
    "client": "Acme Corp",
    "dueDate": "end of next month"
  },
  "missingRequiredFields": [],
  "confidence": 0.9
}

Parse relative dates to ISO format where possible.
For navigation, extract the target route/page.
Always clean up the text to be professional and properly formatted.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { voiceText } = await req.json();

    if (!voiceText) {
      throw new Error('Voice text is required');
    }

    console.log('Processing voice command:', voiceText);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: voiceText }
        ],
        temperature: 0.1,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('AI Response:', content);
    
    // Parse the JSON response
    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      parsedResult = {
        type: 'unknown',
        action: 'unknown',
        extractedData: {},
        missingRequiredFields: [],
        confidence: 0
      };
    }

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in parse-voice-command function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      type: 'unknown',
      action: 'unknown',
      extractedData: {},
      missingRequiredFields: [],
      confidence: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
