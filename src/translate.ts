type Param = {
  inputText: string;
  sourceLang: string;
  targetLang: string;
};

async function translateText({ inputText, sourceLang, targetLang }: Param): Promise<string> {
  const apiUrl = `${process.env.API_BASE_URL}/translate`; 
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputText, sourceLang, targetLang }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Translation API error: ${response.status} - ${response.statusText}`);
      throw new Error(`Translation API responded with an error: ${errorText}`);
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error("Error during translation:", error);
    throw error;
  }
}

export default translateText;
