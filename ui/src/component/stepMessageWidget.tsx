import Alert from 'react-bootstrap/Alert'

import {
  StepType,
  Step
} from '../reducer/contractSlice'


const StepMessageWidget = (props : {
  step : StepType
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
  }

  if (props.step.message) {
    stepCaption = stepCaption + " " + props.step.message
  }

  return (<>
    {!!stepCaption &&
      <Alert variant='primary'>{stepCaption}</Alert>
    }
  { !!props.step.error &&
    <Alert variant='error'>{props.step.error}</Alert>
  }
  </>)
}

export default StepMessageWidget
