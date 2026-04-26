import axios from "axios";

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxNWFlOTkwMC00YzFlLTRmODQtOWM1NC00MjVmNjI5ODc1ODQiLCJlbWFpbCI6ImN1c3RvbXhmb3VuZGVyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0N2EzZWE5MGZkMGQ0MWNhNDliZSIsInNjb3BlZEtleVNlY3JldCI6IjNjMTY5N2RhZDBmMTgyZDk5Y2ZkOWM0MWYxNWE1MGQ3MTk2MmFiMTI0MTA1ZGI2ZjZhMjUwNDg2NGZkZTBkMmMiLCJleHAiOjE4MDg1NzY2ODJ9.iTW9yAwXj41oiGP4Q8qDIQDX-KTh7IWbqnFrPvX3ZJE";

export const uploadToIPFS = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
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

export const uploadJSONToIPFS = async (metadata) => {
  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          "Content-Type": "application/json",
        },
      }
    );

    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
  } catch (err) {
    console.error("IPFS JSON ERROR:", err.response?.data || err.message);
    throw err;
  }
};