// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { GameManager } from "./GameManager.sol";
import { PlayGame, GameCard } from "./PlayGame.sol";
import { PlayGameFactory } from "./PlayGameFactory.sol";
import { PlayActionLib } from "./PlayActionLib.sol";
import { PlayBot } from "./PlayBot.sol";

struct Game {
    uint64 userId1;
    uint64 userId2;
    uint16 userDeck1;
    uint16 userDeck2;
    uint64 winner;
    bool ended;
    PlayGame playGame;
    uint256 playGameHash;
}

contract GameList {

    modifier isOwner() {
        gameManager.checkOwner();
        _;
    }

    /////////////////// imported event //////////////////////////////

    event GameUpdate(uint16 version);

    event PlayAction(uint8 turn, uint8 id, uint8 gameCardId, uint8 actionTypeId, uint8 dest, uint16 result);
    event DrawCard(uint8 turn, uint8 id, uint8 gameCardId);

    ///////////////////////// contract /////////////////////////////////////

    uint256 public contractHash;

    constructor(
        GameManager _gameManager,
        PlayGameFactory _playGameFactory,
        PlayActionLib _playActionLib,
        uint256 _contractHash
    ) {
        contractHash = _contractHash;
        _updateGameManager(_gameManager);
        _updatePlayGameFactory(_playGameFactory);
        _updatePlayActionLib(_playActionLib);
    }

    ///////////////////////// GameManager ////////////////////////////////
    GameManager public gameManager;

    function _updateGameManager(GameManager _gameManager) private {
        require(address(_gameManager) != address(0), "GameManager is null");
        gameManager = _gameManager;
    }

    function updateGameManager(GameManager _gameManager) public isOwner {
        _updateGameManager(_gameManager);
    }

    ///////////////////////// ActionLib //////////////////////////////////

    PlayActionLib public playActionLib;

    function _updatePlayActionLib(PlayActionLib _playActionLib) private {
        require(address(_playActionLib) != address(0), "PlayActionLib is null");
        playActionLib = _playActionLib;
    }

    function updatePlayActionLib(PlayActionLib _playActionLib) public isOwner {
        _updatePlayActionLib(_playActionLib);
    }

    ///////////////////////// Game Factory //////////////////////////////////

    PlayGameFactory public playGameFactory;

    function _updatePlayGameFactory(PlayGameFactory _playGameFactory) private {
        require(address(_playGameFactory) != address(0), "playGameFactory is null");
        playGameFactory = _playGameFactory;
    }

    function updatePlayGameFactory(PlayGameFactory _playGameFactory) public isOwner {
        _updatePlayGameFactory(_playGameFactory);
    }

    ///////////////////////// Games /////////////////////////////////////////

    event GameCreated(uint64 id, uint64 userId);
    event GameCreatedBot(uint64 id, uint64 userId);
    event GameFill(uint64 id, uint64 userId);
    event GameEnd(uint64 id, uint64 winner);

    uint64 public gameLastId;
    mapping(uint64 => Game) public gameList;
    mapping(uint64 => uint64) public gameUserList;

    function _joinGamePos(uint64 _gameId, uint64 _userId, uint16 _gameDeckId, bool _pos) private {
        Game storage game = gameList[_gameId];
        if (_pos){
            game.userId1 = _userId;
            game.userDeck1 = _gameDeckId;
        } else {
            game.userId2 = _userId;
            game.userDeck2 = _gameDeckId;
        }
    }

    function _createGame(uint64 _userId, uint16 _gameDeckId) private {
        require(gameUserList[_userId] == 0, 'user already in game');
        gameManager.checkDeck(_userId, _gameDeckId);
        gameLastId = gameLastId + 1;
        _joinGamePos(gameLastId, _userId, _gameDeckId, true);
        gameUserList[_userId] = gameLastId;
    }

    function _createGameBot(uint64 _userId, uint16 _gameDeckId, PlayBot playBot) private {
        require(address(playBot) != address(0), 'Bot not found');
        _createGame(_userId, _gameDeckId);
        gameList[gameLastId].playGame = playGameFactory.newGame(
            gameManager,
            _userId,
            _gameDeckId,
            0,
            _gameDeckId,
            gameLastId,
            playBot
        );
        gameUserList[_userId] = gameLastId;
        emit GameCreatedBot(gameLastId, _userId);
    }

    function createGameSelf(uint16 _gameDeckId) public {
        uint64 userId = gameManager.getUserId(msg.sender);
        _createGame(userId, _gameDeckId);
        emit GameCreated(gameLastId, userId);
    }

    function createGameBotSelf(uint16 _gameDeckId, uint256 _playBotHash) public {
        _createGameBot(gameManager.getUserId(msg.sender), _gameDeckId, playBotMap[_playBotHash]);
    }

    function cancelGame() public {
        uint64 _userId = gameManager.getUserId(msg.sender);
        uint64 _gameId = gameUserList[_userId];
        require(gameList[_gameId].userId2 == 0, "Player has join");
        gameList[_gameId].ended = true;
        gameUserList[_userId] = 0;
        emit GameEnd(_gameId, _userId);
    }

    function _joinGame(uint64 _gameId, uint64 _userId, uint16 _gameDeckId) private {
        require(address(gameList[_gameId].playGame) == address(0), "Game is full");
        require(!gameList[_gameId].ended, "Game is ended");
        require(gameUserList[_userId] == 0, 'user already in game');
        gameManager.checkDeck(_userId, _gameDeckId);
        _joinGamePos(_gameId, _userId, _gameDeckId, false);
        Game storage game = gameList[_gameId];
        game.playGame = playGameFactory.newGame(
            gameManager,
            game.userId1,
            game.userDeck1,
            game.userId2,
            game.userDeck2,
            _gameId,
            PlayBot(address(0))
        );
        gameUserList[_userId] = _gameId;
        emit GameFill(_gameId, _userId);
    }

    function joinGameSelf(uint64 _gameId, uint16 _gameDeckId) public {
        _joinGame(_gameId, gameManager.getUserId(msg.sender), _gameDeckId);
    }

    /////////////////////////////////// End game ///////////////////////////////

    function endGame(uint64 _gameId) public {
        Game storage game = gameList[_gameId];
        require(!game.ended);
        require(game.playGame.ended());
        uint64 winner = game.playGame.winner();
        game.winner = winner;
        gameManager.addCardExp(game.userId1, game.userDeck1, game.playGame);
        gameUserList[game.userId1] = 0;
        if (game.userId2 != 0){
          gameManager.addCardExp(game.userId2, game.userDeck2, game.playGame);
          gameUserList[game.userId2] = 0;
        }
        emit GameEnd(_gameId, winner);
    }

    //////////////////////////////////////////// Bot ////////////////////////////////////////////

    mapping(uint256 => PlayBot) public playBotMap;

    function addBot(uint256 _contractHash, PlayBot bot) public {
        require(address(playBotMap[_contractHash]) == address(0), 'Bot already exist');
        playBotMap[_contractHash] = bot;
    }

}
