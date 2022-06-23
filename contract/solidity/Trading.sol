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
    GameManager gameManager;

    constructor(
        GameManager _gameManager,
        uint256 _contractHash
    ) {
        _updateGameManager(_gameManager);
        contractHash = _contractHash;
    }

    function checkOwner(address _sender) public view {
        gameManager.checkOwner(_sender);
    }

    modifier isOwner() {
        checkOwner(msg.sender);
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

    function getAllCardTrade() public view returns (TradeUserCard[][][] memory){
      uint32 lastId = gameManager.cardList().cardLastId();
      TradeUserCard[][][] memory ret = new TradeUserCard[][][](lastId);
      for (uint32 cardId = 0; cardId < lastId; cardId++){
        ret[cardId] = new TradeUserCard[][](6);
        for (uint8 level = 0; level < 6; level++){
          ret[cardId][level] = tradeCartList[cardId][level].tradeUserCardList;
        }
      }
      return ret;
    }

    function getAllCardTradeLength() public view returns (uint32[][] memory){
      uint32 lastId = gameManager.cardList().cardLastId();
      uint32[][] memory ret = new uint32[][](lastId);

      for (uint32 cardId = 0; cardId < lastId; cardId++){
        ret[cardId] = new uint32[](6);
        for (uint8 level = 0; level < 6; level++){
          ret[cardId][level] = uint32(tradeCartList[cardId][level].tradeUserCardList.length);
        }
      }
      return ret;
    }

    function getCardLevelTradeLength(uint32 cardId, uint8 level) public view returns (uint32){
        return uint32(tradeCartList[cardId - 1][level].tradeUserCardList.length);
    }

    function getTrade(uint32 cardId, uint8 level, uint32 tradeId) public view returns (TradeUserCard memory){
        return tradeCartList[cardId - 1][level].tradeUserCardList[tradeId];
    }

    function addUserCard(
        uint32 _cardId,
        uint8 _level,
        uint64 _userId,
        uint32 _userCardId,
        uint _price
    ) public isGameManager {
        tradeCartList[_cardId - 1][_level].tradeUserCardList.push(
            TradeUserCard(_userId, _userCardId, _price
        ));
        emit TradeAdd(_cardId, _level, _userId, _userCardId, _price);
    }

    function removeUserCard(
        uint32 _cardId,
        uint8 _level,
        uint64 _userId,
        uint32 _userCardId
    ) public isGameManager {
        TradeUserCard[] storage tradeUserCardList = tradeCartList[_cardId - 1][_level].tradeUserCardList;
        for (uint32 i; i < tradeUserCardList.length; i++){
            if (tradeUserCardList[i].userId == _userId && tradeUserCardList[i].userCardId == _userCardId){
              tradeUserCardList[i] = tradeUserCardList[tradeUserCardList.length - 1];
              tradeUserCardList.pop();
              emit TradeRemove(_cardId, _level, _userId, _userCardId);
              return;
            }
        }
    }
}
