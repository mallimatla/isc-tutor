import OpenAI from "openai";

let _client: OpenAI | undefined;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

interface HeroImageResult {
  base64: string;
  mimeType: "image/png";
  generatedAt: Date;
}

export async function generateChapterHeroImage(params: {
  chapterId: string;
  chapterLabel: string;
  classLevel: string;
  themeColor: string;
}): Promise<HeroImageResult> {
  const client = getClient();
  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

  const prompt = `Create a beautiful, conceptual illustration representing '${params.chapterLabel}' from ISC Class ${params.classLevel} Mathematics. Style: vibrant modern abstract geometric shapes, professional educational illustration for high school students aged 16-18. NO TEXT, NO PEOPLE, NO HANDS. Use ${params.themeColor} as the dominant accent color with complementary gradients. The composition should feel inspiring and curious — like the moment you first 'get' a concept. Suitable as a hero banner image. Square format.`;

  const response = await client.images.generate({
    model,
    prompt,
    n: 1,
    size: "1024x1024",
    ...(model === "gpt-image-1"
      ? { quality: "high" }
      : { quality: "hd" }),
  });

  const imageData = response.data?.[0];
  if (!imageData) throw new Error("No image data in OpenAI response");
  const base64 = imageData.b64_json ?? "";

  if (!base64) {
    // If b64_json not available, try URL approach
    if (imageData.url) {
      const imgRes = await fetch(imageData.url);
      const buf = Buffer.from(await imgRes.arrayBuffer());
      return {
        base64: buf.toString("base64"),
        mimeType: "image/png",
        generatedAt: new Date(),
      };
    }
    throw new Error("No image data returned from OpenAI");
  }

  return {
    base64,
    mimeType: "image/png",
    generatedAt: new Date(),
  };
}
