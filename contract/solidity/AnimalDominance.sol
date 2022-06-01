// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract AnimalDominance {

    constructor(
        uint256 _contractHash
    ) {
        contractHash = _contractHash;
        owner = payable( msg.sender);
    }

    //////////////////////////// Owner ///////////////////////////
    address payable public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function withdraw (uint _amount) public isOwner {
        owner.transfer(_amount);
    }

    ////////////////////////// address ////////////////////
    mapping(uint256 => address) private gameManagerList;

    function getGameManager(uint256 _contractHash) public view returns (address) {
      address gameManager = gameManagerList[_contractHash];
      require(address(gameManager) != address(0), "Game manager not found");
      return gameManagerList[_contractHash];
    }

    function addGameManager(uint256 _contractHash, address _gameManager) public isOwner() {
      gameManagerList[_contractHash] = _gameManager;
    }


    //////////////////////// Hash //////////////////////////
    uint256 public contractHash;

    function setContractHash(uint256 _contractHash) public isOwner() {
        contractHash = _contractHash;
    }

}
