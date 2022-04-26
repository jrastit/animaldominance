// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { Card, CardAdmin, GameDeck, UserCard } from "./CardAdmin.sol";

struct GameCard {
    uint64 userId;
    uint32 userCardId;
    uint32 cardId;
    uint16 life;
    uint16 attack;
    uint64 exp;
    uint8 mana;
    uint8 position;
}

contract PlayGame {

    uint64 public gameId;

    CardAdmin cardAdmin;

    uint64 public userId1;
    uint64 public userId2;

    uint32[] public cardIdList1;
    uint32[] public cardIdList2;

    GameCard[] public cardList1;
    GameCard[] public cardList2;

    uint16 public version = 0;
    uint8 public turn = 0;

    uint public latestTime = block.timestamp;

    uint64 public winner = 0;

    event GameUpdate(uint16 version);

    function updateVersion() private {
        version = version + 1;
        emit GameUpdate(version);
    }

    function getWinner() public view returns (uint64){
        return winner;
    }

    function random8(uint8 number) public view returns(uint8){
        return uint8(uint(keccak256(abi.encode(blockhash(block.number-1), block.timestamp, version)))) % number;
    }

    function getGameCard(uint64 _userId, uint32 _userCardId) public view returns (GameCard memory){
        GameCard memory gameCard;
        gameCard.userId = _userId;
        gameCard.userCardId = _userCardId;
        gameCard.cardId = cardAdmin.getUserCardList(_userId)[_userCardId].cardId;
        uint8 level = cardAdmin.getUserCardLevel(_userId, _userCardId);
        Card memory card = cardAdmin.getCard(gameCard.cardId);
        gameCard.exp = cardAdmin.getUserCardList(_userId)[_userCardId].exp;
        gameCard.mana = card.mana;
        gameCard.life = card.level[level].life;
        gameCard.attack = card.level[level].attack;
        return gameCard;
    }

    function loadCard(uint64 _userId, uint16 _gameDeckId, bool _pos) private {
        if (_pos){
            userId1 = _userId;
        } else {
            userId2 = _userId;
        }

        uint32[20] memory gameDeckCard = cardAdmin.getUserDeckCard(_userId, _gameDeckId);

        require(gameDeckCard.length == 20, "not enought card");

        for (uint8 i = 0; i < 20; i++){
            if (_pos){
                cardIdList1.push(gameDeckCard[i]);
            } else {
                cardIdList2.push(gameDeckCard[i]);
            }
        }
    }

    function drawRandomCard(bool _pos) private {
        uint64 userId;
        uint32[] storage cardIdList ;
        if (_pos){
            userId = userId1;
            cardIdList = cardIdList1;
        } else {
            userId = userId2;
            cardIdList = cardIdList2;
        }
        uint8 index = random8(uint8(cardIdList.length));
        uint32 userCardId = cardIdList[index];
        cardIdList[index] = cardIdList[cardIdList.length - 1];
        cardIdList.pop();
        GameCard memory gameCard = getGameCard(userId, userCardId);
        if (_pos){
            cardList1.push(gameCard);
        } else {
            cardList2.push(gameCard);
        }

    }

    constructor(
      CardAdmin _cardAdmin,
      uint64 _userId1,
      uint16 _gameDeckId1,
      uint64 _userId2,
      uint16 _gameDeckId2,
      uint64 _gameId
    ) {
        cardAdmin = _cardAdmin;
        bool pos = (random8(2) == 1) ? true : false;
        loadCard(_userId1, _gameDeckId1, pos);
        loadCard(_userId2, _gameDeckId2, !pos);
        latestTime = block.timestamp;
        gameId = _gameId;
        drawRandomCard(true);
        drawRandomCard(true);
        drawRandomCard(true);
    }

    function getGameCardList(bool _pos) public view returns (GameCard[] memory){
        if (_pos) return cardList1;
        return cardList2;
    }

    function _endGame(uint64 _winner) private {
        winner = _winner;
        updateVersion();
        cardAdmin.endGame(gameId);
    }

    function endGameByTime() public {
        require(block.timestamp - latestTime > 180);
        _endGame(turn % 2 == 1 ? userId2 : userId1);
    }

    function leaveGame() public {
        uint64 userId = cardAdmin.userAddressList(msg.sender);
        if (userId == userId1){
            _endGame(userId2);
        } else if (userId == userId2){
            _endGame(userId1);
        }
    }
}
