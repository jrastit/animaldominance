// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { CardAdmin, UserCard } from "./CardAdmin.sol";

struct TradeUserCard {
    uint64 userId;
    uint32 userCardId;
    uint price;
}

struct TradeUserCardLevel {
    TradeUserCard[] tradeUserCardList;
}

contract Trading {
    ///////////////////////////////// contract ///////////////////////////////////////
    address payable private owner;
    CardAdmin cardAdmin;

    constructor(
        CardAdmin _cardAdmin
    ) {
        _updateCardAdmin(_cardAdmin);
        owner = payable( msg.sender);
    }

    modifier isOwner() {
     require(msg.sender == owner, "Not owner");
        _;
    }

    modifier isCardAdmin() {
     require(address(msg.sender) == address(cardAdmin));
        _;
    }

    function updateCardAdmin(CardAdmin _cardAdmin) public isOwner {
        _updateCardAdmin(_cardAdmin);
    }

    function _updateCardAdmin(CardAdmin _cardAdmin) private {
        require(address(_cardAdmin) != address(0), "cardAdmin is null");
        cardAdmin = _cardAdmin;
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

    function addUserCard(uint64 _userId, uint32 _userCardId, uint _price) public isCardAdmin {
        UserCard memory userCard = cardAdmin.getUserCard(_userId, _userCardId);
        uint32 cardId = userCard.cardId;
        uint8 level = cardAdmin.getLevel(userCard.exp);
        require(cardId > 0, 'Wrong card');
        tradeCartList[cardId][level].tradeUserCardList.push(TradeUserCard(_userId, _userCardId, _price));
        emit TradeAdd(cardId, level, _userId, _userCardId, _price);
    }

    function removeUserCard(uint64 _userId, uint32 _userCardId) public isCardAdmin {
        UserCard memory userCard = cardAdmin.getUserCard(_userId, _userCardId);
        uint32 cardId = userCard.cardId;
        uint8 level = cardAdmin.getLevel(userCard.exp);
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
