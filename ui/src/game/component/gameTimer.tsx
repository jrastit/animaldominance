import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import ProgressBar from 'react-bootstrap/ProgressBar'


const GameTimer = (props : {
  myTurn : number
  latestTime : number
  endGameByTime: () => void,
}) => {

  const getTimestamp = () => {
    return Date.now();
  }

  const [timestamp, setTimestamp] = useState<number>(getTimestamp())

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimestamp(getTimestamp())
    }, 100);

    return () => clearTimeout(timer)
  })

  let remainingTime = 180 - ((timestamp/1000) - (props.latestTime))
  if (remainingTime < 0) {
    remainingTime = 0
  }
  const remaining_min = (Math.floor(remainingTime / 60))
  const remaining_sec = (Math.floor(remainingTime) % 60)
  const remaining_label =
    (remaining_min ? remaining_min + ':' : '') +
    (remaining_sec < 10 ? '0' : '') +
    remaining_sec


  return (
    <>
    {(remainingTime > 0 || !!props.myTurn) &&
      <ProgressBar now={(remainingTime) * 100 / 180} label={remaining_label}/>
    }
    {remainingTime === 0 && !props.myTurn &&
      <div style={{textAlign : 'center'}}><Button onClick={props.endGameByTime}>Win game by time</Button></div>
    }
    </>
  )
}

export default GameTimer
