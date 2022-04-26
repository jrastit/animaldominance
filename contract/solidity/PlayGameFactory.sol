// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { PlayGame } from "./PlayGame.sol";
import { CardAdmin } from "./CardAdmin.sol";

contract PlayGameFactory {
    function newGame(
        CardAdmin _cardAdmin,
        uint64 _userId1,
        uint16 _gameDeckId1,
        uint64 _userId2,
        uint16 _gameDeckId2,
        uint64 _gameId
    ) public returns(PlayGame){
        return new PlayGame(
            _cardAdmin,
            _userId1,
            _gameDeckId1,
            _userId2,
            _gameDeckId2,
            _gameId
        );
    }
}
