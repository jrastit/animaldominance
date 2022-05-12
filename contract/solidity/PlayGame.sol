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
    uint64 expWin;
    uint8 mana;
    uint8 position;
    uint8 turn;
}

struct GameUser {
    uint64 userId;
    uint16 life;
    uint32[] cardIdList;
    GameCard[] cardList;
    mapping(uint32 => uint64) expWin;
}

contract PlayGame {

    uint64 public gameId;

    CardAdmin cardAdmin;

    GameUser[2] public gameUser;

    uint16 public version = 0;
    uint8 public turn = 1;

    uint public latestTime = block.timestamp;

    uint64 public winner = 0;
    bool public ended = false;

    event GameUpdate(uint16 version);

    event PlayAction(uint8 turn, uint8 id, uint8 gameCard, uint8 dest, uint16 result);
    event DrawCard(uint8 turn, uint8 id, GameCard gameCard);

    function _updateVersion() private {
        version = version + 1;
        latestTime = block.timestamp;
        emit GameUpdate(version);
    }

    function random8(uint8 number) public view returns(uint8){
        return uint8(uint(keccak256(abi.encode(blockhash(block.number-1), block.timestamp, version)))) % number;
    }

    function getGameCard(uint64 _userId, uint32 _userCardId) public view returns (GameCard memory){
        GameCard memory gameCard;
        gameCard.userId = _userId;
        gameCard.userCardId = _userCardId;
        UserCard memory userCard = cardAdmin.getUserCard(_userId, _userCardId);
        gameCard.cardId = userCard.cardId;
        gameCard.exp = userCard.exp;
        uint8 level = cardAdmin.getLevel(userCard.exp);
        Card memory card = cardAdmin.getCard(gameCard.cardId);
        gameCard.mana = card.mana;
        gameCard.life = card.level[level].life;
        gameCard.attack = card.level[level].attack;
        gameCard.position = 1;
        return gameCard;
    }

    function _loadCard(uint64 _userId, uint16 _gameDeckId, uint8 _pos) private {
        GameUser storage user = gameUser[_pos];
        user.userId = _userId;
        user.life = 200;
        if (_userId == 0){
          _userId = gameUser[1 - _pos].userId;
        }
        uint32[20] memory gameDeckCard = cardAdmin.getUserDeckCard(_userId, _gameDeckId);

        require(gameDeckCard.length == 20, "not enought card");

        user.cardIdList = gameDeckCard;

    }

    function _drawRandomCard(uint8 _pos, uint8 _id) private {
        uint32[] storage cardIdList = gameUser[_pos].cardIdList;
        uint32[] memory _cardIdList = gameUser[_pos].cardIdList;
        if (_cardIdList.length == 0) return;
        uint8 index = random8(uint8(_cardIdList.length));
        uint32 userCardId = _cardIdList[index];
        cardIdList[index] = _cardIdList[_cardIdList.length - 1];
        cardIdList.pop();
        uint64 userId = gameUser[_pos].userId;
        if (userId == 0){
          userId = gameUser[1 - _pos].userId;
        }
        GameCard memory gameCard = getGameCard(userId, userCardId);
        gameUser[_pos].cardList.push(gameCard);
        emit DrawCard(turn, _id, gameCard);
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
        uint8 pos = (random8(2) == 1) ? 0 : 1;
        _loadCard(_userId1, _gameDeckId1, pos);
        _loadCard(_userId2, _gameDeckId2, 1 - pos);
        latestTime = block.timestamp;
        gameId = _gameId;
        _drawRandomCard(0, 0);
        _drawRandomCard(0, 1);
        _drawRandomCard(0, 2);
        if (gameUser[0].userId == 0) {
          uint8 mana = (turn + 1) / 2;
          _playRandomly(pos, mana);
          _endTurn(pos);
        }
    }

    function _getCardNumber(uint8 _pos, uint8 _position) private view returns (uint8 j) {
        j = 0;
        GameCard[] storage cardList = gameUser[_pos].cardList;
        for (uint8 k = 0; k < cardList.length; k++){
            if (cardList[k].position == _position){
                j++;
            }
        }
    }

    function _playRandomly(uint8 _pos, uint8 _mana) private returns (uint8) {
      uint8 _i = 0;
      GameUser storage user = gameUser[_pos];
      for (uint8 i = 0; i < user.cardList.length && !ended; i++){
        GameCard memory gameCard = user.cardList[i];
        if (gameCard.turn < turn) {
          if (gameCard.position == 1) {
            if (gameCard.mana <= _mana) {
              _mana = _playAction(_pos, _i++, _mana, i, 3);
            }
          }
          if (gameCard.position == 3) {
            bool play = true;
            for (uint8 j = 0; play && j < gameUser[1 - _pos].cardList.length; j++){
              if (gameUser[1 - _pos].cardList[j].position == 3){
                _mana = _playAction(_pos, _i++, _mana, i, j);
                play = false;
              }
            }
            if (play) {
              _mana = _playAction(_pos, _i++, _mana, i, 255);
            }
          }
        }
      }
      return _mana;
    }

    function _playAction(uint8 _pos, uint8 _i, uint8 _mana, uint8 _gameCardId, uint8 _dest) private returns (uint8) {
        GameUser storage user = gameUser[_pos];
        require(_gameCardId < user.cardList.length, "card out of bound");
        GameCard memory gameCard = user.cardList[_gameCardId];
        require(gameCard.turn < turn);
        if (gameCard.position == 1) {
            if (gameCard.mana <= _mana) {
                if (_dest == 2) {
                    require(gameCard.life == 0, '1:Error card have life');
                    uint8 j = _getCardNumber(_pos, 2);
                    if (j < 3){
                      gameCard.position = 2;
                      _mana -= gameCard.mana;
                      gameCard.turn = turn;
                      emit PlayAction(turn, _i, _gameCardId, _dest, 1);
                    } else {
                      emit PlayAction(turn, _i, _gameCardId, _dest, 0);
                    }
                } else if (_dest == 3) {
                    require(gameCard.life > 0, '1:Error card have no life');
                    uint8 j = _getCardNumber(_pos, 3);
                    if (j < 8){
                        gameCard.position = 3;
                        _mana -= gameCard.mana;
                        gameCard.turn = turn;
                        emit PlayAction(turn, _i, _gameCardId, _dest, 1);
                    } else {
                        emit PlayAction(turn, _i, _gameCardId, _dest, 0);
                    }
                } else {
                    revert("1:Wrong destination");
                }
            } else {
                emit PlayAction(turn, _i, _gameCardId, _dest, 0);
            }
        } else if (gameCard.position == 2) {
            revert("2:not implemented");
        } else if (gameCard.position == 3) {
            if (_dest == 255){
                uint16 life = gameUser[1 - _pos].life;
                if (gameCard.attack < life){
                    gameCard.expWin += (gameCard.attack * 5);
                    gameUser[1 - _pos].life = life - gameCard.attack;
                } else {
                    gameCard.expWin += (life * 10);
                    gameUser[1 - _pos].life = 0;
                    _endGame(user.userId);
                }
                gameCard.turn = turn;
                emit PlayAction(turn, _i, _gameCardId, _dest, gameCard.attack);
            } else {
                require(_dest < gameUser[1 - _pos].cardList.length, "dest out of bound");
                GameCard memory gameCard2 = gameUser[1 - _pos].cardList[_dest];
                if (gameCard2.position == 3){
                    if (gameCard.attack < gameCard2.life){
                        gameCard.expWin += (gameCard.attack * 5);
                        gameCard2.expWin += gameCard.attack;
                        gameCard2.life -= gameCard.attack;
                    } else {
                        gameCard.expWin += (gameCard2.life * 10);
                        gameCard2.expWin += gameCard2.life;
                        gameCard2.life = 0;
                        gameCard2.position = 4;

                    }
                    if (gameCard2.attack < gameCard.life){
                        gameCard2.expWin += (gameCard2.attack * 2);
                        gameCard.expWin += gameCard2.attack;
                        gameCard.life -= gameCard2.attack;
                    } else {
                        gameCard2.expWin += (gameCard.life * 4);
                        gameCard.expWin += gameCard.life;
                        gameCard.life = 0;
                        gameCard.position = 4;
                    }
                    gameUser[_pos].expWin[gameCard.userCardId] = gameCard.expWin;
                    gameUser[1 - _pos].expWin[gameCard.userCardId] = gameCard2.expWin;
                    gameCard.turn = turn;
                    emit PlayAction(turn, _i, _gameCardId, _dest, gameCard.attack);
                } else if (gameCard.position == 4 ){
                    emit PlayAction(turn, _i, _gameCardId, _dest, 0);
                } else {
                    revert('3:Wrong destination');
                }
                gameUser[1 - _pos].cardList[_dest] = gameCard2;
            }
        } else if (gameCard.position == 4) {
            emit PlayAction(turn, _i, _gameCardId, _dest, 0);
        }
        gameUser[_pos].cardList[_gameCardId] = gameCard;
        return _mana;
    }

    function _endTurn(uint8 _pos) public {
      turn = turn + 1;
      uint8 j = _getCardNumber(_pos, 1);
      if (j < 6){
          _drawRandomCard(1 - _pos, 0);
          if (turn == 2){
              if (j <= 5) _drawRandomCard(1, 1);
              if (j <= 4) _drawRandomCard(1, 2);
          }
      }
    }

    function endTurn(uint8[2][] memory _action) public {
      require(!ended, 'Already ended');
      uint64 userId = cardAdmin.userAddressList(msg.sender);
      require(userId != 0, 'user not found');
      uint8 pos = 1 - (turn % 2);
      require(userId == gameUser[pos].userId, 'Wrong user');
      uint8 mana = (turn + 1) / 2;
      for (uint8 i = 0; i < _action.length && !ended; i++){
        mana = _playAction(pos, i, mana, _action[i][0], _action[i][1]);
      }
      _endTurn(pos);
      if (gameUser[1 - pos].userId == 0 && !ended) {
        pos = 1 - pos;
        mana = (turn + 1) / 2;
        _playRandomly(pos, mana);
        _endTurn(pos);
      }
      _updateVersion();
    }

    function getGameCardList(uint8 _pos) public view returns (GameCard[] memory){
        return gameUser[_pos].cardList;
    }

    function _endGame(uint64 _winner) private {
        require(!ended, 'Already ended');
        winner = _winner;
        ended = true;
        cardAdmin.endGame(gameId);
    }

    function endGameByTime() public {
        require(block.timestamp > latestTime + 180, 'Time not ok');
        _endGame(gameUser[(turn % 2)].userId);
        _updateVersion();
    }

    function getUserCardExp(uint8 _pos, uint32 userCardId) public view returns(uint64){
        return (gameUser[_pos].expWin[userCardId]);
    }

    function getUserPos(uint64 userId) public view returns(uint8){
        if (userId == gameUser[0].userId){
            return 0;
        }
        return 1;
    }

    function leaveGame() public {
        uint64 userId = cardAdmin.userAddressList(msg.sender);
        require(userId != 0, 'user not found');
        if (userId == gameUser[0].userId){
            _endGame(gameUser[1].userId);
        } else if (userId == gameUser[1].userId){
            _endGame(gameUser[0].userId);
        }
        _updateVersion();
    }
}
