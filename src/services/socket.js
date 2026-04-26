export const connectPriceSocket = (symbol, onPrice) => {
  const ws = new WebSocket(
    `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
  );

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onPrice(parseFloat(data.p));
  };

  return ws;
};