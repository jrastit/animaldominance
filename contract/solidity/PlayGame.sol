// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { Card, GameManager, GameDeck, UserCard } from "./GameManager.sol";
import { PlayActionLib } from "./PlayActionLib.sol";

struct GameCard {
    uint64 userId;
    uint32 userCardId;
    uint32 cardId;
    uint16 life;
    uint16 attack;
    uint64 exp;
    uint64 expWin;
    uint8 mana;
    uint8 turn;
}

struct GameUser {
    uint64 userId;
    uint16 life;
    uint32[] cardIdList;
    GameCard[36] cardList;
    mapping(uint32 => uint64) expWin;
}

contract PlayGame {

    constructor(
      GameManager _gameManager,
      uint64 _userId1,
      uint16 _gameDeckId1,
      uint64 _userId2,
      uint16 _gameDeckId2,
      uint64 _gameId
    ) {
        gameManager = _gameManager;
        playActionLib = _gameManager.playActionLib();
        uint8 pos = (random8(2) == 1) ? 0 : 1;
        _loadCard(_userId1, _gameDeckId1, pos);
        _loadCard(_userId2, _gameDeckId2, 1 - pos);
        latestTime = block.timestamp;
        gameId = _gameId;
        _drawRandomCard(0);
        _drawRandomCard(0);
        _drawRandomCard(0);
        if (gameUser[0].userId == 0) {
          _playRandomly(0);
          _endTurn(0);
        }
    }

    ///////////////////////////// imported event /////////////////////////
    event GameCreated(uint64 id, uint64 userId);
    event GameCreatedBot(uint64 id, uint64 userId);
    event GameFill(uint64 id, uint64 userId);
    event GameEnd(uint64 id, uint64 winner);

    ///////////////////////////// resource /////////////////////////
    GameManager gameManager;
    PlayActionLib playActionLib;

    ///////////////////////////// game /////////////////////////
    uint64 public gameId;
    GameUser[2] public gameUser;

    uint8 public turn = 1;
    uint256 public latestTime = block.timestamp;
    uint64 public winner = 0;
    bool public ended = false;

    uint8 private actionId = 0;
    uint8 public mana = 1;

    event GameUpdate(uint16 version);

    /////////////////////////// Version /////////////////////////////

    uint16 public version = 0;

    function _updateVersion() private {
        version = version + 1;
        latestTime = block.timestamp;
        emit GameUpdate(version);
    }

    /////////////////////////// View //////////////////////////////

    function getGameFull() public view returns (
      uint64,
      uint64,
      uint64,
      uint16,
      uint16,
      uint32[] memory,
      uint32[] memory,
      GameCard[36] memory,
      GameCard[36] memory,
      uint256,
      uint16,
      uint8,
      uint64,
      bool
    ) {
      return (
        gameId,
        gameUser[0].userId,
        gameUser[1].userId,
        gameUser[0].life,
        gameUser[1].life,
        gameUser[0].cardIdList,
        gameUser[1].cardIdList,
        gameUser[0].cardList,
        gameUser[1].cardList,
        latestTime,
        version,
        turn,
        winner,
        ended
      );
    }

    function getNewGameCardFromId(uint64 _userId, uint8 _gameCardId) public view returns (GameCard memory){
      uint8 pos = 0;
      if (_userId == gameUser[1].userId){
        pos = 1;
      }
      if (_userId == 0){
        _userId = gameUser[1 - pos].userId;
      }
      return playActionLib.getGameCard(gameManager, _userId, gameUser[pos].cardList[_gameCardId].userCardId);
    }

    function getGameCardList(uint8 _pos) public view returns (GameCard[36] memory){
        return gameUser[_pos].cardList;
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

    ////////////////////////////// Step ///////////////////////////////////
    function _checkPlayer(uint8 _turn) private view returns (uint8 pos){
      uint64 userId = gameManager.userAddressList(msg.sender);
      pos = 1 - (turn % 2);
      require(!ended, 'Already ended');
      require(turn == _turn, 'Wrong turn');
      require(userId != 0, 'user not found');
      require(userId == gameUser[pos].userId, 'Wrong user');
    }

    function playStep(uint8 _turn, uint8[3] memory _action) public {
      uint8 pos = _checkPlayer(_turn);
      _playAction(pos, _action[0], _action[1], _action[2]);
      _updateVersion();
    }

    /////////////////////////////// Turn ////////////////////////////////////

    function _endTurn(uint8 _pos) public {
      turn = turn + 1;
      mana = (turn + 1) / 2;
      actionId = 0;
      if (gameUser[1 - _pos].cardIdList.length > 0) {
        _drawRandomCard(1 - _pos);
        if (turn == 2){
          _drawRandomCard(1 - _pos);
          _drawRandomCard(1 - _pos);
        }
      }
      emit PlayAction(turn, actionId++, 0, 0, 0, 0);
    }

    function endTurn(uint8 _turn, uint8[3][] memory _action) public {
      uint8 pos = _checkPlayer(_turn);
      for (uint8 i = 0; i < _action.length && !ended; i++){
        _playAction(pos, _action[i][0], _action[i][1], _action[i][2]);
      }
      if (!ended) {
        _endTurn(pos);
        if (gameUser[1 - pos].userId == 0 && !ended) {
          pos = 1 - pos;
          _playRandomly(pos);
          if (!ended)
          _endTurn(pos);
        }
      }
      _updateVersion();
    }

    /////////////////////////////// End ///////////////////////////////////

    function _endGame(uint64 _winner) private {
        require(!ended, 'Already ended');
        winner = _winner;
        ended = true;
        gameManager.endGame(gameId);
    }

    function endGameByTime() public {
        require(block.timestamp > latestTime + 180, 'Time not ok');
        _endGame(gameUser[(turn % 2)].userId);
        _updateVersion();
    }

    function leaveGame() public {
        uint64 userId = gameManager.userAddressList(msg.sender);
        require(userId != 0, 'user not found');
        if (userId == gameUser[0].userId){
            _endGame(gameUser[1].userId);
        } else if (userId == gameUser[1].userId){
            _endGame(gameUser[0].userId);
        }
        _updateVersion();
    }

    /////////////////////////// Action ///////////////////////////
    event PlayAction(uint8 turn, uint8 id, uint8 gameCardId, uint8 actionTypeId, uint8 dest, uint16 result);

    function random8(uint8 number) public view returns(uint8){
        //return turn % number;
        return uint8(uint(keccak256(abi.encode(blockhash(block.number-1), block.timestamp, turn, actionId)))) % number;
    }

    function _loadCard(uint64 _userId, uint16 _gameDeckId, uint8 _pos) private {
        GameUser storage user = gameUser[_pos];
        user.userId = _userId;
        user.life = 200;
        if (_userId == 0){
          _userId = gameUser[1 - _pos].userId;
        }
        uint32[20] memory gameDeckCard = gameManager.getUserDeckCard(_userId, _gameDeckId);

        require(gameDeckCard.length == 20, "not enought card");

        user.cardIdList = gameDeckCard;

    }

    function _drawRandomCard(uint8 _pos) private {
        uint32[] storage cardIdList = gameUser[_pos].cardIdList;
        if (cardIdList.length == 0) return;
        for (uint8 i = 0; i < 6; i++) {
          if (gameUser[_pos].cardList[i].cardId == 0){

            uint8 index = random8(uint8(cardIdList.length));

            uint32 userCardId = cardIdList[index];
            cardIdList[index] = cardIdList[cardIdList.length - 1];
            cardIdList.pop();

            uint64 userId = gameUser[_pos].userId;
            if (userId == 0){
              userId = gameUser[1 - _pos].userId;
            }

            gameUser[_pos].cardList[i] = playActionLib.getGameCard(gameManager, userId, userCardId);
            emit PlayAction(turn, actionId++, i, 0, 0, 1);
            return;
          }
        }
    }

    function _removeGameCard(uint8 _pos, uint8 _from, GameCard memory gameCard) private {
        //GameCard storage gameCard = gameUser[_pos].cardList[_from];
        for (uint8 i = 16; i < 36; i++){
            if (gameUser[_pos].cardList[i].cardId == 0){
                gameUser[_pos].cardList[i] = gameCard;
                gameUser[_pos].cardList[_from].cardId = 0;
                return;
            }
        }
    }

    function _playAction(
      uint8 _pos,
      uint8 _gameCardId,
      uint8 _actionTypeId,
      uint8 _dest
    ) private {
        uint16 result = 0;
        GameUser storage user = gameUser[_pos];
        GameUser storage oponent = gameUser[1 - _pos];
        GameCard memory gameCard = user.cardList[_gameCardId];
        require(gameCard.turn < turn);
        if (_actionTypeId == 1) {
            require(_gameCardId < 8, "1:Wrong carte");
            require(_dest >= 6 && _dest < 16, "1:Wrong destination");
            if (_gameCardId < 6 && gameCard.cardId != 0 && user.cardList[_dest].cardId == 0) {
                if (gameCard.mana <= mana) {
                    if (_dest >=6 && _dest < 8) {
                        require(gameCard.life == 0, '1:Error card have life');
                    } else {
                        require(gameCard.life > 0, '1:Error card have no life');
                    }
                    mana -= gameCard.mana;
                    gameCard.turn = turn;
                    result = 1;
                    user.cardList[_dest] = gameCard;
                    user.cardList[_gameCardId].cardId = 0;
                } else {
                  revert("1:Not enought mana");
                }
            } else {
              revert("1:Wrong card or dest");
            }
        } else if (_actionTypeId == 2) {
            if (_gameCardId >= 8 && _gameCardId < 16) {
                if (_dest == 255){
                    (
                        result,
                        oponent.life,
                        gameCard
                    ) = playActionLib.playActionAttackOponent(
                        gameCard,
                        oponent.life,
                        turn
                    );
                    if (oponent.life == 0){
                      _endGame(user.userId);
                    }
                } else {
                    require(_dest >= 8 && _dest < 16, "dest out of bound");
                    GameCard memory gameCard2 = oponent.cardList[_dest];
                    (
                        result,
                        gameCard,
                        gameCard2
                    ) = playActionLib.playActionAttack(
                        gameCard,
                        gameCard2,
                        turn
                    );
                    if (result != 0){
                        if (gameCard2.life == 0){
                            //oponent.cardList[_dest].cardId = 0;
                            _removeGameCard(1 - _pos, _dest, gameCard2);
                        } else {
                            oponent.cardList[_dest] = gameCard2;
                        }
                        oponent.expWin[gameCard.userCardId] = gameCard2.expWin;
                    }

                }
                if (result != 0){
                    user.expWin[gameCard.userCardId] = gameCard.expWin;
                    if (gameCard.life == 0){
                        //user.cardList[_gameCardId].cardId = 0;
                        _removeGameCard(_pos, _gameCardId, gameCard);
                    } else {
                        user.cardList[_gameCardId] = gameCard;
                    }
                }


            }
        }
        emit PlayAction(turn, actionId++, _gameCardId, _actionTypeId, _dest, result);
    }



    /////////////////////////////// Bot ///////////////////////////////////


    function _playRandomly(uint8 _pos) private {
      GameUser storage user = gameUser[_pos];
      for (uint8 i = 0; i < 16 && !ended; i++){
        GameCard storage gameCard = user.cardList[i];
        if (gameCard.cardId != 0 && gameCard.turn < turn) {
          if (i < 6) {
            if (gameCard.mana <= mana) {
                for (uint8 dest = 8; dest < 16; dest++){
                    if (user.cardList[dest].cardId == 0){
                        _playAction(_pos, i, 1, dest);
                        break;
                    }
                }
            }
          }
          if (i >= 8 && i < 16) {
            bool play = true;
            for (uint8 j = 8; play && j < 16; j++){
              if (gameUser[1 - _pos].cardList[j].cardId != 0){
                _playAction(_pos, i, 2, j);
                play = false;
              }
            }
            if (play) {
              _playAction(_pos, i, 2, 255);
            }
          }
        }
      }
    }

}
