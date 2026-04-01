export default async function handler(req, res) {
  try {
    const { message, history } = req.body;

    const messages = [
      { role: "system", content: "You are a helpful English assistant." },
      ...(history || [])
    ];

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

    const data = await response.json();

    res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({ reply: "Error" });
  }
}
