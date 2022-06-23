// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

import { UserCard, PreviousOwner } from "./GameManager.sol";

struct TokenCard {
	uint32 cardId;
	uint64 exp;
	PreviousOwner[3] previousOwner;
}

struct HistoryCard {
	uint256 nftId;
	address owner;
	uint32 cardId;
	uint64 exp;
	PreviousOwner[3] previousOwner;
}

contract NFT is IERC2981, ERC721 {

    constructor(
        address _owner,
        uint32 _royaltyFraction,
        address payable _receiver,
        string memory _baseURI,
        uint256 _contractHash
    )
        ERC721("AnimalDominance", "AND")
    {
				receiver = _receiver;
				royaltyFraction = _royaltyFraction;
				owner = _owner;
        baseURI = _baseURI;
        contractHash = _contractHash;
	   }

	   /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, ERC721) returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
  ////////////////////////////////////// Hash ///////////////////////////////////////////

  uint256 public contractHash;

	////////////////////////////////////// Owner ///////////////////////////////////////////
	address owner;
	modifier isOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

	function setOwner(address _owner) public isOwner() {
		owner = _owner;
	}

	/////////////////////////////////////// Royalties ///////////////////////////////////////////
	address receiver;
  uint32 royaltyFraction;

	function updateReceiver(address _receiver) public isOwner() {
		receiver = _receiver;
	}

	function updateRoyaltyFraction(uint32 _royaltyFraction) public isOwner() {
		royaltyFraction = _royaltyFraction;
	}

	/**
     * @inheritdoc IERC2981
     */
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
        public
        view
        virtual
        override
        returns (address, uint256)
    {
        require(tokenCardList[_tokenId].cardId != 0, 'Token does not exist');
        uint256 royaltyAmount = (_salePrice * royaltyFraction) / 10000;
        return (receiver, royaltyAmount);
    }

	//////////////////////////////////// Token /////////////////////////////////////////////////////////////////
	uint256 tokenLastId;

	// Mapping from token ID to card
	mapping(uint256 => TokenCard) private tokenCardList;

	string baseURI;

    function updateBaseUri(string memory _baseURI)
        public
        isOwner()
    {
        baseURI = _baseURI;
    }

	function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(tokenCardList[_tokenId].cardId != 0, 'Token does not exist');
        return string(abi.encodePacked(baseURI, tokenCardList[_tokenId].cardId, '/', tokenCardList[_tokenId].exp));
    }

    function createNFT(address _player, UserCard calldata _userCard)
        public
        isOwner()
        returns (uint256)
    {
        tokenLastId++;
        _safeMint(_player, tokenLastId);
				TokenCard storage tokenCard = tokenCardList[tokenLastId];
        tokenCard.cardId = _userCard.cardId;
        tokenCard.exp = _userCard.exp;
        for (uint i =  0; i < 3; i++){
            tokenCard.previousOwner[i] = _userCard.previousOwner[i];
        }
        return tokenLastId;
    }

	function burnNFT(uint256 tokenId)
		public
		isOwner()
    	returns (UserCard memory userCard)
	{
		_burn(tokenId);
		TokenCard storage tokenCard = tokenCardList[tokenId];
		userCard.cardId = tokenCard.cardId;
		userCard.exp = tokenCard.exp;
		for (uint i =  0; i < 3; i++){
			userCard.previousOwner[i] = tokenCard.previousOwner[i];
		}
		return userCard;
	}

	////////////////////////////////// NFTHistory //////////////////////////
	mapping(address => uint256[]) private historyTokenCard;

	function _afterTokenTransfer(
		address ,
        address _to,
        uint256 _tokenId
	)
		internal
		override
	{
		historyTokenCard[_to].push(_tokenId);
	}

	function nftHistory(address _player)
		public
		view
		returns (HistoryCard[] memory ret)
	{
		uint256[] storage history = historyTokenCard[_player];
		ret = new HistoryCard[](history.length);
		for (uint i = 0; i < history.length; i++){
			uint256 token = history[i];
			TokenCard storage tokenCard = tokenCardList[token];
			ret[i].nftId = token;
			ret[i].owner = _exists(token) ? ownerOf(token) : address(0);
			ret[i].cardId = tokenCard.cardId;
			ret[i].exp = tokenCard.exp;
			for (uint j =  0; j < 3; j++){
				ret[i].previousOwner[j] = tokenCard.previousOwner[j];
			}
		}
		return ret;
	}
}
