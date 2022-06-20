import { useState } from 'react'

import Container from 'react-bootstrap/Container';
import Button from '../component/buttonNice'
import DivNice from '../component/divNice'
import StepMessageNiceWidget from '../component/stepMessageNiceWidget'
import DeckSelect from '../game/component/deckSelect'
import FormControl from 'react-bootstrap/FormControl'

import { ContractHandlerType } from '../type/contractType'

import {
  joinGame,
  createGame,
  createGameBot,
} from '../game/gameList'

import {
  UserDeckType
} from '../type/userType'

import {
  setUserDeckList,
} from '../reducer/userSlice'

import {
  setGameId,
} from '../reducer/gameSlice'

import { useAppSelector, useAppDispatch } from '../hooks'

import {
  updateStep,
  setError,
  clearError,
  getStep,
  isStep,
  StepId,
  Step,
} from '../reducer/contractSlice'

import {
  updateContract,
} from '../game/reducer/contract'

import {
  registerUser,
  addUserDefaultDeck,
} from '../game/user'

const FindGame = (props: {
  contractHandler : ContractHandlerType,
}) => {

  const step = useAppSelector((state) => state.contractSlice.step)
  const user = useAppSelector((state) => state.userSlice.user)
  const gameList = useAppSelector((state) => state.gameSlice.gameList)
  const userCardList = useAppSelector((state) => state.userSlice.userCardList)
  const userDeckList = useAppSelector((state) => state.userSlice.userDeckList)
  const network = useAppSelector((state) => state.walletSlice.network)
  const dispatch = useAppDispatch()

  const [deck, setDeck] = useState<UserDeckType | undefined>(
    userDeckList ? userDeckList[0] : undefined
  )

  const [name, setName] = useState<string>()

  const _registerUser = () => {
    if (name) {
      dispatch(updateStep({ id: StepId.User, step: Step.Loading }))
      registerUser(props.contractHandler, name).then(() => {
        dispatch(clearError(StepId.User))
      }).catch((err) => {
        dispatch(setError({ id: StepId.User, catchError: err }))
      })
    }
  }

  const reanderLoading = () => {
    return (
      <div>
        <StepMessageNiceWidget
          title='Contract'
          step={getStep(StepId.Contract, step)}
          resetStep={() => { dispatch(clearError(StepId.Contract)) }}
        />
        {isStep(StepId.Contract, Step.Ok, step) &&
          <>
            <StepMessageNiceWidget
              title='Cards'
              step={getStep(StepId.CardList, step)}
              resetStep={() => { dispatch(clearError(StepId.CardList)) }}
            />
            <StepMessageNiceWidget
              title='Game liste'
              step={getStep(StepId.GameList, step)}
              resetStep={() => { dispatch(clearError(StepId.GameList)) }}
            />
            <StepMessageNiceWidget
              title='Trading'
              step={getStep(StepId.Trading, step)}
              resetStep={() => { dispatch(clearError(StepId.Trading)) }}
            />
            <StepMessageNiceWidget
              title='NFT'
              step={getStep(StepId.Nft, step)}
              resetStep={() => { dispatch(clearError(StepId.Nft)) }}
            />
            <StepMessageNiceWidget
              title='User'
              step={getStep(StepId.User, step)}
              resetStep={() => { dispatch(clearError(StepId.User)) }}
            />
            {isStep(StepId.User, Step.Ok, step) &&
              <>
                <StepMessageNiceWidget
                  title='User Cards'
                  step={getStep(StepId.UserCardList, step)}
                  resetStep={() => { dispatch(clearError(StepId.UserCardList)) }}
                />
                <StepMessageNiceWidget
                  title='User Deck'
                  step={getStep(StepId.UserDeckList, step)}
                  resetStep={() => { dispatch(clearError(StepId.UserDeckList)) }}
                />
              </>
            }
          </>
        }

      </div>
    )
  }

  const _addUserDefaultDeck = () => {
      dispatch(updateStep({id: StepId.UserDeckList, step: Step.Creating}))
      if (userCardList){
        addUserDefaultDeck(
          props.contractHandler,
          userCardList,
        ).then((deck) => {
          let newUserDeckList = [] as UserDeckType[]
          if (userDeckList){
            newUserDeckList = userDeckList.concat([deck])
          } else {
            newUserDeckList = [deck]
          }
          dispatch(setUserDeckList(newUserDeckList))
          dispatch(updateStep({id: StepId.UserDeckList, step: Step.Ok}))
        }).catch((err) => {
          dispatch(setError({id : StepId.UserDeckList, catchError : err}))
        })
      }
  }

  const onGameJoin = async (gameId: number) => {
    if (deck) {
      dispatch(updateStep({ id: StepId.Game, step: Step.Joining }))
      joinGame(
        props.contractHandler,
        gameId,
        deck.id
      ).then(() => {
        dispatch(setGameId(gameId))
        dispatch(updateStep({ id: StepId.Game, step: Step.Ready }))
      }).catch((err) => {
        dispatch(setError({ id: StepId.Game, catchError: err }))
      })
    } else {
      dispatch(setError({ id: StepId.Game, error: 'No deck set' }))
    }
  }

  const _createGame = async () => {
    if (deck) {
      dispatch(updateStep({ id: StepId.Game, step: Step.Creating }))
      createGame(
        props.contractHandler,
        deck.id
      ).then((_gameId) => {
        dispatch(setGameId(_gameId))
        dispatch(updateStep({ id: StepId.Game, step: Step.Waiting }))
      }).catch((err) => {
        dispatch(setError({ id: StepId.Game, catchError: err }))
      })
    }

  }

  const _createGameBot = async () => {
    if (deck) {
      dispatch(updateStep({ id: StepId.Game, step: Step.Creating }))
      createGameBot(
        props.contractHandler,
        deck.id
      ).then((_gameId) => {
        dispatch(setGameId(_gameId))
        dispatch(updateStep({ id: StepId.Game, step: Step.Ready }))
      }).catch((err) => {
        dispatch(setError({ id: StepId.Game, catchError: err }))
      })
    }

  }

  const deckSelectRender = () => {
    return (
      <DeckSelect
        userDeckList={userDeckList}
        setDeck={setDeck}
        deck={deck}
        noEmpty={true}
      />
    )
  }

  const createGameRender = () => {
    return deck && (
      <>
        <Button onClick={_createGame}>New Game</Button><br /><br />
        <Button onClick={_createGameBot}>New Game against bot</Button>
      </>
    )
  }

  const joinGameRender = () => {
    if (gameList && gameList.length > 0) {
      const openGame = gameList.filter(game => !game.playGame && !game.userId2 && !game.ended)
      const myOpenGame = openGame.filter(game => user && game.userId1 === user.id)
      const gameToJoin = openGame.filter(game => user && game.userId1 !== user.id)

      return (
        <>
          <div>{openGame.length} Open Games</div>
          {!!myOpenGame.length &&
            <div>Game created, waiting for oponent</div>
          }
          {!myOpenGame.length &&
            gameToJoin.map(game => {
              if (deck) return (
                <Button
                  key={game.id}
                  onClick={() => { onGameJoin(game.id) }}
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
        Annimal Dominance is a P2E Card Game.<br /><br />
        Play games to increase the level of your animals as well of the value of your cards.<br /><br />
        Sell/Buy cards from other players<br />
      </DivNice>

      <DivNice>
        {reanderLoading()}
      </DivNice>
      {isStep(StepId.Contract, Step.NotFound, step) &&
        <DivNice>
        <Button onClick={() => {
          updateContract(dispatch, network, props.contractHandler)
        }}>
          Create or update contract
        </Button>
      </DivNice>
      }
      {isStep(StepId.Contract, Step.Ok, step) &&
        <>
        {isStep(StepId.User, Step.NotSet, step) &&
          <DivNice>
            <div>User not registered</div>
            <div>Enter a name to register</div>
            <div>
              <FormControl onChange={(e) => {
                setName(e.target.value)
              }}></FormControl>
            </div>
            <div>
              {!!name &&
                <Button onClick={_registerUser}>Register</Button>
              }
            </div>
          </DivNice>
        }
        {isStep(StepId.UserDeckList, Step.Empty, step) &&
          <DivNice>
          <Button onClick={_addUserDefaultDeck}>
            Get default deck
          </Button>
        </DivNice>
        }
        {isStep(StepId.UserDeckList, Step.Ok, step) &&
          <DivNice>
            Select your deck :
        {deckSelectRender()}
          </DivNice>
        }
        {deck &&
          <DivNice>
            {createGameRender()}
          </DivNice>
        }

        <DivNice>
          {joinGameRender()}
        </DivNice>
        </>
      }

    </Container>
  )
}

export default FindGame
