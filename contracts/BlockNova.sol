// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BlockNova {

    struct Trade {
        address user;
        string symbol;
        uint amount;
        bool isBuy;
        uint timestamp;
    }

    Trade[] public trades;

    event TradeExecuted(
        address indexed user,
        string symbol,
        uint amount,
        bool isBuy,
        uint timestamp
    );

    function placeTrade(
        string memory symbol,
        uint amount,
        bool isBuy
    ) public {

        trades.push(
            Trade(
                msg.sender,
                symbol,
                amount,
                isBuy,
                block.timestamp
            )
        );

        emit TradeExecuted(
            msg.sender,
            symbol,
            amount,
            isBuy,
            block.timestamp
        );
    }

    function getTrades() public view returns (Trade[] memory) {
        return trades;
    }
}