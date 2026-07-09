const API_URL = "http://localhost:5000/api/chat";

async function testIntent(message, expectedToSkipRAG) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: message }] })
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;
    let fullText = "";

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.replace('data: ', '');
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.reply) fullText += parsed.reply;
            } catch (e) {}
          }
        }
      }
    }
    
    console.log(`Test for "${message}": \n--> ${fullText.trim()}\n`);
    
    if (expectedToSkipRAG && fullText.length > 200) {
      console.error(`❌ FAILED: Response was too long, likely triggered RAG for "${message}"`);
      return false;
    }
    
    console.log(`✅ PASSED for "${message}"`);
    return true;
  } catch (error) {
    console.error(`Error testing "${message}":`, error);
    return false;
  }
}

async function runTests() {
  console.log("Starting Conversational Intent Tests...\n");
  
  const testCases = [
    { msg: "Shukriya", expectSkip: true },
    { msg: "Thanks", expectSkip: true },
    { msg: "Hello", expectSkip: true },
    { msg: "Bye", expectSkip: true },
    { msg: "JazakAllah", expectSkip: true },
    { msg: "Awesome", expectSkip: true },
    { msg: "What is Wazwan?", expectSkip: false },
    { msg: "Where can I eat in Srinagar?", expectSkip: false }
  ];

  let passed = 0;
  for (const tc of testCases) {
    const success = await testIntent(tc.msg, tc.expectSkip);
    if (success) passed++;
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\nTests completed: ${passed}/${testCases.length} passed.`);
  if (passed !== testCases.length) {
    process.exit(1);
  }
}

runTests();
