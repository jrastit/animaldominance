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

    function withdraw (uint _amount, address payable _dest) public _isOwner {
        _dest.transfer(_amount);
    }

    function isOwner() public view returns (bool) {
        return (msg.sender == owner);
    }

    function checkOwner(address sender) public view {
        require(sender == owner, "Not owner");
    }

    function setOwner(address payable _owner) public _isOwner() {
  		owner = _owner;
  	}

    ////////////////////////// address ////////////////////
    mapping(uint256 => address) private contractList;

    function getContract(uint256 _contractHash) public view returns (address) {
        return contractList[_contractHash];
    }

    function addContract(uint256 _contractHash, address _contractAddress) public _isOwner() {
        contractList[_contractHash] = _contractAddress;
    }


    //////////////////////// Hash //////////////////////////
    uint256 public contractHash;

    function setContractHash(uint256 _contractHash) public _isOwner() {
        contractHash = _contractHash;
    }

}
