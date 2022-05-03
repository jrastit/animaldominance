// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { PlayGame, GameCard } from "./PlayGame.sol";
import { PlayGameFactory } from "./PlayGameFactory.sol";

struct User {
    uint64 id;
    string name;
    uint16 totem;
    uint64 rank;
    uint32 userCardListLastId;
    uint16 deckListLastId;
    mapping(uint32 => UserCard) userCardList;
    mapping(uint16 => GameDeck) deckList;
}

struct Card {
    uint32 id;
    string name;
    uint8 mana;
    uint8 family;
    uint8 starter;
    CardLevel[6] level;
}

struct CardLevel {
    uint8 level;
    string description;
    uint16 life;
    uint16 attack;
}

struct UserCard {
    uint32 cardId;
    uint64 exp;
}

struct GameDeck {
    uint32[20] userCardList;
}

struct Game {
    uint64 userId1;
    uint64 userId2;
    uint16 userDeck1;
    uint16 userDeck2;
    uint64 winner;
    PlayGame playGame;
}

contract CardAdmin {

    ///////////////////// Cards ////////////////////////////////////

    event CardCreated(uint32 id);

    uint32 public cardLastId;
    mapping(uint32 => Card) public cardList;

    function getCardLevel(uint32 _cardId, uint8 _level) public view returns (CardLevel memory) {
      return cardList[_cardId].level[_level];
    }

    function getCard(uint32 _cardId) public view returns (Card memory) {
        return cardList[_cardId];
    }

    function createCard(string memory _name, uint8 _mana, uint8 _family, uint8 _starter) public isOwner {
        cardLastId = cardLastId + 1;
        cardList[cardLastId].id = cardLastId;
        updateCard(cardLastId, _name, _mana, _family, _starter);
    }

    function createCardFull(
        string memory _name,
        uint8 _mana,
        uint8 _family,
        uint8 _starter,
        string[] memory _description,
        uint16[] memory _life,
        uint16[] memory _attack
    ) public isOwner {
        cardLastId = cardLastId + 1;
        cardList[cardLastId].id = cardLastId;
        updateCard(cardLastId, _name, _mana, _family, _starter);
        require(_description.length == _life.length && _description.length == _attack.length, 'Wrong level');
        for (uint8 i = 0; i < _description.length; i++){
            setCardLevel(cardLastId, _description[i], i, _life[i], _attack[i]);
        }
    }

    function updateCard(uint32 _cardId, string memory _name, uint8 _mana, uint8 _family, uint8 _starter) public isOwner {
        cardList[_cardId].name = _name;
        cardList[_cardId].mana = _mana;
        cardList[_cardId].family = _family;
        cardList[_cardId].starter = _starter;
        emit CardCreated(_cardId);
    }

    function setCardLevel(uint32 _cardId, string memory _description, uint8 _level, uint16 _life, uint16 _attack) public isOwner {
        cardList[_cardId].level[_level].description = _description;
        cardList[_cardId].level[_level].life = _life;
        cardList[_cardId].level[_level].attack = _attack;
    }

    ///////////////////////// contract /////////////////////////////////////

    address payable private owner;

    modifier isOwner() {
     require(msg.sender == owner, "Not owner");
        _;
    }

    function withdraw (uint _amount) public isOwner {
      owner.transfer(_amount);
    }

    constructor(PlayGameFactory _playGameFactory) {
        _updatePlayGameFactory(_playGameFactory);
        owner = payable( msg.sender);
    }

    ///////////////////////// Game Factory //////////////////////////////////

    PlayGameFactory playGameFactory;

    function _updatePlayGameFactory(PlayGameFactory _playGameFactory) private {
        require(address(_playGameFactory) != address(0), "playGameFactory is null");
        playGameFactory = _playGameFactory;
    }

    function updatePlayGameFactory(PlayGameFactory _playGameFactory) public isOwner {
        _updatePlayGameFactory(_playGameFactory);
    }

    ///////////////////////// Games /////////////////////////////////////////

    event GameCreated(uint64 id, uint64 userId);
    event GameFill(uint64 id, uint64 userId);
    event GameEnd(uint64 id, uint64 winner);

    uint64 public gameLastId;
    mapping(uint64 => Game) public gameList;

    function joinGamePos(uint64 _gameId, uint64 _userId, uint16 _gameDeckId, bool _pos) private {
        Game storage game = gameList[_gameId];
        if (_pos){
            game.userId1 = _userId;
            game.userDeck1 = _gameDeckId;
        } else {
            game.userId2 = _userId;
            game.userDeck2 = _gameDeckId;
        }
    }

    function createGame(uint64 _userId, uint16 _gameDeckId) private {
        gameLastId = gameLastId + 1;
        joinGamePos(gameLastId, _userId, _gameDeckId, true);
        emit GameCreated(gameLastId, _userId);
    }

    function createGameSelf(uint16 _gameDeckId) public isUser {
        createGame(userAddressList[msg.sender], _gameDeckId);
    }

    function cancelGame(uint64 _gameId) public isUser {
        uint64 _userId = userAddressList[msg.sender];
        require(gameList[_gameId].userId1 == _userId, "Not owner");
        require(gameList[_gameId].userId2 == 0, "Player has join");
        gameList[_gameId].winner = _userId;
        emit GameEnd(_gameId, _userId);
    }

    function joinGame(uint64 _gameId, uint64 _userId, uint16 _gameDeckId) private {
        require(gameList[_gameId].userId2 == 0, "Game is full");
        joinGamePos(_gameId, _userId, _gameDeckId, false);
        Game storage game = gameList[_gameId];
        game.playGame = playGameFactory.newGame(
            this,
            game.userId1,
            game.userDeck1,
            game.userId2,
            game.userDeck2,
            gameLastId
        );
        emit GameFill(gameLastId, _userId);
    }

    function joinGameSelf(uint64 _gameId, uint16 _gameDeckId) public isUser {
        joinGame(_gameId, userAddressList[msg.sender], _gameDeckId);
    }

    /////////////////////////////////// End game ///////////////////////////////

    function addCardExp(uint64 _userId, uint16 _userDeckId, PlayGame _playGame) private {
        uint32[20] memory gameDeckCard = getUserDeckCard(_userId, _userDeckId);
        uint8 pos = _playGame.getUserPos(_userId);
        for (uint8 i = 0; i < 20; i++){
            userIdList[_userId].userCardList[gameDeckCard[i]].exp += _playGame.getUserCardExp(pos, gameDeckCard[i]);
        }
    }

    function endGame(uint64 _gameId) public {
        require(gameList[_gameId].winner == 0);
        uint64 winner = gameList[_gameId].playGame.getWinner();
        require(winner != 0);
        gameList[_gameId].winner = winner;
        addCardExp(gameList[_gameId].userId1, gameList[_gameId].userDeck1, gameList[_gameId].playGame);
        addCardExp(gameList[_gameId].userId2, gameList[_gameId].userDeck2, gameList[_gameId].playGame);
        emit GameEnd(_gameId, winner);
    }

    //////////////////////////////////////// User //////////////////////////////////////

    uint64 public userLastId;
    mapping(uint64 => User) public userIdList;
    mapping(address => uint64) public userAddressList;
    mapping(string => uint64) public userNameList;

    modifier isUser() {
     require(userAddressList[msg.sender] != 0, "not registered");
        _;
    }

    function registerUser(address _userAddress, string memory _name) private {
        require(userAddressList[_userAddress] == 0, "already registered");
        require(userNameList[_name] == 0, "name exist");
        userLastId = userLastId + 1;
        userAddressList[_userAddress] = userLastId;
        userNameList[_name] = userLastId;
        userIdList[userLastId].id = userLastId;
        userIdList[userLastId].name = _name;
    }

    function registerUserSelf(string memory _name) public {
        registerUser(msg.sender, _name);
    }

    ///////////////////////////////////// UserCard //////////////////////////////////////

    function getUserCardList(uint64 _userId) public view returns (UserCard[] memory userCard){
        userCard = new UserCard[](userIdList[_userId].userCardListLastId);
        for (uint32 i = 1; i <= userIdList[_userId].userCardListLastId; i++){
            userCard[i - 1] = userIdList[_userId].userCardList[i];
        }
    }

    function addUserCard(uint64 _userId, uint32 _cardId) private {
        userIdList[_userId].userCardListLastId++;
        userIdList[_userId].userCardList[userIdList[_userId].userCardListLastId] = UserCard(_cardId, 0);
    }

    function buyNewCard(uint32 _cardId) public payable isUser {
        require(0 < _cardId && _cardId <= cardLastId, "Wrong card");
        if (cardList[_cardId].starter > 0) {
          require(msg.value == 1 ether, "Price is 1 ether");
        } else {
          require(msg.value == 10 ether, "Price is 10 ether");
        }
        addUserCard(userAddressList[msg.sender], _cardId);
    }

    function addUserStarterCard(uint64 _userId) public {
        require(userIdList[_userId].userCardListLastId == 0, "Already have card");
        for (uint32 i = 1; i <= cardLastId; i++) {
            uint8 starter = cardList[i].starter;
            while(starter > 0) {
                addUserCard(_userId, i);
                starter = starter - 1;
            }
        }
    }

    function getUserCardLevel(uint64 _userId, uint32 _userCardId) public view returns(uint8){
        uint64 exp = userIdList[_userId].userCardList[_userCardId].exp;
        if (exp < 10) return 0;
        if (exp < 100) return 1;
        if (exp < 1000) return 2;
        if (exp < 10000) return 3;
        if (exp < 100000) return 4;
        return 5;
    }

    ////////////////////////////////////// User Deck ///////////////////////////////////////

    function getUserDeckLength(uint64 _userId) public view returns (uint16){
       return userIdList[_userId].deckListLastId;
    }

    function getUserDeckCard(uint64 _userId, uint16 _deckId) public view returns (uint32[20] memory){
       return userIdList[_userId].deckList[_deckId].userCardList;
    }

    function addGameDeck(uint64 _userId, uint32[20] memory _userCardList) private {
      userIdList[_userId].deckListLastId++;
      userIdList[_userId].deckList[userIdList[_userId].deckListLastId].userCardList = _userCardList;
    }

    function addGameDeckSelf(uint32[20] memory _userCardList) public isUser {
      addGameDeck(userAddressList[msg.sender], _userCardList);
    }

}
