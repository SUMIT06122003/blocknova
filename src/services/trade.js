export const getPortfolio = () => {
  return JSON.parse(localStorage.getItem("portfolio")) || [];
};

export const savePortfolio = (data) => {
  localStorage.setItem("portfolio", JSON.stringify(data));
};

export const executeTrade = (symbol, price, amount, side) => {
  let portfolio = getPortfolio();

  const index = portfolio.findIndex((p) => p.symbol === symbol);

  if (side === "BUY") {
    if (index !== -1) {
      const existing = portfolio[index];

      const totalAmount = existing.amount + amount;
      const avgPrice =
        (existing.price * existing.amount + price * amount) /
        totalAmount;

      portfolio[index] = {
        ...existing,
        amount: totalAmount,
        price: avgPrice,
      };
    } else {
      portfolio.push({
        symbol,
        price,
        amount,
      });
    }
  }

  if (side === "SELL") {
    if (index !== -1) {
      portfolio[index].amount -= amount;

      if (portfolio[index].amount <= 0) {
        portfolio.splice(index, 1);
      }
    }
  }

  savePortfolio(portfolio);
  return portfolio;
};