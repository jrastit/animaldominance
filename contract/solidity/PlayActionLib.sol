// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { PlayGame, GameCard } from "./PlayGame.sol";
import { GameManager, UserCard } from './GameManager.sol';
import { Card } from './CardList.sol';

contract PlayActionLib {

    uint256 public contractHash;

    constructor(
        uint256 _contractHash
    ) {
        contractHash = _contractHash;
    }

    function random8(uint8 number, uint8 _turn, uint8 _actionId) public view returns(uint8){
        //return turn % number;
        return uint8(uint(keccak256(abi.encode(blockhash(block.number-1), block.timestamp, _turn, _actionId)))) % number;
    }

    function getGameCard(GameManager gameManager, uint64 _userId, uint32 _userCardId) public view returns (GameCard memory){
        UserCard memory userCard = gameManager.getUserCard(_userId, _userCardId);
        uint8 level = gameManager.cardList().getLevel(userCard.exp);
        Card memory card = gameManager.cardList().getCard(userCard.cardId);
        GameCard memory gameCard = GameCard(
            _userId,
            _userCardId,
            userCard.cardId,
            card.level[level].life,
            card.level[level].attack,
            userCard.exp,
            0,
            card.mana,
            0
        );
        return gameCard;
    }

    function playActionAttack(GameCard memory gameCard1, GameCard memory gameCard2, uint8 turn) public pure returns (
        uint16 result,
        GameCard memory,
        GameCard memory
    ){
        if (gameCard1.cardId != 0 && gameCard2.cardId != 0){
            if (gameCard1.attack < gameCard2.life){
                result = gameCard1.attack;
                gameCard1.expWin += (gameCard1.attack * 5);
                gameCard2.expWin += gameCard1.attack;
                gameCard2.life -= gameCard1.attack;
            } else {
                result = gameCard2.life;
                gameCard1.expWin += (gameCard2.life * 10);
                gameCard2.expWin += gameCard2.life;
                gameCard2.life = 0;
            }
            if (gameCard2.attack < gameCard1.life){
                gameCard2.expWin += (gameCard2.attack * 2);
                gameCard1.expWin += gameCard2.attack;
                gameCard1.life -= gameCard2.attack;
            } else {
                gameCard2.expWin += (gameCard1.life * 4);
                gameCard1.expWin += gameCard1.life;
                gameCard1.life = 0;
            }
            gameCard1.turn = turn;
        }
        return (result, gameCard1, gameCard2);
    }

    function playActionAttackOponent(GameCard memory gameCard, uint16 life, uint8 turn) public pure returns (
        uint16 result,
        uint16,
        GameCard memory
    ){
        if (gameCard.cardId != 0){
            if (gameCard.attack < life){
                gameCard.expWin += (gameCard.attack * 5);
                life = life - gameCard.attack;
                result = gameCard.attack;
            } else {
                result = life;
                gameCard.expWin += (life * 10);
                life = 0;
            }
            gameCard.turn = turn;
        }
        return (result, life, gameCard);
    }
}
