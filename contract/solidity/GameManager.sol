// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { GameList } from "./GameList.sol";
import { CardList } from "./CardList.sol";
import { Trading } from "./Trading.sol";
import { PlayGame, GameCard } from "./PlayGame.sol";
import { PlayGameFactory } from "./PlayGameFactory.sol";
import { PlayActionLib } from "./PlayActionLib.sol";
import { PlayBot } from "./PlayBot.sol";
import { NFT } from "./NFT.sol";
import { AnimalDominance } from "./AnimalDominance.sol";

struct User {
    uint64 id;
    string name;
    uint16 totem;
    uint64 rank;
    uint32 userCardListLastId;
    uint16 deckListLastId;
    address payable wallet;
    mapping(uint32 => UserCard) userCardList;
    mapping(uint16 => GameDeck) deckList;
}

struct PreviousOwner {
    address payable wallet;
    uint64 expWin;
}

struct UserCard {
    uint32 cardId;
    uint64 exp;
    uint64 expWin;
    PreviousOwner[3] previousOwner;
    uint price;
    bool sold;
    uint256 nftId;
}

struct GameDeck {
    uint32[20] userCardIdList;
}

contract GameManager {

    /////////////////// imported event //////////////////////////////

    event GameUpdate(uint16 version);

    event PlayAction(uint8 turn, uint8 id, uint8 gameCardId, uint8 actionTypeId, uint8 dest, uint16 result);
    event DrawCard(uint8 turn, uint8 id, uint8 gameCardId);

    ///////////////////////// contract /////////////////////////////////////

    function checkOwner() public view {
        animalDominance.checkOwner(msg.sender);
    }

    modifier _isOwner() {
        checkOwner();
        _;
    }

    function withdraw (uint _amount) public _isOwner {
        animalDominance.owner().transfer(_amount);
    }

    constructor(
        AnimalDominance _animalDominance,
        CardList _cardList
    ) {
        animalDominance = _animalDominance;
        cardList = _cardList;
    }

    //////////////////////////////////// AnimalDominance ///////////////////////
    AnimalDominance public animalDominance;

    /////////////////////////////// CardList //////////////////////////////////
    CardList public cardList;

    function _updateCardList(CardList _cardList) private {
        require(address(_cardList) != address(0), "CardList is null");
        cardList = _cardList;
    }

    function updateCardList(CardList _cardList) public _isOwner {
        _updateCardList(_cardList);
    }

    ///////////////////////////// GameList ///////////////////////////////////
    GameList public gameList;

    function _updateGameList(GameList _gameList) private {
        require(address(_gameList) != address(0), "GameList is null");
        gameList = _gameList;
    }

    function updateGameList(GameList _gameList) public _isOwner {
        _updateGameList(_gameList);
    }

    /////////////////////////////////// End game ///////////////////////////////

    function addCardExp(uint64 _userId, uint16 _userDeckId, PlayGame _playGame) public {
        require(address(msg.sender) == address(gameList));
        uint32[20] memory gameDeckCard = getUserDeckCard(_userId, _userDeckId);
        uint8 pos = _playGame.getUserPos(_userId);
        for (uint8 i = 0; i < 20; i++){
            userIdList[_userId].userCardList[gameDeckCard[i]].exp += _playGame.getUserCardExp(pos, gameDeckCard[i]);
            userIdList[_userId].userCardList[gameDeckCard[i]].expWin += _playGame.getUserCardExp(pos, gameDeckCard[i]);
        }
    }

    //////////////////////////////////////// User //////////////////////////////////////

    uint64 public userLastId;
    mapping(uint64 => User) public userIdList;
    mapping(address => uint64) public userAddressList;
    mapping(string => uint64) public userNameList;

    function getUserId(address sender) public view returns (uint64 userId){
        userId = userAddressList[sender];
        require(userId != 0, "Not registered");
        return userId;
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

    event AddUserCard(uint64 _userId, uint32 _cardId);
    event AddUserCardWithExp(uint64 _userId, UserCard _userCard);

    function getUserCard(uint64 _userId, uint32 _userCardId) public view returns(UserCard memory userCard){
        userCard = userIdList[_userId].userCardList[_userCardId];
    }

    function getUserCardList(uint64 _userId) public view returns (UserCard[] memory userCard){
        userCard = new UserCard[](userIdList[_userId].userCardListLastId);
        for (uint32 i = 1; i <= userIdList[_userId].userCardListLastId; i++){
            userCard[i - 1] = userIdList[_userId].userCardList[i];
        }
    }

    function _addUserCard(uint64 _userId, uint32 _cardId) private {
        userIdList[_userId].userCardListLastId++;
        userIdList[_userId].userCardList[userIdList[_userId].userCardListLastId].cardId = _cardId;
        emit AddUserCard(_userId, _cardId);
    }

    function _addUserCardWithExp(uint64 _userId, UserCard memory _userCard) private {
        userIdList[_userId].userCardListLastId++;
        UserCard storage newCard = userIdList[_userId].userCardList[userIdList[_userId].userCardListLastId];
        newCard.cardId = _userCard.cardId;
        newCard.exp = _userCard.exp;
        for (uint8 i = 0; i < 3; i++){
            newCard.previousOwner[i] = _userCard.previousOwner[i];
        }
        emit AddUserCardWithExp(_userId, _userCard);
    }

    function addUserStarterCard(uint64 _userId) public {
        require(userIdList[_userId].userCardListLastId == 0, "Already have card");
        for (uint32 i = 1; i <= cardList.cardLastId(); i++) {
            uint8 starter = cardList.getCardStarter(i);
            while(starter > 0) {
                _addUserCard(_userId, i);
                starter = starter - 1;
            }
        }
    }

    function _checkCardAvaillable(uint64 _userId, uint32 _userCardId)
        private
        view
    {
        UserCard storage userCard = userIdList[_userId].userCardList[_userCardId];
        require(
            userCard.cardId != 0 &&
            userCard.price == 0 &&
            userCard.sold == false
            , 'wrong card');
        uint8 level = cardList.getLevel(userCard.exp);
        require(level > 0, "Cannot nft/sell level 1");
    }

    function _updateXpWin(uint64 _userId, uint32 _userCardId)
        private
    {
        UserCard storage userCard = userIdList[_userId].userCardList[_userCardId];
        uint8 minXpPos = 0;
        uint64 minXp = userCard.expWin;
        for (uint8 i = 0; i < 3; i++){
            if (userCard.previousOwner[i].wallet == userIdList[_userId].wallet){
                minXpPos = i;
                userCard.previousOwner[minXpPos].expWin += userCard.expWin;
                break;
            } else if(userCard.previousOwner[0].expWin < minXp){
                minXpPos = i;
                minXp = userCard.previousOwner[0].expWin;
            }
        }
        if (userCard.expWin > userCard.previousOwner[minXpPos].expWin){
            userCard.previousOwner[minXpPos].expWin = userCard.expWin;
            userCard.previousOwner[minXpPos].wallet = userIdList[_userId].wallet;
        }
    }

    //////////////////////////////// NFT Contract //////////////////////////////////
    NFT public nft;

    function updateNFT(NFT _nft) public _isOwner {
        nft = _nft;
    }

    modifier isNFT() {
        require(address(nft) != address(0), "NFT not set");
        _;
    }

    /////////////////////////////// NFT ///////////////////////////////////////////

    /**
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables `approved` to manage the `tokenId` token.
     */
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.
     */
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function createNFT(uint32 _userCardId) public isNFT() {
        uint64 userId = getUserId(msg.sender);
        _checkCardAvaillable(userId, _userCardId);
        _updateXpWin(userId, _userCardId);
        UserCard storage userCard = userIdList[userId].userCardList[_userCardId];
        userCard.sold = true;
        userCard.nftId = nft.createNFT(userIdList[userId].wallet, userCard);
    }

    function burnNFT(uint256 _tokenId) public isNFT() {
        uint64 userId = getUserId(msg.sender);
        require(userIdList[userId].wallet == nft.ownerOf(_tokenId), 'Not token owner');
        _addUserCardWithExp(userId, nft.burnNFT(_tokenId));
    }

    //////////////////////////////// Trade contract /////////////////////////////////

    Trading public trading;

    function updateTrading(Trading _trading) public _isOwner {
        trading = _trading;
    }


    //////////////////////////////// Trade /////////////////////////////////

    function buyNewCard(uint32 _cardId) public payable {
        require(0 < _cardId && _cardId <= cardList.cardLastId(), "Wrong card");
        if (cardList.getCardStarter(_cardId) > 0) {
          require(msg.value == 1 ether, "Price is 1 ROSE");
        } else {
          require(msg.value == 10 ether, "Price is 10 ROSE");
        }
        _addUserCard(getUserId(msg.sender), _cardId);
    }

    function buyCard(uint64 _userId, uint32 _userCardId) public payable {
        uint64 newUserId = getUserId(msg.sender);
        require(_userId != newUserId, 'same seller and buyer');
        UserCard storage userCard = userIdList[_userId].userCardList[_userCardId];
        require(userCard.price > 0 && userCard.sold == false, 'wrong card');
        require(userCard.price == msg.value, "Wrong card or price");
        userCard.sold = true;
        userIdList[_userId].wallet.transfer(msg.value * 100 / 120);
        _updateXpWin(_userId, _userCardId);
        uint64 totalXp = userCard.previousOwner[0].expWin + userCard.previousOwner[1].expWin + userCard.previousOwner[2].expWin;
        for (uint8 i = 0; i < 3; i++){
            if (userCard.previousOwner[i].expWin > 0){
                userIdList[_userId].wallet.transfer(msg.value * 5 * userCard.previousOwner[i].expWin / (120 * totalXp));
            }
        }
        if (address(trading) != address(0)){
            uint8 level = cardList.getLevel(userCard.exp);
            trading.removeUserCard(
                userCard.cardId,
                level,
                _userId,
                _userCardId
            );
        }
        _addUserCardWithExp(newUserId, userCard);
    }

    function sellCardSelf(uint32 _userCardId, uint price) public {
        require(price >= 1 ether, 'price less than 1 ROSE');
        uint64 userId = getUserId(msg.sender);
        _checkCardAvaillable(userId, _userCardId);
        price = price * 120 / 100;
        UserCard storage userCard = userIdList[userId].userCardList[_userCardId];
        userCard.price = price;
        if (address(trading) != address(0)){
            uint8 level = cardList.getLevel(userCard.exp);
            trading.addUserCard(
                userCard.cardId,
                level,
                userId,
                _userCardId,
                price
            );
        }
    }

    function cancelSellCardSelf(uint32 _userCardId) public {
        uint64 userId = getUserId(msg.sender);
        UserCard storage userCard = userIdList[userId].userCardList[_userCardId];
        require(userCard.price > 0 && userCard.sold == false, 'wrong card');
        userCard.price = 0;
        if (address(trading) != address(0)){
            uint8 level = cardList.getLevel(userCard.exp);
            trading.removeUserCard(
                userCard.cardId,
                level,
                userId,
                _userCardId
            );
        }
    }

    ////////////////////////////////////// User Deck ///////////////////////////////////////
    event DeckUpdated(uint64 userId, uint16 deckId);

    function checkDeck(uint64 _userId, uint16 _deckId) public view {
        uint32[20] storage userCardIdList = userIdList[_userId].deckList[_deckId].userCardIdList;
        for (uint8 i = 0; i < 20; i++){
            UserCard storage userCard = userIdList[_userId].userCardList[userCardIdList[i]];
            require(userCard.price == 0 && !userCard.sold, "Deck card locked");
        }
    }

    function getUserDeckLength(uint64 _userId) public view returns (uint16){
       return userIdList[_userId].deckListLastId;
    }

    function getUserDeckCard(uint64 _userId, uint16 _deckId) public view returns (uint32[20] memory){
       return userIdList[_userId].deckList[_deckId].userCardIdList;
    }

    function _updateGameDeck(uint64 _userId, uint16 _deckId, uint32[20] calldata _userCardIdList) private {
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

    function _addGameDeck(uint64 _userId, uint32[20] calldata _userCardIdList) private {
      userIdList[_userId].deckListLastId++;
      _updateGameDeck(_userId, userIdList[_userId].deckListLastId, _userCardIdList);
    }

    function addGameDeckSelf(uint32[20] calldata _userCardIdList) public {
      _addGameDeck(getUserId(msg.sender), _userCardIdList);
    }

    function updateGameDeckSelf(uint16 _deckId, uint32[20] calldata _userCardIdList) public {
      _updateGameDeck(getUserId(msg.sender), _deckId, _userCardIdList);
    }

}
