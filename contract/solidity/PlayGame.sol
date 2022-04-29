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

    event PlayAction(uint8 id, uint8 gameCard, uint8 dest, uint16 result);

    function updateVersion() private {
        version = version + 1;
        latestTime = block.timestamp;
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
        gameCard.position = 1;
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

    function playAction(bool _pos, uint8 _i, uint8 _mana, uint8 _gameCardId, uint8 _dest) private returns (uint8) {
        GameCard storage gameCard;
        if (_pos) {
            gameCard = cardList1[_gameCardId];
        } else {
            gameCard = cardList2[_gameCardId];
        }
        if (gameCard.position == 1) {
            if (gameCard.mana <= _mana) {
                _mana = _mana - gameCard.mana;
                emit PlayAction(_i, _gameCardId, _dest, 1);
                if (_dest == 2) {
                    require(gameCard.life == 0, '1:Error card have life');
                    gameCard.position = 2;
                } else if (_dest == 3) {
                    require(gameCard.life > 0, '1:Error card have no life');
                    gameCard.position = 3;
                } else {
                    revert("1:Wrong destination");
                }
            } else {
                emit PlayAction(_i, _gameCardId, _dest, 0);
            }
        } else if (gameCard.position == 2) {
            revert("2:not implemented");
        } else if (gameCard.position == 3) {
            if (_dest == 0){
                emit PlayAction(_i, _gameCardId, _dest, gameCard.attack);
            } else {
                GameCard storage gameCard2;
                if (_pos) {
                    gameCard2 = cardList2[_dest];
                } else {
                    gameCard2 = cardList1[_dest];
                }
                if (gameCard2.position == 3){
                    if (gameCard.attack > gameCard2.life){
                        gameCard2.life = gameCard2.life - gameCard.attack;
                        gameCard.exp = gameCard.exp + (gameCard.attack * 5);
                        gameCard2.exp = gameCard2.exp + gameCard.attack;
                    } else {
                        gameCard2.life = 0;
                        gameCard2.position = 4;
                        gameCard.exp = gameCard.exp + ((gameCard.attack - gameCard2.life) * 10);
                        gameCard2.exp = gameCard2.exp + (gameCard.attack - gameCard2.life);
                    }
                    emit PlayAction(_i, _gameCardId, _dest, gameCard.attack);
                } else if (gameCard.position == 4 ){
                    emit PlayAction(_i, _gameCardId, _dest, 0);
                } else {
                    revert('3:Wrong destination');
                }
            }
        } else if (gameCard.position == 4) {
            emit PlayAction(_i, _gameCardId, _dest, 0);
        }
        return _mana;
    }

    function playTurn(uint8[2][] memory _action) public {
      uint64 userId = cardAdmin.userAddressList(msg.sender);
      bool pos = (turn % 2 == 0);
      require((pos && userId == userId1) || (!pos && userId == userId2), 'Wrong user');
      uint8 mana = (turn / 2) + 1;
      for (uint8 i = 0; i < _action.length; i++){
        mana = playAction(pos, i, mana, _action[i][0], _action[i][1]);
      }
      turn = turn + 1;
      uint8 j = 0;
      if (pos){
          for (uint8 k = 0; k < cardList1.length; k++){
                if (cardList1[k].position == 1){
                  j++;
                }
            }
      } else {
          for (uint8 k = 0; k < cardList2.length; k++){
                if (cardList2[k].position == 1){
                  j++;
                }
            }
      }
      if (j < 6){
          drawRandomCard(!pos);
          if (turn == 1){
              if (j <= 5) drawRandomCard(!pos);
              if (j <= 4) drawRandomCard(!pos);
          }
      }
      updateVersion();
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
        require(block.timestamp > latestTime + 180, 'Time not ok');
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
