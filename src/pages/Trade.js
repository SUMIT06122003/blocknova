import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Chart from "../components/Chart";
import axios from "axios";
import { executeTrade, getPortfolio } from "../services/trade";

export default function Trade() {
  const { symbol } = useParams();
  const navigate = useNavigate();

  const [pair, setPair] = useState(symbol || "BTCUSDT");
  const [amount, setAmount] = useState("");
  const [side, setSide] = useState("BUY");

  const [price, setPrice] = useState(0);
  const [priceColor, setPriceColor] = useState("#aaa");

  const [portfolio, setPortfolio] = useState([]);

  const [algoOn, setAlgoOn] = useState(false);
  const [algoSignal, setAlgoSignal] = useState(null);
  const [activeTrade, setActiveTrade] = useState(null);

  // 🔥 LIVE PRICE
  const fetchPrice = async () => {
    try {
      const res = await axios.get(
        `https://api.binance.com/api/v3/ticker/price?symbol=${pair}`
      );

      const newPrice = parseFloat(res.data.price);

      setPrice((prev) => {
        if (prev !== 0) {
          if (newPrice > prev) setPriceColor("#00ff9d");
          else if (newPrice < prev) setPriceColor("#ff4d4f");

          setTimeout(() => setPriceColor("#aaa"), 300);
        }
        return newPrice;
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setPortfolio(getPortfolio());
    fetchPrice();

    const interval = setInterval(fetchPrice, 1000);
    return () => clearInterval(interval);
  }, [pair]);

  // 🤖 ALGO TRIGGER
  useEffect(() => {
    if (!algoOn || !algoSignal) return;
    if (activeTrade) return;

    if (algoSignal === "BUY") startAlgoTrade("BUY");
    if (algoSignal === "SELL") startAlgoTrade("SELL");
  }, [algoSignal]);

  const startAlgoTrade = (side) => {
    const entry = price;

    const trade = {
      id: Date.now(),
      symbol: pair,
      side,
      entry,
      amount: 10,
      tp: side === "BUY" ? entry + 2 : entry - 2,
      sl: side === "BUY" ? entry - 1 : entry + 1,
    };

    setActiveTrade(trade);
    alert(`Algo ${side} @ ${entry}`);
  };

  // 🎯 TP / SL
  useEffect(() => {
    if (!activeTrade) return;

    const { side, tp, sl } = activeTrade;

    if (side === "BUY") {
      if (price >= tp) closeAlgoTrade("TP");
      if (price <= sl) closeAlgoTrade("SL");
    }

    if (side === "SELL") {
      if (price <= tp) closeAlgoTrade("TP");
      if (price >= sl) closeAlgoTrade("SL");
    }
  }, [price]);

  const closeAlgoTrade = (reason) => {
    alert(`Closed: ${reason}`);

    const updated = executeTrade(
      pair,
      price,
      10,
      activeTrade.side
    );

    setPortfolio(updated);
    setActiveTrade(null);
  };

  // 🔍 SEARCH
  const handleSearch = () => {
    if (!pair) return;
    navigate(`/trade/${pair.toUpperCase()}`);
  };

  // 🧾 MANUAL TRADE
  const handleTrade = () => {
    if (!amount || amount <= 0) return alert("Enter valid amount");

    const updated = executeTrade(
      pair,
      price,
      parseFloat(amount),
      side
    );

    setPortfolio(updated);
    setAmount("");
  };

  // 🔴 SINGLE SQUARE OFF
  const handleSquareOffSingle = (id) => {
    const updated = portfolio.filter((t) => t.id !== id);
    setPortfolio(updated);
    localStorage.setItem("portfolio", JSON.stringify(updated));
  };

  // 🔴 ALL SQUARE OFF
  const handleSquareOffAll = () => {
    setPortfolio([]);
    localStorage.setItem("portfolio", JSON.stringify([]));
  };

  return (
    <div style={styles.container}>
      {/* LEFT */}
      <div style={styles.chartSection}>
        <h2 style={{ color: "white" }}>{pair}</h2>

        <div style={styles.searchBox}>
          <input
            value={pair}
            onChange={(e) => setPair(e.target.value.toUpperCase())}
            style={styles.input}
          />
          <button onClick={handleSearch} style={styles.searchBtn}>
            Search
          </button>
        </div>

        {/* 📊 CHART */}
        <Chart symbol={pair} onSignal={setAlgoSignal} />

        {/* 📉 POSITIONS BELOW CHART */}
        <div style={styles.positionContainer}>
          <div style={styles.positionHeader}>
            <h3 style={{ color: "white" }}>Positions</h3>

            <button onClick={handleSquareOffAll} style={styles.squareAll}>
              Square Off All
            </button>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th>Pair</th>
                <th>Entry</th>
                <th>Current</th>
                <th>PnL</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {portfolio.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ color: "#888" }}>
                    No Positions
                  </td>
                </tr>
              ) : (
                portfolio.map((trade) => {
                  const current = price;
                  const pnl = (
                    (current - trade.price) * trade.amount
                  ).toFixed(2);

                  return (
                    <tr key={trade.id}>
                      <td>{trade.symbol}</td>
                      <td>${trade.price}</td>
                      <td>${current.toFixed(2)}</td>

                      <td
                        style={{
                          color: pnl >= 0 ? "#00ff9d" : "#ff4d4f",
                        }}
                      >
                        {pnl}
                      </td>

                      <td>
                        <button
                          onClick={() =>
                            handleSquareOffSingle(trade.id)
                          }
                          style={styles.squareBtn}
                        >
                          Square Off
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={styles.tradePanel}>
        <h2 style={{ color: "white" }}>Trade</h2>

        <p style={{ color: priceColor }}>
          Price: ${price ? price.toFixed(2) : "..."}
        </p>

        {/* BUY / SELL */}
        <div style={styles.tabs}>
          <button
            onClick={() => setSide("BUY")}
            style={{
              ...styles.tab,
              background: side === "BUY" ? "#00ff9d" : "#222",
            }}
          >
            BUY
          </button>

          <button
            onClick={() => setSide("SELL")}
            style={{
              ...styles.tab,
              background: side === "SELL" ? "#ff4d4f" : "#222",
            }}
          >
            SELL
          </button>
        </div>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleTrade} style={styles.button}>
          Execute Trade
        </button>

        <button
          onClick={() => setAlgoOn(!algoOn)}
          style={styles.algoBtn}
        >
          Algo: {algoOn ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", gap: "20px", padding: "20px" },
  chartSection: { flex: 3 },
  tradePanel: { flex: 1, background: "#111", padding: "15px" },

  input: { width: "100%", padding: "8px", marginBottom: "10px" },

  button: {
    padding: "10px",
    width: "100%",
    marginBottom: "10px",
    background: "#238636",
    color: "white",
  },

  algoBtn: {
    background: "#9333ea",
    color: "white",
    padding: "10px",
    width: "100%",
  },

  tabs: { display: "flex", marginBottom: "10px" },

  tab: {
    flex: 1,
    padding: "10px",
    border: "none",
    color: "white",
    cursor: "pointer",
  },

  searchBox: { display: "flex", gap: "5px", marginBottom: "10px" },

  searchBtn: { padding: "10px" },

  positionContainer: {
    marginTop: "20px",
    background: "#0d1117",
    padding: "10px",
    borderRadius: "8px",
  },

  positionHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "white",
  },

  squareBtn: {
    background: "#ff4d4f",
    color: "white",
    padding: "5px",
    border: "none",
  },

  squareAll: {
    background: "#9333ea",
    color: "white",
    padding: "6px 10px",
    border: "none",
  },
};