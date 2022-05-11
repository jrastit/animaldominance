import * as ethers from 'ethers'
import { TransactionManager } from '../util/TransactionManager'
import { useState } from 'react'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from '../component/buttonNice'
import DivNice from '../component/divNice'
import StepMessageNiceWidget from '../component/stepMessageNiceWidget'
import DeckSelect from '../game/component/deckSelect'

import {
  joinGame,
  createGame,
} from '../game/game'

import {
  UserDeckType
} from '../type/userType'

import {
  setGameId
} from '../reducer/userSlice'

import { useAppSelector, useAppDispatch } from '../hooks'

import {
  updateStep,
  setMessage,
  setError,
  clearError,
  getStep,
  StepId,
  Step,
  isStep,
  resetAllStep,
  resetAllSubStep,
} from '../reducer/contractSlice'

const FindGame= (props:{
  transactionManager : TransactionManager,
  contract : ethers.Contract | undefined,
}) => {

  const step = useAppSelector((state) => state.contractSlice.step)
  const version = useAppSelector((state) => state.contractSlice.version)
  const user = useAppSelector((state) => state.userSlice.user)
  const gameList = useAppSelector((state) => state.gameSlice.gameList)
  const userDeckList = useAppSelector((state) => state.userSlice.userDeckList)
  const dispatch = useAppDispatch()

  const [deck, setDeck] = useState<UserDeckType | undefined>(
    userDeckList ? userDeckList[0] : undefined
  )

  const reanderLoading = () => {
    return (
    <div>
    <StepMessageNiceWidget
      title = 'Contract'
      step = {getStep(StepId.Contract, step)}
      resetStep = {() => {dispatch(clearError(StepId.Contract))}}
    />
    <StepMessageNiceWidget
      title = 'Cards'
      step = {getStep(StepId.CardList, step)}
      resetStep = {() => {dispatch(clearError(StepId.CardList))}}
    />
    <StepMessageNiceWidget
      title = 'Game liste'
      step = {getStep(StepId.GameList, step)}
      resetStep = {() => {dispatch(clearError(StepId.GameList))}}
    />
    <StepMessageNiceWidget
      title = 'Trading'
      step = {getStep(StepId.Trading, step)}
      resetStep = {() => {dispatch(clearError(StepId.Trading))}}
    />
    <StepMessageNiceWidget
      title = 'User'
      step = {getStep(StepId.User, step)}
      resetStep = {() => {dispatch(clearError(StepId.User))}}
    />
    <StepMessageNiceWidget
      title = 'User Cards'
      step = {getStep(StepId.UserCardList, step)}
      resetStep = {() => {dispatch(clearError(StepId.UserCardList))}}
    />
    <StepMessageNiceWidget
      title = 'User Deck'
      step = {getStep(StepId.UserDeckList, step)}
      resetStep = {() => {dispatch(clearError(StepId.UserDeckList))}}
    />
    </div>
  )
  }

  const onGameJoin = async (gameId : number) => {
    if (deck && props.contract){
      dispatch(updateStep({id : StepId.Game, step: Step.Joining}))
      joinGame(
        props.contract,
        props.transactionManager,
        gameId,
        deck.id
      ).then(() => {
        dispatch(setGameId(gameId))
        dispatch(updateStep({id : StepId.Game, step: Step.Ready}))
      }).catch((err) => {
        dispatch(setError({id : StepId.Game, catchError: err}))
      })
    } else {
      dispatch(setError({id : StepId.Game, error: 'No deck set'}))
    }
  }

  const _createGame = async () => {
    if (deck && props.contract){
      dispatch(updateStep({id : StepId.Game, step: Step.Creating}))
      createGame(
        props.contract,
        props.transactionManager,
        deck.id
      ).then((_gameId) => {
        dispatch(setGameId(_gameId))
        dispatch(updateStep({id : StepId.Game, step: Step.Waiting}))
      }).catch((err) => {
        dispatch(setError({id : StepId.Game, catchError: err}))
      })
    }

  }

  const deckSelectRender = () => {
    return (
      <DeckSelect
        userDeckList={userDeckList}
        setDeck={setDeck}
        deck={deck}
      />
    )
  }

  const createGameRender = () => {
    return deck && (
      <Button onClick={_createGame}>New Game</Button>
    )
  }

  const joinGameRender = () => {
    if (props.contract && gameList && gameList.length > 0){
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
      return (<div>No game found</div>)
    }
  }

  return (
    <Container>
    <DivNice>
    Annimal Dominance is a P2E Card Game.<br/><br/>
    Play games to increase the level of your animals as well of the value of your cards.<br/><br/>
    Sell/Buy cards from other players<br/>
    </DivNice>

    <DivNice>
    {reanderLoading()}
    </DivNice>
    <DivNice>
    Select your deck :
    {deckSelectRender()}
    </DivNice>
    <DivNice>
    {createGameRender()}
    </DivNice>
    <DivNice>
    {joinGameRender()}
    </DivNice>
    </Container>
  )
}

export default FindGame
