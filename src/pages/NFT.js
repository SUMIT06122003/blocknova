import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserProvider, Contract } from "ethers";

export default function NFT() {
  const [account, setAccount] = useState(null);
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");
  const [useLink, setUseLink] = useState(false);

  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxNWFlOTkwMC00YzFlLTRmODQtOWM1NC00MjVmNjI5ODc1ODQiLCJlbWFpbCI6ImN1c3RvbXhmb3VuZGVyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0N2EzZWE5MGZkMGQ0MWNhNDliZSIsInNjb3BlZEtleVNlY3JldCI6IjNjMTY5N2RhZDBmMTgyZDk5Y2ZkOWM0MWYxNWE1MGQ3MTk2MmFiMTI0MTA1ZGI2ZjZhMjUwNDg2NGZkZTBkMmMiLCJleHAiOjE4MDg1NzY2ODJ9.iTW9yAwXj41oiGP4Q8qDIQDX-KTh7IWbqnFrPvX3ZJE";

  const contractAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138";
  const abi = [
    "function mintNFT(address to, string memory tokenURI) public returns (uint256)",
  ];

  // 🔗 CONNECT WALLET
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("myNFTs")) || [];
    setNfts(stored);
  }, []);

  // 🌐 FILE → IPFS
  const uploadToIPFS = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: Infinity,
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
    } catch (err) {
      console.error("IPFS FILE ERROR:", err.response?.data || err.message);
      throw err;
    }
  };

  // 📄 JSON → IPFS (THIS WAS FAILING BEFORE)
  const uploadJSONToIPFS = async (metadata) => {
    try {
      const res = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: metadata,
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          "Content-Type": "application/json",
        },
      });

      return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
    } catch (err) {
      console.error("IPFS JSON ERROR:", err.response?.data || err.message);
      throw err;
    }
  };

  // 🎨 MINT NFT
  const mintNFT = async () => {
    if (!account) return alert("Connect wallet first");
    if (!file && !link) return alert("Upload file or paste link");

    try {
      setLoading(true);

      console.log("JWT length:", PINATA_JWT?.length);

      // 1️⃣ IMAGE
      const imageUrl = useLink && link ? link : await uploadToIPFS(file);
      console.log("Image URL:", imageUrl);

      // 2️⃣ METADATA
      const tokenURI = await uploadJSONToIPFS({
        name: "BlockNova NFT",
        image: imageUrl,
      });
      console.log("Token URI:", tokenURI);

      // 3️⃣ BLOCKCHAIN
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, abi, signer);

      const tx = await contract.mintNFT(account, tokenURI, {
        gasLimit: 300000,
      });

      console.log("TX:", tx.hash);
      await tx.wait();

      // 4️⃣ UI SAVE
      const updated = [...nfts, { image: imageUrl }];
      localStorage.setItem("myNFTs", JSON.stringify(updated));
      setNfts(updated);

      alert("NFT Minted 🚀");
    } catch (err) {
      console.error("MINT ERROR:", err);
      alert(err?.response?.data?.error || err?.message || "Mint failed");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>NFT Studio</h2>

      {!account ? (
        <button onClick={connectWallet} style={styles.primaryBtn}>
          Connect Wallet
        </button>
      ) : (
        <p style={styles.wallet}>
          {account.slice(0, 6)}...{account.slice(-4)}
        </p>
      )}

      {/* TOGGLE */}
      <div style={styles.tabs}>
        <button
          onClick={() => setUseLink(false)}
          style={!useLink ? styles.activeTab : styles.tab}
        >
          Upload
        </button>
        <button
          onClick={() => setUseLink(true)}
          style={useLink ? styles.activeTab : styles.tab}
        >
          Link
        </button>
      </div>

      {/* INPUT */}
      {!useLink ? (
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={styles.input}
        />
      ) : (
        <input
          type="text"
          placeholder="Paste image URL"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          style={styles.input}
        />
      )}

      {/* MINT */}
      <button onClick={mintNFT} disabled={loading} style={styles.mintBtn}>
        {loading ? "Minting..." : "Mint NFT"}
      </button>

      {/* GRID */}
      <h3 style={styles.subtitle}>My NFTs</h3>
      <div style={styles.grid}>
        {nfts.length === 0 ? (
          <p style={{ color: "#888" }}>No NFTs yet</p>
        ) : (
          nfts.map((nft, i) => (
            <div key={i} style={styles.card}>
              <img src={nft.image} alt="" style={styles.img} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    background: "#0d1117",
    minHeight: "100vh",
    color: "white",
  },
  title: { fontSize: "24px", marginBottom: "10px" },
  subtitle: { marginTop: "20px" },
  wallet: { color: "#00ff9d", marginBottom: "10px" },
  primaryBtn: {
    padding: "10px",
    background: "#238636",
    border: "none",
    color: "white",
    borderRadius: "6px",
    marginBottom: "10px",
  },
  mintBtn: {
    padding: "10px",
    background: "#9333ea",
    border: "none",
    color: "white",
    borderRadius: "6px",
    width: "100%",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    background: "#161b22",
    border: "1px solid #30363d",
    color: "white",
    borderRadius: "6px",
  },
  tabs: { display: "flex", marginBottom: "10px" },
  tab: {
    flex: 1,
    padding: "10px",
    background: "#21262d",
    border: "none",
    color: "white",
  },
  activeTab: {
    flex: 1,
    padding: "10px",
    background: "#00ff9d",
    color: "black",
    border: "none",
  },
  grid: { display: "flex", gap: "15px", flexWrap: "wrap" },
  card: {
    background: "#161b22",
    padding: "10px",
    borderRadius: "10px",
  },
  img: {
    width: "140px",
    height: "140px",
    objectFit: "cover",
    borderRadius: "6px",
  },
};