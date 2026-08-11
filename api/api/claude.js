export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Método não permitido.'
    });
  }

  try {

    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        error: 'O prompt da análise não foi enviado.'
      });
    }

    const apiKey =
      process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'A chave da Anthropic não está configurada no Vercel.'
      });
    }

    const response = await fetch(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },

        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1200,
          temperature: 0.3,

          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      console.error(
        'Erro Anthropic:',
        data
      );

      return res.status(
        response.status
      ).json({
        error:
          data?.error?.message ||
          'Erro ao consultar a IA.'
      });
    }

    const text =
      data?.content
        ?.filter(
          item =>
            item.type === 'text'
        )
        ?.map(
          item =>
            item.text
        )
        ?.join('\n')
        ?.trim();


    if (!text) {

      return res.status(500).json({
        error:
          'A IA não retornou nenhum texto.'
      });
    }


    return res.status(200).json({
      text
    });


  } catch(error) {

    console.error(
      'Erro interno:',
      error
    );


    return res.status(500).json({
      error:
        error?.message ||
        'Erro interno ao gerar análise.'
    });
  }
}
