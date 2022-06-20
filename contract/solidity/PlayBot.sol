// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { GameUser, GameCard } from './PlayGame.sol';

contract PlayBot {

    uint256 public contractHash;

    constructor(
        uint256 _contractHash
    ) {
        contractHash = _contractHash;
    }

      /////////////////////////////// Bot ///////////////////////////////////
      function nextAction(
          uint8 _pos,
          GameUser[2] calldata gameUser,
          bool ended,
          uint8 turn,
          uint8 mana
          ) public pure returns(uint8, uint8, uint8){
        GameUser calldata user = gameUser[_pos];
        for (uint8 i = 0; i < 16 && !ended; i++){
          GameCard calldata gameCard = user.cardList[i];
          if (gameCard.cardId != 0 && gameCard.turn < turn) {
            if (i < 6) {
              if (gameCard.mana <= mana) {
                  for (uint8 dest = 8; dest < 16; dest++){
                      if (user.cardList[dest].cardId == 0){
                          return (i, 1, dest);
                      }
                  }
              }
            }
            if (i >= 8 && i < 16) {
              for (uint8 j = 8; j < 16; j++){
                if (gameUser[1 - _pos].cardList[j].cardId != 0){
                    return (i, 2, j);
                }
              }
              return (i, 2, 255);
            }
          }
        }
        return (0, 0, 0);
      }


}
