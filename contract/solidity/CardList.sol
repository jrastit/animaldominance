// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

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

contract CardList {

    ///////////////////////// contract /////////////////////////////////////

    uint256 public contractHash;

    address payable public owner;

    modifier isOwner() {
     require(msg.sender == owner, "Not owner");
        _;
    }

    function withdraw (uint _amount) public isOwner {
      owner.transfer(_amount);
    }

    constructor(
        uint256 _contractHash
    ) {
        contractHash = _contractHash;
        owner = payable( msg.sender);
    }

    ///////////////////// Cards ////////////////////////////////////

    event CardCreated(uint32 id);

    uint32 public cardLastId;
    uint256 public cardHash;

    mapping(uint32 => Card) public cardList;

    function getCardStarter(uint32 _cardId) public view returns (uint8) {
        return cardList[_cardId].starter;
    }

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
        string[] calldata _description,
        uint16[] calldata _life,
        uint16[] calldata _attack
    ) public isOwner {
        cardLastId = cardLastId + 1;
        cardList[cardLastId].id = cardLastId;
        updateCard(cardLastId, _name, _mana, _family, _starter);
        require(_description.length == _life.length && _description.length == _attack.length, 'Wrong level');
        for (uint8 i = 0; i < _description.length; i++){
            setCardLevel(cardLastId, _description[i], i, _life[i], _attack[i]);
        }
    }

    function setCardHash(uint256 _cardHash) public isOwner {
      cardHash = _cardHash;
    }

    function updateCard(
        uint32 _cardId,
        string memory _name,
        uint8 _mana,
        uint8 _family,
        uint8 _starter
    ) public isOwner {
        cardList[_cardId].name = _name;
        cardList[_cardId].mana = _mana;
        cardList[_cardId].family = _family;
        cardList[_cardId].starter = _starter;
        emit CardCreated(_cardId);
        cardHash = 0;
    }

    function setCardLevel(uint32 _cardId, string memory _description, uint8 _level, uint16 _life, uint16 _attack) public isOwner {
        cardList[_cardId].level[_level].description = _description;
        cardList[_cardId].level[_level].life = _life;
        cardList[_cardId].level[_level].attack = _attack;
        cardHash = 0;
    }

    function getLevel(uint64 exp) public pure returns(uint8){
        if (exp < 10) return 0;
        if (exp < 100) return 1;
        if (exp < 1000) return 2;
        if (exp < 10000) return 3;
        if (exp < 100000) return 4;
        return 5;
    }

}
