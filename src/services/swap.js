import { BrowserProvider, parseEther } from "ethers";

const ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // Uniswap V3 Router

export const swapETHtoUSDT = async () => {
  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const tx = await signer.sendTransaction({
      to: ROUTER,
      value: parseEther("0.01"), // amount to swap
    });

    await tx.wait();

    alert("Swap executed!");
  } catch (err) {
    console.error(err);
    alert("Swap failed");
  }
};