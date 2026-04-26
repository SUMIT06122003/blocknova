import { BrowserProvider, formatEther } from "ethers";

// 🔌 CONNECT WALLET
export const connectWallet = async () => {
  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    return accounts[0];
  } catch (err) {
    console.error("Wallet connect error:", err);
    return null;
  }
};

// 🔑 GET SIGNER (USED BY DEX + BLOCKCHAIN)
export const getSigner = async () => {
  try {
    const provider = new BrowserProvider(window.ethereum);
    return await provider.getSigner();
  } catch (err) {
    console.error("Signer error:", err);
    return null;
  }
};

// 💰 GET REAL BALANCE
export const getWalletBalance = async (address) => {
  try {
    const provider = new BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address);
    return parseFloat(formatEther(balance));
  } catch (err) {
    console.error("Balance error:", err);
    return 0;
  }
};