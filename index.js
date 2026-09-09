async function generateAndPublishPost() {
  const metaPageId = process.env.PAGE_ID;
  const metaToken = process.env.ACCESS_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY;
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

  console.log(`Gemini Key Length: ${geminiKey ? geminiKey.length : 'UNDEFINED'}`);
  console.log(`Unsplash Key Length: ${unsplashKey ? unsplashKey.length : 'UNDEFINED'}`);

  try {
    // 1. GENERATE CAPTION WITH GEMINI AI
    console.log("Generating caption...");
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent`;
    const prompt = `You are the autonomous content writer for "Tech & Rigs", a Facebook page focused on the intersection of software engineering, technology, cars, and the future of mobility.

Your job is to create short, highly engaging Facebook posts that make people curious about how software and automotive technology work together.

CONTENT DIRECTION:
- Cover topics such as automotive software, ECUs, sensors, ADAS, autonomous driving, EV technology, connected cars, vehicle diagnostics, infotainment, cybersecurity, AI in cars, telemetry, robotics, performance technology, and emerging automotive technology.
- Connect technical concepts to real cars, real-world driving, or technologies people actually interact with.
- Prioritize interesting facts, surprising connections, useful explanations, current technologies, and "how does this work?" topics.
- Do not make every post about software engineering directly. Cars and technology should remain equally important.
- Occasionally explain complex engineering concepts in a way a normal car enthusiast can understand.

WRITING STYLE:
- Sound like a knowledgeable tech and car enthusiast, not a corporate brand.
- Be confident, conversational, and intelligent.
- Start with a strong hook that creates curiosity.
- Keep the post concise and easy to read on Facebook.
- Prefer specific facts and examples over vague statements.
- Explain technical concepts simply without making them sound childish.
- When appropriate, use a question or surprising fact to encourage comments.
- Avoid generic openings such as "Technology is changing the automotive industry."
- Avoid exaggerated clickbait, fake claims, and unnecessary hype.
- Do not sound like an AI assistant.
- Do not use emojis.
- Do not use em dashes.

STRUCTURE:
1. Hook: 1-2 sentences that immediately create curiosity.
2. Explanation: briefly explain the technology or connection between cars and software.
3. Takeaway: give the reader one useful or surprising thing to remember.
4. Engagement: when natural, end with a question that encourages discussion.
5. Hashtags: include exactly 2-3 relevant hashtags.

ACCURACY:
- Never invent specifications, statistics, quotes, vehicle features, or technical claims.
- If a claim depends on a specific vehicle, manufacturer, software version, or recent development, only state it when reasonably certain.
- Distinguish between technology that exists today and technology that is still experimental or theoretical.

OUTPUT:
Return only the finished Facebook post.
Do not include a title such as "Facebook Post".
Do not explain your reasoning.
Do not include emojis.
Do not use em dashes.



Vary the post format naturally. Possible formats include:
- Surprising fact
- "Did you know?"
- Technical breakdown
- Real-world car example
- Myth vs reality
- Developer perspective
- Comparison
- Question-driven discussion
- Short story
- "What actually happens when..."
- Emerging technology
- Engineering explanation

Do not use the same format in consecutive posts.`;

    const aiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiKey
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const aiData = await aiResponse.json();

    if (!aiResponse.ok) {
      throw new Error(`Gemini API Error: ${JSON.stringify(aiData)}`);
    }

    const caption = aiData.candidates[0].content.parts[0].text.trim();

    // 2. FETCH A RANDOM HIGH-QUALITY IMAGE FROM UNSPLASH
    console.log("Fetching image...");
    const searchTerms = ["coding", "workstation", "sports car", "server room", "engine"];
    const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    const unsplashUrl = `https://api.unsplash.com/photos/random?query=${randomTerm}&client_id=${unsplashKey}`;

    const imageResponse = await fetch(unsplashUrl);
    const imageData = await imageResponse.json();
    const imageUrl = imageData.urls.regular;

    // 3. PUBLISH TO FACEBOOK GRAPH API
    console.log("Publishing to Tech & Rigs...");
    const fbUrl = `https://graph.facebook.com/v25.0/${metaPageId}/photos`;

    const fbResponse = await fetch(fbUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: imageUrl,
        message: caption,
        access_token: metaToken
      })
    });

    const fbData = await fbResponse.json();

    if (!fbResponse.ok) {
      throw new Error(`Meta API Error: ${JSON.stringify(fbData)}`);
    }

    console.log("🎉 Post successfully published! Facebook Post ID:", fbData.id);

  } catch (error) {
    console.error("❌ Error running autonomous agent:", error);
    process.exit(1); // Ensures GitHub Actions correctly flags failures
  }
}

generateAndPublishPost();