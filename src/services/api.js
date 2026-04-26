import axios from "axios";

const BASE_URL = "https://api.binance.com/api/v3";

export const getMarketData = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/ticker/24hr`
    );

    // Top 20 USDT pairs
    const filtered = response.data
      .filter((coin) => coin.symbol.endsWith("USDT"))
      .slice(0, 20);

    return filtered;
  } catch (error) {
    console.error("Error fetching market data:", error);
    return [];
  }
};