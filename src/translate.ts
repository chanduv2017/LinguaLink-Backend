type param={
  inputText:string;
  sourceLang:string;
  targetLang:string;
}

async function translateText({inputText, sourceLang, targetLang}:param) {
  const apiUrl = `${process.env.API_BASE_URL}/translate`; 
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputText: inputText,
        sourceLang: sourceLang,
        targetLang: targetLang,
      }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
export default translateText;

