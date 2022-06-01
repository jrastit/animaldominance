import ButtonNice from '../../component/buttonNice'
import DivNice from '../../component/divNice'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import CardWidget from '../component/cardWidget'

import { useAppSelector, useAppDispatch } from '../../hooks'

import { GameCardType } from '../../type/gameType'

import {
  Step,
  StepId,
  updateStep,
} from '../../reducer/contractSlice'

import {
  cleanGame
} from '../../reducer/gameSlice'

import {
  getLevel
} from '../../game/card'

import {
  endGameId
} from '../../reducer/userSlice'

const GameEndedWidget = () => {

  const cardList = useAppSelector((state) => state.cardListSlice.cardList)
  const game = useAppSelector((state) => state.gameSlice.game)
  const user = useAppSelector((state) => state.userSlice.user)
  const dispatch = useAppDispatch()

  const isWinner = () => {
    if (user && game){
      if (game.winner === user.id){
        return 1
      }
    }
    return 0
  }

  const _exitGame = () => {
    dispatch(cleanGame())
    game && dispatch(endGameId(game.id))
    dispatch(updateStep({id : StepId.Game, step : Step.Init}))
  }

  const displayCardWin = (gameCard : GameCardType) => {
    const card = cardList.filter(_card => _card.id === gameCard.cardId)[0]
    const level1 = getLevel(gameCard.exp)
    const level2 = getLevel(gameCard.exp + gameCard.expWin)
    return (
      <Row style={{marginBottom : "1em", marginTop : "1em"}}><Col>
      <div>Level {level1}</div><div>
      <CardWidget
        family={card.family}
        mana={card.mana}
        name={card.name}
        level={level1}
        attack={card.level[level1].attack}
        life={card.level[level1].life}
        description={card.level[level1].description}
        exp={gameCard.exp}
      />
      </div>
      </Col><Col>
      <div>Level {level2}</div><div>
      <CardWidget
        family={card.family}
        mana={card.mana}
        name={card.name}
        level={level2}
        attack={card.level[level2].attack}
        life={card.level[level2].life}
        description={card.level[level2].description}
        exp={gameCard.exp + gameCard.expWin}
      />
      </div>
      </Col></Row>
    )
  }

  const displayAllCardWin = () => {
    return game?.cardList1.filter(
      _card => _card?.expWin
    ).sort((_card1, _card2) => {
      if (!_card1 || !_card2) return 0
      return (_card2.exp + _card2.expWin) - (_card1.exp + _card1.expWin)
    }).map((_card, id) => {
      return (<div key={id}>
          {!!_card && displayCardWin(_card)}
        </div>)
    })
  }

  return (
    <DivNice>
        {!!isWinner() && <div>You Win game {game && game.id}!!!</div>}
        {!isWinner() && <div>You Lose game {game && game.id}!!!</div>}
        <ButtonNice onClick={_exitGame}>Ok</ButtonNice>
        {displayAllCardWin()}
    </DivNice>
  )
}

export default GameEndedWidget
