// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { Trading } from "./Trading.sol";
import { PlayGame, GameCard } from "./PlayGame.sol";
import { PlayGameFactory } from "./PlayGameFactory.sol";

struct User {
    uint64 id;
    string name;
    uint16 totem;
    uint64 rank;
    uint32 userCardListLastId;
    uint16 deckListLastId;
    uint64 gameId;
    address payable wallet;
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
    uint64 expWin;
    uint price;
    bool sold;
}

struct GameDeck {
    uint32[20] userCardIdList;
}

struct Game {
    uint64 userId1;
    uint64 userId2;
    uint16 userDeck1;
    uint16 userDeck2;
    uint64 winner;
    bool ended;
    PlayGame playGame;
}

contract CardAdmin {

    /////////////////// imported event //////////////////////////////

    event GameUpdate(uint16 version);

    event PlayAction(uint8 turn, uint8 id, uint8 gameCardId, uint8 actionTypeId, uint8 dest, uint16 result);
    event DrawCard(uint8 turn, uint8 id, uint8 gameCardId);

    ///////////////////////// contract /////////////////////////////////////

    address payable public owner;

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
    event GameCreatedBot(uint64 id, uint64 userId);
    event GameFill(uint64 id, uint64 userId);
    event GameEnd(uint64 id, uint64 winner);

    uint64 public gameLastId;
    mapping(uint64 => Game) public gameList;

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
        require(userIdList[_userId].gameId == 0, 'user already in game');
        checkDeck(_userId, _gameDeckId);
        gameLastId = gameLastId + 1;
        _joinGamePos(gameLastId, _userId, _gameDeckId, true);
        userIdList[_userId].gameId = gameLastId;
    }

    function _createGameBot(uint64 _userId, uint16 _gameDeckId) private {
        _createGame(_userId, _gameDeckId);
        gameList[gameLastId].playGame = playGameFactory.newGame(
            this,
            _userId,
            _gameDeckId,
            0,
            _gameDeckId,
            gameLastId
        );
        userIdList[_userId].gameId = gameLastId;
        emit GameCreatedBot(gameLastId, _userId);
    }

    function createGameSelf(uint16 _gameDeckId) public isUser {
        _createGame(userAddressList[msg.sender], _gameDeckId);
        emit GameCreated(gameLastId, userAddressList[msg.sender]);
    }

    function createGameBotSelf(uint16 _gameDeckId) public isUser {
        _createGameBot(userAddressList[msg.sender], _gameDeckId);
    }

    function cancelGame() public isUser {
        uint64 _userId = userAddressList[msg.sender];
        uint64 _gameId = userIdList[_userId].gameId;
        require(gameList[_gameId].userId2 == 0, "Player has join");
        gameList[_gameId].ended = true;
        userIdList[_userId].gameId = 0;
        emit GameEnd(_gameId, _userId);
    }

    function _joinGame(uint64 _gameId, uint64 _userId, uint16 _gameDeckId) private {
        require(address(gameList[_gameId].playGame) == address(0), "Game is full");
        require(!gameList[_gameId].ended, "Game is ended");
        require(userIdList[_userId].gameId == 0, 'user already in game');
        checkDeck(_userId, _gameDeckId);
        _joinGamePos(_gameId, _userId, _gameDeckId, false);
        Game storage game = gameList[_gameId];
        game.playGame = playGameFactory.newGame(
            this,
            game.userId1,
            game.userDeck1,
            game.userId2,
            game.userDeck2,
            _gameId
        );
        userIdList[_userId].gameId = _gameId;
        emit GameFill(_gameId, _userId);
    }

    function joinGameSelf(uint64 _gameId, uint16 _gameDeckId) public isUser {
        _joinGame(_gameId, userAddressList[msg.sender], _gameDeckId);
    }

    /////////////////////////////////// End game ///////////////////////////////

    function addCardExp(uint64 _userId, uint16 _userDeckId, PlayGame _playGame) private {
        uint32[20] memory gameDeckCard = getUserDeckCard(_userId, _userDeckId);
        uint8 pos = _playGame.getUserPos(_userId);
        for (uint8 i = 0; i < 20; i++){
            userIdList[_userId].userCardList[gameDeckCard[i]].exp += _playGame.getUserCardExp(pos, gameDeckCard[i]);
            userIdList[_userId].userCardList[gameDeckCard[i]].expWin += _playGame.getUserCardExp(pos, gameDeckCard[i]);
        }
    }

    function endGame(uint64 _gameId) public {
        Game storage game = gameList[_gameId];
        require(!game.ended);
        require(game.playGame.ended());
        uint64 winner = game.playGame.winner();
        game.winner = winner;
        addCardExp(game.userId1, game.userDeck1, game.playGame);
        userIdList[game.userId1].gameId = 0;
        if (game.userId2 != 0){
          addCardExp(game.userId2, game.userDeck2, game.playGame);
          userIdList[game.userId2].gameId = 0;
        }
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

    function registerUser(address payable _userAddress, string memory _name) private {
        require(userAddressList[_userAddress] == 0, "already registered");
        require(userNameList[_name] == 0, "name exist");
        userLastId = userLastId + 1;
        userAddressList[_userAddress] = userLastId;
        userNameList[_name] = userLastId;
        userIdList[userLastId].id = userLastId;
        userIdList[userLastId].name = _name;
        userIdList[userLastId].wallet = _userAddress;
        addUserStarterCard(userLastId);
    }

    function registerUserSelf(string memory _name) public {
        registerUser(payable(msg.sender), _name);
    }

    ///////////////////////////////////// UserCard //////////////////////////////////////

    function getUserCard(uint64 _userId, uint32 _userCardId) public view returns(UserCard memory userCard){
        userCard = userIdList[_userId].userCardList[_userCardId];
    }

    function getUserCardList(uint64 _userId) public view returns (UserCard[] memory userCard){
        userCard = new UserCard[](userIdList[_userId].userCardListLastId);
        for (uint32 i = 1; i <= userIdList[_userId].userCardListLastId; i++){
            userCard[i - 1] = userIdList[_userId].userCardList[i];
        }
    }

    function addUserCard(uint64 _userId, uint32 _cardId) private {
        userIdList[_userId].userCardListLastId++;
        userIdList[_userId].userCardList[userIdList[_userId].userCardListLastId].cardId = _cardId;
    }

    function addUserCardWithExp(uint64 _userId, uint32 _cardId, uint64 _exp) private {
        userIdList[_userId].userCardListLastId++;
        userIdList[_userId].userCardList[userIdList[_userId].userCardListLastId].cardId = _cardId;
        userIdList[_userId].userCardList[userIdList[_userId].userCardListLastId].exp = _exp;
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

    function getLevel(uint64 exp) public pure returns(uint8){
        if (exp < 10) return 0;
        if (exp < 100) return 1;
        if (exp < 1000) return 2;
        if (exp < 10000) return 3;
        if (exp < 100000) return 4;
        return 5;
    }

    //////////////////////////////// Trade contract /////////////////////////////////

    Trading public trading;

    function _updateTrading(Trading _trading) private {
        require(address(_trading) != address(0), "trading is null");
        trading = _trading;
    }

    function updateTrading(Trading _trading) public isOwner {
        _updateTrading(_trading);
    }

    //////////////////////////////// Trade /////////////////////////////////

    function buyNewCard(uint32 _cardId) public payable isUser {
        require(0 < _cardId && _cardId <= cardLastId, "Wrong card");
        if (cardList[_cardId].starter > 0) {
          require(msg.value == 1 ether, "Price is 1 ROSE");
        } else {
          require(msg.value == 10 ether, "Price is 10 ROSE");
        }
        addUserCard(userAddressList[msg.sender], _cardId);
    }

    function buyCard(uint64 _userId, uint32 _userCardId) public payable isUser {
        require(_userId != userAddressList[msg.sender], 'same seller and buyer');
        UserCard storage userCard = userIdList[_userId].userCardList[_userCardId];
        require(userCard.price > 0 && userCard.sold == false, 'wrong card');
        require(userCard.price == msg.value, "Wrong card or price");
        userCard.sold = true;
        userIdList[_userId].wallet.transfer(msg.value * 100 / 120);
        if (address(trading) != address(0)){
            trading.removeUserCard(_userId, _userCardId);
        }
        addUserCardWithExp(userAddressList[msg.sender], userCard.cardId, userCard.exp);
    }

    function sellCardSelf(uint32 _userCardId, uint price) public isUser {
        require(price >= 1 ether, 'price less than 1 ROSE');
        uint64 userId = userAddressList[msg.sender];
        UserCard storage userCard = userIdList[userId].userCardList[_userCardId];
        require(userCard.price == 0 && userCard.sold == false, 'wrong card');
        uint8 level = getLevel(userCard.exp);
        require(level > 0, "Cannot sell level 0");
        userCard.price = price * 120 / 100;
        if (address(trading) != address(0)){
            trading.addUserCard(userId, _userCardId, userCard.price);
        }
    }

    function cancelSellCardSelf(uint32 _userCardId) public isUser {
        uint64 userId = userAddressList[msg.sender];
        UserCard storage userCard = userIdList[userId].userCardList[_userCardId];
        require(userCard.price > 0 && userCard.sold == false, 'wrong card');
        userCard.price = 0;
        if (address(trading) != address(0)){
            trading.removeUserCard(userId, _userCardId);
        }
    }



    ////////////////////////////////////// User Deck ///////////////////////////////////////
    event DeckUpdated(uint64 userId, uint16 deckId);

    function checkDeck(uint64 _userId, uint16 _deckId) public view {
        uint32[20] memory userCardIdList = userIdList[_userId].deckList[_deckId].userCardIdList;
        for (uint8 i = 0; i < 20; i++){
            require(userIdList[_userId].userCardList[userCardIdList[i]].price == 0, "card is for sale");
        }
    }

    function getUserDeckLength(uint64 _userId) public view returns (uint16){
       return userIdList[_userId].deckListLastId;
    }

    function getUserDeckCard(uint64 _userId, uint16 _deckId) public view returns (uint32[20] memory){
       return userIdList[_userId].deckList[_deckId].userCardIdList;
    }

    function _updateGameDeck(uint64 _userId, uint16 _deckId, uint32[20] memory _userCardIdList) private {
      for (uint8 i = 0; i < 20; i++){
        require(_userCardIdList[i] > 0 && _userCardIdList[i] <=  userIdList[_userId].userCardListLastId , 'Wrong user card');
        require(userIdList[_userId].userCardList[_userCardIdList[i]].price == 0, "card is for sale");
        uint8 nb = 0;
        for (uint8 j = i + 1; j < 20; j++){
          require(_userCardIdList[i] != _userCardIdList[j], 'Two same user cards');
          if (userIdList[_userId].userCardList[_userCardIdList[i]].cardId == userIdList[_userId].userCardList[_userCardIdList[j]].cardId){
            nb++;
            require(nb < 2, 'To many same card');
          }
        }
      }
      userIdList[_userId].deckList[_deckId].userCardIdList = _userCardIdList;
      emit DeckUpdated(_userId, _deckId);
    }

    function _addGameDeck(uint64 _userId, uint32[20] memory _userCardIdList) private {
      userIdList[_userId].deckListLastId++;
      _updateGameDeck(_userId, userIdList[_userId].deckListLastId, _userCardIdList);
    }

    function addGameDeckSelf(uint32[20] memory _userCardIdList) public isUser {
      _addGameDeck(userAddressList[msg.sender], _userCardIdList);
    }

    function updateGameDeckSelf(uint16 _deckId, uint32[20] memory _userCardIdList) public isUser {
      _updateGameDeck(userAddressList[msg.sender], _deckId, _userCardIdList);
    }

}
