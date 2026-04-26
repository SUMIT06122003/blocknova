import { Contract } from "ethers";
import { getSigner } from "./wallet";

const CONTRACT_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138";

const ABI = [
  "function placeTrade(string memory symbol, uint amount, bool isBuy)",
];

export const placeTradeOnChain = async (symbol, amount, isBuy) => {
  try {
    const signer = await getSigner();
    const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

    const gas = await contract.placeTrade.estimateGas(
      symbol,
      amount,
      isBuy
    );

    const tx = await contract.placeTrade(symbol, amount, isBuy, {
      gasLimit: gas,
    });

    await tx.wait();
    return tx.hash;
  } catch (err) {
    console.error(err);
    return null;
  }
};