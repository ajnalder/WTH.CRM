
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a voice command parser for a project management app. Parse user voice commands and extract structured data.

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

Extract these fields when mentioned:
- title/name: main subject of the task/project
- description: additional details
- client: company/client name mentioned (this is for identifying which client, NOT the project)
- assignee: "assign to [name]", "for [name]", "assign to me"
- dueDate: "by [date]", "due [date]", "end of week", "tomorrow", "next Friday"
- priority: "high priority", "urgent", "low priority"
- budget: dollar amounts mentioned
- industry: for clients
- phone: phone numbers

IMPORTANT: When a client name is mentioned for a task, put it in the "client" field, NOT the "project" field. 
The client field helps identify which client's projects to show.

Parse relative dates to ISO format where possible.
For navigation, extract the target route/page.

Examples:
"Create a task for Golf 360 to update their menu" -> 
{
  "type": "task",
  "action": "create", 
  "extractedData": {"title": "update their menu", "client": "Golf 360"},
  "missingRequiredFields": ["project"],
  "confidence": 0.9
}

"Add a new project called Website Redesign for Golf 360" ->
{
  "type": "project",
  "action": "create",
  "extractedData": {"name": "Website Redesign", "client": "Golf 360"},
  "missingRequiredFields": [], 
  "confidence": 0.8
}`;

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
