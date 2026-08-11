export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Método não permitido'
    });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt não informado'
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro Anthropic:', data);

      return res.status(response.status).json({
        error: data?.error?.message || 'Erro ao chamar a Anthropic'
      });
    }

    const text = (data.content || [])
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n')
      .trim();

    if (!text) {
      return res.status(500).json({
        error: 'Resposta vazia da IA'
      });
    }

    return res.status(200).json({
      text
    });

  } catch (error) {
    console.error('Erro interno:', error);

    return res.status(500).json({
      error: error.message || 'Erro interno do servidor'
    });
  }
}
