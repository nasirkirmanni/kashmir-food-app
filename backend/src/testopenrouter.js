import { openrouter } from "./config/openrouter.js";

async function test() {
  const response = await openrouter.chat.completions.create({
    model: "qwen/qwen3-32b",
    messages: [
      {
        role: "user",
        content: "What is Wazwan?"
      }
    ]
  });

  console.log(response.choices[0].message.content);
}

test();