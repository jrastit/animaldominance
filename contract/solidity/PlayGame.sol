// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { Card, CardAdmin, GameDeck, UserCard } from "./CardAdmin.sol";

struct GameCard {
    uint userId;
    uint userCardId;
    uint cardId;
    int life;
    int attack;
    int mana;
    int position;
}

contract PlayGame {

    uint gameId;

    CardAdmin cardAdmin;

    uint userId1;
    uint userId2;

    GameCard[] cardList1;
    GameCard[] cardList2;

    uint version = 0;
    uint turn = 0;

    uint latestTime = block.timestamp;

    uint winner = 0;

    event GameUpdate(uint version);

    function updateVersion() private {
        version = version + 1;
        emit GameUpdate(version);
    }

    function getWinner() public view returns (uint){
        return winner;
    }

    function random(uint number) public view returns(uint){
        return uint(keccak256(abi.encode(blockhash(block.number-1), block.timestamp, version))) % number;
    }

    function loadCard(uint _userId, uint _gameDeckId, bool _pos) public{
        if (_pos){
            userId1 = _userId;
        } else {
            userId2 = _userId;
        }

        uint[20] memory gameDeckCard = cardAdmin.getUserDeckCard(_userId, _gameDeckId);
        UserCard[] memory userCardList = cardAdmin.getUserCardList(_userId);

        for (uint i = 0; i < 20; i++){
            GameCard memory gameCard;
            gameCard.userId = _userId;
            gameCard.userCardId = gameDeckCard[i];
            gameCard.cardId = userCardList[gameCard.userCardId].cardId;
            uint level = cardAdmin.getUserCardLevel(_userId, gameCard.userCardId);
            Card memory card = cardAdmin.getCard(gameCard.cardId);
            gameCard.mana = card.mana;
            gameCard.life = card.level[level].life;
            gameCard.attack = card.level[level].attack;
            if (_pos){
                cardList1.push(gameCard);
            } else {
                cardList2.push(gameCard);
            }
        }
    }

    constructor(
      CardAdmin _cardAdmin,
      uint _userId1,
      uint _gameDeckId1,
      uint _userId2,
      uint _gameDeckId2,
      uint _gameId
    ) {
        cardAdmin = _cardAdmin;
        bool pos = (random(2) == 1) ? true : false;
        loadCard(_userId1, _gameDeckId1, pos);
        loadCard(_userId2, _gameDeckId2, !pos);
        latestTime = block.timestamp;
        gameId = _gameId;
    }

    function getGameCard(bool _pos) public view returns (GameCard[] memory){
        if (_pos) return cardList1;
        return cardList2;
    }

    function endGameByTime() public {
        require(block.timestamp - latestTime > 10);
        winner = turn % 2 == 1 ? userId2 : userId1;
        updateVersion();
        cardAdmin.endGame(gameId);
    }
}
