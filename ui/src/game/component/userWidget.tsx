import type {
  UserType,
} from '../../type/userType'


const UserWidget = (props : {
  gameId : number
  user ?: UserType
}) => {

  return (
    <span id='user-widget'>
      { props.user &&
        <>{props.user.name}#{props.user.id}</>
      }
      { !!props.gameId &&
        <> in game {props.gameId}</>
      }
      {
        !props.user &&
          <>User not registered</>
      }
    </span>
  )
}

export default UserWidget
