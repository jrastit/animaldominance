import type {
  UserType,
} from '../../type/userType'


const UserWidget = (props : {
  user ?: UserType
}) => {

  return (
    <span id='user-widget'>
      { props.user &&
        <>{props.user.name}#{props.user.id}</>
      }
      { props.user && props.user.gameId &&
        <>in game {props.user.gameId}</>
      }
      {
        !props.user &&
          <>User not registered</>
      }
    </span>
  )
}

export default UserWidget
