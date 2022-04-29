import * as ethers from 'ethers'
import { useState } from 'react'

import { TransactionManager } from '../util/TransactionManager'

import Button from 'react-bootstrap/Button'

import SpaceWidget from '../component/spaceWidget'
import BoxWidget from '../component/boxWidget'
import SelectWidget from '../component/selectWidget'

import {
  joinGame,
  createGame,
} from '../game/game'

import {
  UserDeckType
} from '../type/userType'

import { setGameId } from '../reducer/gameSlice'
import {
  Step,
  StepId,
  updateStep,
  setError,
} from '../reducer/contractSlice'
import { useAppSelector, useAppDispatch } from '../hooks'

const GameJoin = (props : {
  contract : ethers.Contract,
  transactionManager : TransactionManager,
}) => {
  const stepId = StepId.Game
  const user = useAppSelector((state) => state.userSlice.user)
  const gameList = useAppSelector((state) => state.gameSlice.gameList)
  const userDeckList = useAppSelector((state) => state.userSlice.userDeckList)
  const dispatch = useAppDispatch()

  const [deck, setDeck] = useState<UserDeckType | undefined>(
    userDeckList ? userDeckList[0] : undefined
  )


  const onChangeDeck = (event : {target : {name : string, value : string}}) => {
    if (userDeckList){
      setDeck(
        userDeckList.filter(
          (userDeck) => userDeck.id === parseInt(event.target.value)
        )[0]
      )
    }
  }

  const onGameJoin = async (gameId : number) => {
    if (deck){
      dispatch(updateStep({id : stepId, step: Step.Joining}))
      joinGame(
        props.contract,
        props.transactionManager,
        gameId,
        deck.id
      ).then(() => {
        dispatch(setGameId(gameId))
        dispatch(updateStep({id : stepId, step: Step.Ready}))
      }).catch((err) => {
        dispatch(setError({id : stepId, catchError: err}))
      })
    } else {
      dispatch(setError({id : stepId, error: 'No deck set'}))
    }
  }

  const _createGame = async () => {
    if (deck){
      dispatch(updateStep({id : stepId, step: Step.Creating}))
      createGame(
        props.contract,
        props.transactionManager,
        deck.id
      ).then((gameId) => {
        dispatch(setGameId(gameId))
        dispatch(updateStep({id : stepId, step: Step.Waiting}))
      }).catch((err) => {
        dispatch(setError({id : stepId, catchError: err}))
      })
    }

  }

  const userGame = gameList.filter((_game) => {
    return !_game.winner && user && (_game.userId1 === user.id || _game.userId2 === user.id)
  })

  if (userGame && userGame.length > 0){
    console.log("here!!!", userGame[0])
    dispatch(setGameId(userGame[0].id))
    if (userGame[0].userId2){
      dispatch(updateStep({id : stepId, step: Step.Ready}))
    } else {
      dispatch(updateStep({id : stepId, step: Step.Waiting}))
    }

  }

  const render = () => {
    if (gameList && gameList.length > 0){
      const openGame = gameList.filter(game  => !game.userId2 && !game.winner)
      const myOpenGame = openGame.filter(game  => user && game.userId1 === user.id)
      const gameToJoin = openGame.filter(game  => user && game.userId1 !== user.id)

      return (
        <>
        <div>{openGame.length} Open Games</div>
        { !!myOpenGame.length &&
          <div>Game created, waiting for oponent</div>
        }
        { !myOpenGame.length &&
          gameToJoin.map(game => {
            if (deck) return (
              <Button
                key={game.id}
                onClick={() => {onGameJoin(game.id)}}
              >Join game {game.id} by #{game.userId1}</Button>
            )
            return (
              <div key={game.id}>Game {game.id} open by #{game.userId1}</div>
            )
          })
        }
        </>
      )
    } else {
      return (<div>not game found</div>)
    }
  }


  const render2 = () => {
    let deckList = [{name:"", value:"-1"}] as {name: string, value:string}[]

    if (userDeckList){
      deckList = deckList.concat(
        userDeckList.map(userDeck => {
          return {
            name : "Deck " + userDeck.id,
            value : userDeck.id.toString()
          }
        })
      )
    }
    return (
      <SelectWidget
        onChange={onChangeDeck}
        option={deckList}
        value={deck ? deck.id.toString() : undefined}
      />
    )
  }

  return (
    <SpaceWidget>
      <BoxWidget title='Select deck'>
        { render2() }
      </BoxWidget>
      <BoxWidget title='Create Game'>
      {deck &&
        <Button variant="primary" onClick={_createGame}>
          New game
        </Button>
      }
      </BoxWidget>
      <BoxWidget title='Games'>
        { render() }
      </BoxWidget>
    </SpaceWidget>
  )


}

export default GameJoin
