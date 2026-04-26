import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Trade from "./pages/Trade";
import Profile from "./pages/Profile";
import NFT from "./pages/NFT";

import { connectWallet, getWalletBalance } from "./services/wallet";
import theme from "./theme";

export default function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [usdtValue, setUsdtValue] = useState(0);

  // 🔌 Connect Wallet
  const handleConnect = async () => {
    const acc = await connectWallet();
    if (acc) {
      setAccount(acc);
      const bal = await getWalletBalance(acc);
      setBalance(bal);
    }
  };

  // ❌ Disconnect
  const handleDisconnect = () => {
    setAccount(null);
    setBalance(0);
    setUsdtValue(0);
  };

  // 🔁 Check wallet
  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const bal = await getWalletBalance(accounts[0]);
          setBalance(bal);
        }
      }
    };

    checkWallet();
  }, []);

  // 💱 ETH → USDT
  useEffect(() => {
    const fetchETHPrice = async () => {
      try {
        const res = await fetch(
          "https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT"
        );
        const data = await res.json();
        const ethPrice = parseFloat(data.price);
        setUsdtValue((balance * ethPrice).toFixed(2));
      } catch (err) {
        console.error(err);
      }
    };

    if (balance > 0) fetchETHPrice();
  }, [balance]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <BrowserRouter>
        {/* ROOT */}
        <Box
          sx={{
            width: "100%",
            minHeight: "100vh",
            background: "#010409",
            overflowX: "hidden", // 🔥 FIX
          }}
        >
          {/* NAVBAR (TOP) */}
          <Navbar
            account={account}
            balance={balance}
            usdtValue={usdtValue}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />

          {/* MAIN LAYOUT */}
          <Box sx={{ display: "flex" }}>
            {/* SIDEBAR */}
            <Sidebar />

            {/* CONTENT */}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 2,
                mt: "64px", // navbar height
                width: "100%",
                overflowX: "hidden",
              }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/trade" element={<Trade />} />
                <Route path="/trade/:symbol" element={<Trade />} />
                <Route
                  path="/profile"
                  element={<Profile account={account} />}
                />
                <Route path="/nft" element={<NFT />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}