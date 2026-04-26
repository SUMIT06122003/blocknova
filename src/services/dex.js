import { Contract, parseEther } from "ethers";
import { getSigner } from "./wallet";
import { ROUTER_ADDRESS } from "../contracts/dex";

const ABI = [
  "function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) payable returns (uint256 amountOut)"
];

export const swapETHtoToken = async (amount) => {
  try {
    const signer = await getSigner();

    const contract = new Contract(ROUTER_ADDRESS, ABI, signer);

    const params = {
      tokenIn: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      tokenOut: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      fee: 3000,
      recipient: await signer.getAddress(),
      deadline: Math.floor(Date.now() / 1000) + 60 * 10,
      amountIn: parseEther(amount),
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    };

    const tx = await contract.exactInputSingle(params, {
      value: parseEther(amount),
    });

    await tx.wait();

    return tx.hash;
  } catch (err) {
    console.error("DEX swap error:", err);
    return null;
  }
};