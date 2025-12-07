import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "Imagem não fornecida" },
        { status: 400 }
      );
    }

    // Análise da imagem usando OpenAI Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analise esta foto de rosto e forneça uma resposta em JSON com a seguinte estrutura:

{
  "faceShape": "Nome do formato do rosto (ex: Oval, Redondo, Quadrado, Triangular, Coração, Diamante, Retangular)",
  "characteristics": ["característica 1", "característica 2", "característica 3"],
  "exercises": [
    {
      "name": "Nome do exercício",
      "description": "Descrição detalhada de como fazer o exercício",
      "duration": "5-10 minutos",
      "frequency": "2x ao dia",
      "benefits": ["benefício 1", "benefício 2", "benefício 3"]
    }
  ],
  "habits": [
    {
      "name": "Nome do hábito",
      "description": "Descrição do hábito e como implementá-lo",
      "frequency": "Diariamente",
      "impact": "Alto impacto"
    }
  ],
  "recommendations": ["recomendação 1", "recomendação 2"]
}

Forneça:
1. Formato do rosto identificado
2. 3-4 características faciais principais
3. 5-6 exercícios faciais específicos para esse formato de rosto (exercícios de yoga facial, massagens, técnicas de tonificação)
4. 4-5 hábitos saudáveis para melhorar a aparência facial (hidratação, alimentação, sono, skincare, postura)
5. 2-3 recomendações gerais

Os exercícios devem ser práticos, seguros e focados em:
- Tonificação muscular facial
- Redução de linhas de expressão
- Melhora da circulação
- Definição do contorno facial
- Relaxamento de tensões

Os hábitos devem incluir:
- Cuidados com a pele
- Alimentação adequada
- Hidratação
- Qualidade do sono
- Postura
- Proteção solar

Seja específico e prático nas instruções.`,
            },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Resposta vazia da API");
    }

    const analysis = JSON.parse(content);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Erro ao analisar face:", error);
    return NextResponse.json(
      { error: "Erro ao processar a análise facial" },
      { status: 500 }
    );
  }
}
