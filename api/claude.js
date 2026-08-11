export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt not provided"
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "ANTHROPIC_API_KEY not configured"
      });
    }

    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-5",
          max_tokens: 1500,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Anthropic API error"
      });
    }

    const text =
      data.content
        ?.filter(item => item.type === "text")
        ?.map(item => item.text)
        ?.join("\n") || "";

    return res.status(200).json({
      response: text
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal error generating analysis"
    });
  }
}
