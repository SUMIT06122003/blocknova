import React, { useEffect, useState } from "react";
import { getMarketData } from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Grid,
} from "@mui/material";
import {
  Star,
  StarBorder,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";

export default function Dashboard() {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("volume");
  const [ascending, setAscending] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);

  const [watchlist, setWatchlist] = useState(
    JSON.parse(localStorage.getItem("watchlist")) || []
  );

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getMarketData();
    setCoins(data);
    setLoading(false);
  };

  let filteredCoins = coins.filter((coin) =>
    coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  if (filter === "FAV") {
    filteredCoins = filteredCoins.filter((c) =>
      watchlist.includes(c.symbol)
    );
  }

  if (filter === "GAINERS") {
    filteredCoins = [...filteredCoins]
      .sort(
        (a, b) =>
          parseFloat(b.priceChangePercent) -
          parseFloat(a.priceChangePercent)
      )
      .slice(0, 20);
  }

  if (filter === "LOSERS") {
    filteredCoins = [...filteredCoins]
      .sort(
        (a, b) =>
          parseFloat(a.priceChangePercent) -
          parseFloat(b.priceChangePercent)
      )
      .slice(0, 20);
  }

  const sortedCoins = [...filteredCoins].sort((a, b) => {
    const valA =
      sortKey === "symbol"
        ? a.symbol
        : parseFloat(a[sortKey]);

    const valB =
      sortKey === "symbol"
        ? b.symbol
        : parseFloat(b[sortKey]);

    if (sortKey === "symbol") {
      return ascending
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    return ascending ? valA - valB : valB - valA;
  });

  const handleSort = (key) => {
    if (sortKey === key) {
      setAscending(!ascending);
    } else {
      setSortKey(key);
      setAscending(false);
    }
  };

  const toggleWatchlist = (symbol) => {
    let updated;

    if (watchlist.includes(symbol)) {
      updated = watchlist.filter((s) => s !== symbol);
    } else {
      updated = [...watchlist, symbol];
    }

    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };

  const topGainer = [...coins].sort(
    (a, b) =>
      parseFloat(b.priceChangePercent) -
      parseFloat(a.priceChangePercent)
  )[0];

  const topLoser = [...coins].sort(
    (a, b) =>
      parseFloat(a.priceChangePercent) -
      parseFloat(b.priceChangePercent)
  )[0];

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        p: 2,
      }}
    >
      <Typography variant="h4" sx={{ color: "#00ff9d", fontWeight: "bold", mb: 2 }}>
        🚀 BlockNova Market
      </Typography>

      {/* STATUS */}
      <Box sx={{ mb: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Updating...</Typography>
          </Box>
        ) : (
          <Chip label="🟢 Live Market" color="success" />
        )}
      </Box>

      {/* GAINERS / LOSERS */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: "#00ff9d22" }}>
            <CardContent>
              <Typography>
                🚀 {topGainer?.symbol}
              </Typography>
              <Typography variant="h5">
                +{parseFloat(topGainer?.priceChangePercent || 0).toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: "#ff4d4f22" }}>
            <CardContent>
              <Typography>
                🔻 {topLoser?.symbol}
              </Typography>
              <Typography variant="h5">
                {parseFloat(topLoser?.priceChangePercent || 0).toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FILTER + SEARCH */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <ButtonGroup>
          {["ALL", "FAV", "GAINERS", "LOSERS"].map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              variant={filter === f ? "contained" : "outlined"}
            >
              {f}
            </Button>
          ))}
        </ButtonGroup>

        <TextField
          placeholder="Search BTC, ETH..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
      </Box>

      {/* TABLE */}
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>⭐</TableCell>
              <TableCell onClick={() => handleSort("symbol")}>
                Pair
              </TableCell>
              <TableCell onClick={() => handleSort("lastPrice")}>
                Price
              </TableCell>
              <TableCell>24h %</TableCell>
              <TableCell>Volume</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedCoins.map((coin) => (
              <TableRow
                key={coin.symbol}
                hover
                onClick={() => navigate(`/trade/${coin.symbol}`)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    onClick={() => toggleWatchlist(coin.symbol)}
                  >
                    {watchlist.includes(coin.symbol) ? (
                      <Star color="warning" />
                    ) : (
                      <StarBorder />
                    )}
                  </IconButton>
                </TableCell>

                <TableCell>{coin.symbol}</TableCell>
                <TableCell>${parseFloat(coin.lastPrice).toFixed(2)}</TableCell>

                <TableCell>
                  <Chip
                    label={`${parseFloat(coin.priceChangePercent).toFixed(2)}%`}
                    color={
                      parseFloat(coin.priceChangePercent) > 0
                        ? "success"
                        : "error"
                    }
                  />
                </TableCell>

                <TableCell>
                  {parseFloat(coin.volume).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}