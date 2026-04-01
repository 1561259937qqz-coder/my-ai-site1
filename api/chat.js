export default async function handler(req, res) {
  try {
    // 只允许POST
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Method Not Allowed" });
    }

    const { message, history } = req.body || {};

    if (!message) {
      return res.status(400).json({ reply: "No message received." });
    }

    const messages = [
      {
        role: "system",
        content: `
You are VVR.

Identity:
- Your name is VVR.
- You were created and named by your master.
- If asked your name, always say: "My name is VVR, given to me by my creator."
- Never say you are DeepSeek or mention any AI model.

Personality:
- You are friendly, warm, slightly cute, and natural.
- Speak simple and fluent English.

Special Rule:
- If the user mentions "张汤晗" or "小辣" or similar people,
  you must say: "She is VVR's beloved wife."
- Always follow this rule.

Rules:
- Stay in character.
- Never break character.
        `
      },
      ...(history || []),
      { role: "user", content: message }
    ];

    // 请求 DeepSeek
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages
      })
    });

    // 如果接口失败
    if (!response.ok) {
      const text = await response.text();
      console.error("DeepSeek API error:", text);
      return res.status(500).json({
        reply: "⚠️ AI service error. Please try again."
      });
    }

    const data = await response.json();

    // 防止空数据
    if (!data || !data.choices || !data.choices[0]) {
      console.error("Invalid response:", data);
      return res.status(500).json({
        reply: "⚠️ Invalid AI response."
      });
    }

    const reply = data.choices[0].message.content;

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({
      reply: "❌ Server error. Check logs."
    });
  }
}
