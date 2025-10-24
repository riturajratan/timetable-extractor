import { readFileSync } from 'fs';
import OpenAI from 'openai';

// Read API key from .env file
const envContent = readFileSync('./.env', 'utf8');
const apiKey = envContent.match(/OPENAI_API_KEY=(.+)/)[1].trim();

console.log('Testing API key ending with:', apiKey.slice(-4));
console.log('Making test API call to OpenAI...\n');

const client = new OpenAI({ apiKey });

try {
  // Test with a simple completion
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Say "API key is valid"' }],
    max_tokens: 10
  });

  console.log('✅ SUCCESS! API key is valid');
  console.log('Response:', response.choices[0].message.content);
  console.log('\nYour API key works correctly!');
  console.log('The problem is that Vercel has a DIFFERENT (invalid) key.');
  process.exit(0);
} catch (error) {
  console.log('❌ FAILED! API key is invalid');
  console.log('Error:', error.message);
  console.log('\nYou need to get a new API key from OpenAI.');
  process.exit(1);
}
