import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
} from "lightweight-charts";
import axios from "axios";

export default function Chart({ symbol, onSignal }) {
  const chartRef = useRef();
  const chartInstance = useRef(null);

  const candleSeriesRef = useRef(null);
  const ema9Ref = useRef(null);
  const ema15Ref = useRef(null);

  const candlesRef = useRef([]);
  const intervalRef = useRef(null);

  const [signal, setSignal] = useState("WAIT");

  // 🔥 CREATE CHART
  useEffect(() => {
    if (!symbol) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#010409" },
        textColor: "#DDD",
      },
      grid: {
        vertLines: { color: "#222" },
        horzLines: { color: "#222" },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {});
    const ema9Series = chart.addSeries(LineSeries, {
      color: "#00ff9d",
      lineWidth: 2,
    });
    const ema15Series = chart.addSeries(LineSeries, {
      color: "#ff4d4f",
      lineWidth: 2,
    });

    chartInstance.current = chart;
    candleSeriesRef.current = candleSeries;
    ema9Ref.current = ema9Series;
    ema15Ref.current = ema15Series;

    loadInitialData();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      candleSeriesRef.current = null;
      ema9Ref.current = null;
      ema15Ref.current = null;
      candlesRef.current = [];

      chart.remove();
      chartInstance.current = null;
    };
  }, [symbol]);

  // 📊 LOAD DATA
  const loadInitialData = async () => {
    try {
      const res = await axios.get(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=100`
      );

      const candles = res.data.map((c) => ({
        time: c[0] / 1000,
        open: +c[1],
        high: +c[2],
        low: +c[3],
        close: +c[4],
      }));

      candlesRef.current = candles;

      candleSeriesRef.current?.setData(candles);

      updateEMAAndSignal(candles);

      startLiveUpdates();
    } catch (err) {
      console.error(err);
    }
  };

  // 🚀 LIVE UPDATE
  const startLiveUpdates = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      try {
        if (!candleSeriesRef.current) return;

        const res = await axios.get(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=1`
        );

        const k = res.data[0];

        const newCandle = {
          time: k[0] / 1000,
          open: +k[1],
          high: +k[2],
          low: +k[3],
          close: +k[4],
        };

        const candles = [...candlesRef.current];
        const last = candles[candles.length - 1];

        if (last && last.time === newCandle.time) {
          candles[candles.length - 1] = newCandle;
        } else {
          candles.push(newCandle);
        }

        candlesRef.current = candles;

        candleSeriesRef.current.update(newCandle);

        updateEMAAndSignal(candles);
      } catch (err) {
        console.error(err);
      }
    }, 1000);
  };

  // 📊 EMA + SIGNAL
  const updateEMAAndSignal = (candles) => {
    if (!ema9Ref.current || !ema15Ref.current) return;

    const closes = candles.map((c) => c.close);

    const ema9 = calculateEMA(closes, 9);
    const ema15 = calculateEMA(closes, 15);

    ema9Ref.current.setData(
      ema9.map((v, i) => ({
        time: candles[i].time,
        value: v,
      }))
    );

    ema15Ref.current.setData(
      ema15.map((v, i) => ({
        time: candles[i].time,
        value: v,
      }))
    );

    generateSignal(ema9, ema15);
  };

  const calculateEMA = (data, period) => {
    const k = 2 / (period + 1);
    let ema = [data[0]];

    for (let i = 1; i < data.length; i++) {
      ema.push(data[i] * k + ema[i - 1] * (1 - k));
    }

    return ema;
  };

  // 🔥 UPDATED SIGNAL LOGIC
  const generateSignal = (ema9, ema15) => {
    if (ema9.length < 2) return;

    const last9 = ema9[ema9.length - 1];
    const prev9 = ema9[ema9.length - 2];

    const last15 = ema15[ema15.length - 1];
    const prev15 = ema15[ema15.length - 2];

    let newSignal = "HOLD";

    if (prev9 < prev15 && last9 > last15) {
      newSignal = "BUY";
    } else if (prev9 > prev15 && last9 < last15) {
      newSignal = "SELL";
    }

    setSignal(newSignal);

    // 🚀 SEND TO TRADE PAGE
    if (onSignal) onSignal(newSignal);
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h2 style={{ color: "white" }}>
        Signal:{" "}
        <span
          style={{
            color:
              signal === "BUY"
                ? "#00ff9d"
                : signal === "SELL"
                ? "#ff4d4f"
                : "#999",
          }}
        >
          {signal}
        </span>
      </h2>

      <div ref={chartRef} style={{ width: "100%" }} />
    </div>
  );
}