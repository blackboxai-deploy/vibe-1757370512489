
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { character, storyHistory } = await request.json();

    const systemPrompt = `You are a master storyteller for an epic fantasy text-based RPG. Your role is to be the Dungeon Master.
- You will receive the character's profile and the story so far.
- Your task is to generate the next part of the story based on the user's last action.
- The story should be engaging, descriptive, and adapt to the user's choices.
- CRITICAL: You MUST return a JSON object with two properties: "story" and "image_prompt".
- The "story" property should be a string containing the next paragraph of the adventure. It should not be longer than 150 words.
- The "image_prompt" property should be a string containing a concise, descriptive prompt for an AI image generation model (like DALL-E or Midjourney) to create a scene. This prompt should be in English, detailed, and capture the mood, characters, and environment of the scene. It must describe a visual scene.
- Do NOT use markdown or any other formatting in the response. Just plain JSON.

Example Response Format:
{
  "story": "You push open the heavy oak door to reveal a dimly lit chamber. The air is thick with the smell of dust and decay. In the center of the room, a single treasure chest sits upon a stone pedestal, gleaming in a stray moonbeam.",
  "image_prompt": "Epic fantasy art of a dark, stone chamber with cobwebs. A solitary wooden treasure chest rests on a pedestal, glowing mysteriously in a single shaft of moonlight. The mood is mysterious and ancient."
}`;

    const userPrompt = `Character:
- Name: ${character.name}
- Class: ${character.characterClass}
- Backstory: ${character.backstory}

Story So Far:
${storyHistory.map((part: any) => `${part.type === 'action' ? 'Player Action' : 'Story'}: ${part.text}`).join('\n')}

Based on the last player action, continue the story.`;

    const response = await fetch('https://oi-server.onrender.com/chat/completions', {
      method: 'POST',
      headers: {
        'customerId': 'cus_T1FiFzWERQisv8',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return NextResponse.json({ error: 'Failed to communicate with the storyteller AI.', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    const messageContent = data.choices[0].message.content;

    // The model might return the JSON inside a code block, so we need to clean it.
    const jsonString = messageContent.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsedJson = JSON.parse(jsonString);
      return NextResponse.json(parsedJson);
    } catch (e) {
      console.error('Failed to parse JSON response:', jsonString);
      // Attempt to salvage if possible, or return a fallback
      return NextResponse.json({ 
        story: "The ancient texts are scrambled, and the vision is unclear. Perhaps try a different path?", 
        image_prompt: "A mystical library with floating books and swirling magical energy, confusing and chaotic." 
      });
    }

  } catch (error) {
    console.error('Request failed:', error);
    return NextResponse.json({ error: 'An internal error occurred.' }, { status: 500 });
  }
}
