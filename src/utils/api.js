import axios from "axios";

const API_KEY = "09ec489e1a99651ad2ac3f608e32771c";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Şehir parametresi alıp hava durumu döndüren fonksiyon
export async function getWeather(city) {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: city,
        appid: API_KEY,
        units: "metric", // °C için
        lang: "tr",      // açıklamalar Türkçe gelsin
      },
    });
    return response.data;
  } catch (error) {
    console.error("Weather API Error:", error);
    throw error;
  }
}