import Button from 'react-bootstrap/Button'

import {
  StepType,
  Step
} from '../reducer/contractSlice'


const StepMessageNiceWidget = (props : {
  title : string
  step : StepType
  resetStep : () => void
}) => {

  let stepCaption

  switch (props.step.step) {
    case Step.Creating :
    stepCaption = 'Creating...'
    break
    case Step.Loading :
    stepCaption = 'Loading...'
    break
    case Step.Empty :
    stepCaption = 'Empty'
    break
    case Step.NotSet :
    stepCaption = 'Not set'
    break
    case Step.Ok :
    stepCaption = 'Ready!'
    break
  }

  return (<>
    <div>{props.title} {stepCaption}</div>
    <div>{props.step.message}</div>
  { !!props.step.error &&
    <div style={{color:'red'}}>
    <div>{props.step.error}</div>
    {props.resetStep &&
      <Button variant='danger' onClick={props.resetStep}>Ok</Button>
    }
    </div>
  }
  </>)
}

export default StepMessageNiceWidget
