async function generateAndPublishPost() {
  const metaPageId = process.env.PAGE_ID;
  const metaToken = process.env.ACCESS_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY;
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

  // DEBUG CHECK: Ensure secrets are actually loading
  console.log(`Gemini Key Length: ${geminiKey ? geminiKey.length : 'UNDEFINED'}`);
  console.log(`Unsplash Key Length: ${unsplashKey ? unsplashKey.length : 'UNDEFINED'}`);

  try {
    // 1. GENERATE CAPTION WITH GEMINI AI
    console.log("Generating caption...");
    
    // Using the new 2026 Interactions API endpoint
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/interactions`;
    const prompt = "Write a short, engaging Facebook post about the intersection of software engineering and automotive technology. Include 2-3 relevant hashtags. Do not include emojis and em dash.";
    
    const aiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-goog-api-key": geminiKey // The AQ key authenticates perfectly here
      },
      // The payload structure is much cleaner now
      body: JSON.stringify({ 
        model: "gemini-3.8-flash", 
        input: prompt 
      })
    });
    
    const aiData = await aiResponse.json();
    
    if (!aiResponse.ok) {
      throw new Error(`Gemini API Error: ${JSON.stringify(aiData)}`);
    }

    // The new response structure directly provides the output text
    console.log("AI Data Response received successfully.");
    const caption = aiData.output_text || aiData.outputText;

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
    console.log("🎉 Post successfully published! Facebook Post ID:", fbData.id);

  } catch (error) {
    console.error("❌ Error running autonomous agent:", error);
  }
}

generateAndPublishPost();