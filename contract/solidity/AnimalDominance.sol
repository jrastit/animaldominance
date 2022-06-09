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

    modifier _isOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function withdraw (uint _amount) public _isOwner {
        owner.transfer(_amount);
    }

    function isOwner() public view returns (bool) {
        return (msg.sender == owner);
    }

    ////////////////////////// address ////////////////////
    mapping(uint256 => address) private gameManagerList;

    function getGameManager(uint256 _contractHash) public view returns (address) {
      address gameManager = gameManagerList[_contractHash];
      require(address(gameManager) != address(0), "Game manager not found");
      return gameManager;
    }

    function addGameManager(uint256 _contractHash, address _gameManager) public _isOwner() {
      gameManagerList[_contractHash] = _gameManager;
    }


    //////////////////////// Hash //////////////////////////
    uint256 public contractHash;

    function setContractHash(uint256 _contractHash) public _isOwner() {
        contractHash = _contractHash;
    }

}
