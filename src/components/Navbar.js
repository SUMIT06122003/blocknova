import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  AccountBalanceWallet,
  PowerSettingsNew,
} from "@mui/icons-material";
import logo from "../assets/logo.jpeg";

export default function Navbar({
  account,
  balance,
  usdtValue,
  onConnect,
  onDisconnect,
}) {
  return (
    <AppBar position="static" sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
      <Toolbar>
        {/* LOGO */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Avatar src={logo} alt="logo" sx={{ mr: 2, width: 40, height: 40 }} />
          <Typography variant="h6" component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            BlockNova
          </Typography>
        </Box>

        {/* WALLET */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {account ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<AccountBalanceWallet />}
                label={`${account.slice(0, 6)}...${account.slice(-4)}`}
                variant="outlined"
                sx={{ color: 'text.secondary' }}
              />
              <Chip
                label={`${parseFloat(balance).toFixed(4)} ETH`}
                sx={{ bgcolor: 'primary.main', color: 'black' }}
              />
              {usdtValue > 0 && (
                <Chip
                  label={`$${usdtValue} USDT`}
                  variant="outlined"
                  sx={{ color: 'secondary.main' }}
                />
              )}
              <IconButton
                onClick={onDisconnect}
                sx={{ color: 'error.main' }}
                title="Disconnect"
              >
                <PowerSettingsNew />
              </IconButton>
            </Box>
          ) : (
            <Button
              variant="contained"
              startIcon={<AccountBalanceWallet />}
              onClick={onConnect}
              sx={{
                bgcolor: 'linear-gradient(90deg, #00ff9d, #00c3ff)',
                '&:hover': { bgcolor: 'primary.main' }
              }}
            >
              Connect Wallet
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}