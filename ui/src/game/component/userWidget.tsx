import type {
  UserType,
} from '../../type/userType'


const UserWidget = (props : {
  user ?: UserType
}) => {

  if (props.user) {
    return <div>user {props.user.id} - {props.user.name}</div>
  }

  return (
    <div>User not registered</div>
  )
}

export default UserWidget
