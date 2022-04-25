// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { PlayGame } from "./PlayGame.sol";
import { PlayGameFactory } from "./PlayGameFactory.sol";

struct User {
    uint id;
    string name;
    int totem;
    int rank;
    UserCard[] cardList;
    GameDeck[] deckList;
}

struct Card {
    uint id;
    string name;
    int mana;
    int family;
    int starter;
    CardLevel[6] level;
}

struct CardLevel {
    uint level;
    string description;
    int life;
    int attack;
}

struct UserCard {
    uint cardId;
    int exp;
}

struct GameDeck {
    uint[20] userCardList;
}

struct Game {
    uint userId1;
    uint userId2;
    uint userDeck1;
    uint userDeck2;
    uint state;
    PlayGame playGame;
}

contract CardAdmin {

    event CardCreated(uint id);

    event GameCreated(uint id, uint userId);

    event GameFill(uint id, uint userId);

    event GameEnd(uint id);

    address private owner;

    PlayGameFactory playGameFactory;

    uint public userId;
    uint public cardId;
    uint public gameId;
    mapping(uint => User) public userIdList;
    mapping(address => uint) public userAddressList;
    mapping(string => uint) public userNameList;
    mapping(uint => Card) public cardList;
    mapping(uint => Game) public gameList;

    function getCardLevel(uint _cardId, uint _level) public view returns (CardLevel memory) {
      return cardList[_cardId].level[_level];
    }

    function getCard(uint _cardId) public view returns (Card memory) {
        return cardList[_cardId];
    }

    function getUserCardList(uint _userId) public view returns (UserCard[] memory){
      return userIdList[_userId].cardList;
    }

    function getUserDeckLength(uint _userId) public view returns (uint){
      return userIdList[_userId].deckList.length;
    }

    function getUserDeckCard(uint _userId, uint _deckId) public view returns (uint[20] memory){
      return userIdList[_userId].deckList[_deckId].userCardList;
    }

    modifier isOwner() {
     require(msg.sender == owner, "Not owner");
        _;
    }

    modifier isUser() {
     require(userAddressList[msg.sender] != 0, "not registered");
        _;
    }

    constructor(PlayGameFactory _playGameFactory) {
        _updatePlayGameFactory(_playGameFactory);
        owner = msg.sender;
    }

    function _updatePlayGameFactory(PlayGameFactory _playGameFactory) private {
        require(address(_playGameFactory) != address(0), "playGameFactory is null");
        playGameFactory = _playGameFactory;
    }

    function updatePlayGameFactory(PlayGameFactory _playGameFactory) public isOwner {
        _updatePlayGameFactory(_playGameFactory);
    }

    function registerUser(address _userAddress, string memory _name) private {
        require(userAddressList[_userAddress] == 0, "already registered");
        require(userNameList[_name] == 0, "name exist");
        userId = userId + 1;
        userAddressList[_userAddress] = userId;
        userNameList[_name] = userId;
        userIdList[userId].id = userId;
        userIdList[userId].name = _name;
    }

    function registerUserSelf(string memory _name) public {
        registerUser(msg.sender, _name);
    }

    function createCard(string memory _name, int _mana, int _family, int _starter) public isOwner {
        cardId = cardId + 1;
        cardList[cardId].id = cardId;
        updateCard(cardId, _name, _mana, _family, _starter);
    }

    function updateCard(uint _cardId, string memory _name, int _mana, int _family, int _starter) public isOwner {
        cardList[_cardId].name = _name;
        cardList[_cardId].mana = _mana;
        cardList[_cardId].family = _family;
        cardList[_cardId].starter = _starter;
        emit CardCreated(_cardId);
    }

    function setCardLevel(uint _cardId, string memory _description, uint _level, int _life, int _attack) public isOwner {
        cardList[_cardId].level[_level].description = _description;
        cardList[_cardId].level[_level].life = _life;
        cardList[_cardId].level[_level].attack = _attack;
    }

    function addUserCard(uint _userId, uint _cardId) private {
        UserCard memory userCard = UserCard(_cardId, 0);
        userIdList[_userId].cardList.push(userCard);
    }

    function addUserStarterCard(uint _userId) public {
        require(userIdList[_userId].cardList.length == 0, "Already have card");
        for (uint i = 1; i <= cardId; i++) {
            int starter = cardList[i].starter;
            while(starter > 0) {
                addUserCard(_userId, i);
                starter = starter - 1;
            }
        }
    }

    function addGameDeck(uint _userId, uint[20] memory _userCardList) private {
      GameDeck memory gameDeck;
      gameDeck.userCardList = _userCardList;
      userIdList[_userId].deckList.push(gameDeck);
    }

    function addGameDeckSelf(uint[20] memory _userCardList) public isUser {
      addGameDeck(userAddressList[msg.sender], _userCardList);
    }

    function getUserCardLevel(uint _userId, uint _userCardId) public view returns(uint){
        int exp = userIdList[_userId].cardList[_userCardId].exp;
        if (exp < 10) return 0;
        if (exp < 100) return 1;
        if (exp < 1000) return 2;
        if (exp < 10000) return 3;
        if (exp < 100000) return 4;
        return 5;
    }

    //Game creation
    function joinGamePos(uint _gameId, uint _userId, uint _gameDeckId, bool _pos) private {
        Game storage game = gameList[_gameId];
        if (_pos){
            game.userId1 = _userId;
            game.userDeck1 = _gameDeckId;
        } else {
            game.userId2 = _userId;
            game.userDeck2 = _gameDeckId;
        }
    }

    function createGame(uint _userId, uint _gameDeckId) private {
        gameId = gameId + 1;
        joinGamePos(gameId, _userId, _gameDeckId, true);
        gameList[gameId].state = 1;
        emit GameCreated(gameId, _userId);
    }

    function createGameSelf(uint _gameDeckId) public isUser {
        createGame(userAddressList[msg.sender], _gameDeckId);
    }

    function joinGame(uint _gameId, uint _userId, uint _gameDeckId) private {
        require(gameList[_gameId].userId2 == 0, "Game is full");
        joinGamePos(_gameId, _userId, _gameDeckId, false);
        Game storage game = gameList[_gameId];
        game.state = 2;
        game.playGame = playGameFactory.newGame(
            this,
            game.userId1,
            game.userDeck1,
            game.userId2,
            game.userDeck2,
            gameId
        );
        emit GameFill(gameId, _userId);
    }

    function joinGameSelf(uint _gameId, uint _gameDeckId) public isUser {
        joinGame(_gameId, userAddressList[msg.sender], _gameDeckId);
    }

    function endGame(uint _gameId) public {
        require(gameList[_gameId].state == 2);
        require(gameList[_gameId].playGame.getWinner() != 0);
        gameList[_gameId].state = 3;
        emit GameEnd(_gameId);
    }

}
