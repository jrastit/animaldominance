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

contract NFT is IERC2981, ERC721 {

    constructor(
        address _owner,
        uint32 _royaltyFraction,
        address _receiver,
        string memory _baseURI
    )
        ERC721("AnimalDominance", "AND")
    {
		receiver = _receiver;
		royaltyFraction = _royaltyFraction;
		owner = _owner;
        baseURI = _baseURI;
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
	////////////////////////////////////// Owner ///////////////////////////////////////////
	address owner;
	modifier isOwner() {
        require(msg.sender == owner, "Not owner");
        _;
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
        require(tokenCard[_tokenId].cardId != 0, 'Token does not exist');
        uint256 royaltyAmount = (_salePrice * royaltyFraction) / 10000;
        return (receiver, royaltyAmount);
    }

	//////////////////////////////////// Token /////////////////////////////////////////////////////////////////
	uint256 tokenLastId;

	// Mapping from token ID to card
	mapping(uint256 => TokenCard) private tokenCard;

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
        require(tokenCard[_tokenId].cardId != 0, 'Token does not exist');
        return string(abi.encodePacked(baseURI, tokenCard[_tokenId].cardId, '/', tokenCard[_tokenId].exp));
    }

    function createNFT(address _player, UserCard calldata _userCard)
        public
        isOwner()
    {
        tokenLastId++;
        _safeMint(_player, tokenLastId);
        tokenCard[tokenLastId].cardId = _userCard.cardId;
        tokenCard[tokenLastId].exp = _userCard.exp;
        for (uint i =  0; i < 3; i++){
            tokenCard[tokenLastId].previousOwner[i] = _userCard.previousOwner[i];
        }
    }

	function burnNFT(uint256 tokenId)
		public
		isOwner()
        returns (UserCard memory userCard)
	{
		_burn(tokenId);
        userCard.cardId = tokenCard[tokenLastId].cardId;
        userCard.exp = tokenCard[tokenLastId].exp;
        for (uint i =  0; i < 3; i++){
            userCard.previousOwner[i] = tokenCard[tokenLastId].previousOwner[i];
        }
        return userCard;
	}
}
