// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { GameManager, UserCard } from "./GameManager.sol";

struct TradeUserCard {
    uint64 userId;
    uint32 userCardId;
    uint price;
}

struct TradeUserCardLevel {
    TradeUserCard[] tradeUserCardList;
}

contract Trading {

    uint256 public contractHash;

    ///////////////////////////////// contract ///////////////////////////////////////
    address payable private owner;
    GameManager gameManager;

    constructor(
        GameManager _gameManager,
        uint256 _contractHash
    ) {
        _updateGameManager(_gameManager);
        owner = payable( msg.sender);
        contractHash = _contractHash;
    }

    modifier isOwner() {
     require(msg.sender == owner, "Not owner");
        _;
    }

    modifier isGameManager() {
     require(address(msg.sender) == address(gameManager));
        _;
    }

    function updateGameManager(GameManager _gameManager) public isOwner {
        _updateGameManager(_gameManager);
    }

    function _updateGameManager(GameManager _gameManager) private {
        require(address(_gameManager) != address(0), "gameManager is null");
        gameManager = _gameManager;
    }

    //////////////////////////////// Trade ////////////////////////////////////////////////

    mapping(uint32 => TradeUserCardLevel[6]) tradeCartList;

    event TradeAdd(uint32 cardId, uint8 level, uint64 userId, uint32 userCardId, uint price);
    event TradeRemove(uint32 cardId, uint8 level, uint64 userId, uint32 userCardId);

    function getCardLevelTradeLength(uint32 cardId, uint8 level) public view returns (uint32){
        return uint32(tradeCartList[cardId][level].tradeUserCardList.length);
    }

    function getTrade(uint32 cardId, uint8 level, uint32 tradeId) public view returns (TradeUserCard memory){
        return tradeCartList[cardId][level].tradeUserCardList[tradeId];
    }

    function addUserCard(uint64 _userId, uint32 _userCardId, uint _price) public isGameManager {
        UserCard memory userCard = gameManager.getUserCard(_userId, _userCardId);
        uint32 cardId = userCard.cardId;
        uint8 level = gameManager.getLevel(userCard.exp);
        require(cardId > 0, 'Wrong card');
        tradeCartList[cardId][level].tradeUserCardList.push(TradeUserCard(_userId, _userCardId, _price));
        emit TradeAdd(cardId, level, _userId, _userCardId, _price);
    }

    function removeUserCard(uint64 _userId, uint32 _userCardId) public isGameManager {
        UserCard memory userCard = gameManager.getUserCard(_userId, _userCardId);
        uint32 cardId = userCard.cardId;
        uint8 level = gameManager.getLevel(userCard.exp);
        TradeUserCard[] storage tradeUserCardList = tradeCartList[cardId][level].tradeUserCardList;
        for (uint32 i; i < tradeUserCardList.length; i++){
            if (tradeUserCardList[i].userId == _userId && tradeUserCardList[i].userCardId == _userCardId){
              tradeUserCardList[i] = tradeUserCardList[tradeUserCardList.length - 1];
              tradeUserCardList.pop();
              emit TradeRemove(cardId, level, _userId, _userCardId);
              return;
            }
        }
    }
}
