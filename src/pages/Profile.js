import React, { useEffect, useState } from "react";

export default function Profile() {
  const [portfolio, setPortfolio] = useState([]);

  const loadPortfolio = () => {
    const data =
      JSON.parse(localStorage.getItem("portfolio")) || [];
    setPortfolio(data);
  };

  useEffect(() => {
    loadPortfolio();

    // 🔥 auto refresh every 2s
    const interval = setInterval(loadPortfolio, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>Live Portfolio</h2>

      {portfolio.length === 0 ? (
        <p>No trades yet</p>
      ) : (
        portfolio.map((p, i) => (
          <div key={i} style={styles.card}>
            <h3>{p.symbol}</h3>
            <p>Amount: {p.amount}</p>
            <p>Entry: ${p.price.toFixed(2)}</p>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "#161b22",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
  },
};