import Image from 'react-bootstrap/Image'

const format = (num : number | string) =>
    String(num).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1 ')

const cardWidget = (props : {
  family : number
  name : string
  mana : number
  level : number
  attack : number
  life : number
  description : string
  exp: number
}) => {

  let familyColor="black"
  switch (props.family){
    case 1:
      familyColor="#3D550C"
    break
    case 2:
      familyColor="#0c2d48"
    break
    case 3:
      familyColor="#870A30"
    break
    case 4:
      familyColor="#613659"
    break
    default:
      familyColor="pink"
    break
  }

  let levelColor="black"
  switch (props.level){
    case 0:
      levelColor="black"
    break
    case 1:
      levelColor="#202020"
    break
    case 2:
      levelColor="#404040"
    break
    case 3:
      levelColor="#996515"
    break
    case 4:
      levelColor="#daa520"
    break
    case 5:
      levelColor="#ffd700"
    break
    default:
    break
  }

  return (
    <div style={{
      borderRadius:"1.2em",
      padding:"0.75em",
      backgroundColor:familyColor,
      width:"12em",
      height:"18em",
      //marginBottom:"2em",
      color:"white",
      fontWeight:"bolder",
      marginLeft:"auto",
      marginRight:"auto",
    }}>
    <div style={{
      borderRadius:"0.5em",
      width:"10.5em",
      height:"16.5em",
      backgroundColor:levelColor,
      paddingLeft:"0.5em",
      paddingRight:"0.5em",
    }}>
      <Image src={"animal/"+ props.name.split(" ").join("") + ".jpg"} style={{
        marginTop:"1.2em",
        borderRadius:"0.5em",
        width:"9.5em",
        height:"7em",
      }}/>
      <div style={{
        marginTop:"-8.7em",
        marginBottom:"7em",
      }}>
        <div style={{
          textAlign:"center",
          border:"thin solid #303437",
          borderRadius:"0.5em",
          backgroundColor:"rgba(0, 0, 0, 0.50)"
        }}>{props.name}</div>
        <div style={{
          marginTop:"-1em",
          marginBottom:"-1em",
        }}>
        <div style={{
          marginLeft:"8.5em",
          textAlign:"center",
          width:"2em",
          height:"2em",
          paddingTop:"0.2em",
          border:"thin solid #303437",
          borderRadius:"1em",
          display:"inline-block",
          backgroundColor:"#341948"
        }}>{props.mana}</div>
        </div>
      </div>
      <Image fluid src={"animal/"+ props.name.split(" ").join("") + ".jpg"} style={{
        marginTop:".2em",
        borderRadius:"0.5em",
        width:"9.5em",
        height:"7em",
        transform: "scaleY(-1)",
        opacity:".2"
      }}/>
      <div style={{
        marginTop:"-8em",
        marginBottom:"-.7em",
        display:"flex",
        marginRight:"-1em",
        zIndex:"1",
      }}>
      <div style={{
        marginLeft:"-1em",
        textAlign:"center",
        width:"2em",
        height:"2em",
        paddingTop:"0.2em",
        border:"thin solid #303437",
        borderRadius:"1em",
        flexBasis:"2em",
        backgroundColor:"#DF362D"
      }}>{props.attack}</div>
      <div style={{
        flexGrow:"1",

      }}>
      </div>
      <div style={{
        textAlign:"center",
        width:"2em",
        height:"2em",
        paddingTop:"0.2em",
        border:"thin solid #303437",
        borderRadius:"1em",
        flexBasis:"2em",
        backgroundColor:"#4c5270"
      }}>{props.life}</div>
      </div>
      <div style={{
        height:"7.5em",
      }}>
        <div style={{
          textAlign:"center",
          border:"thin solid #303437",
          borderRadius:"0.5em",
          backgroundColor:familyColor,
          fontWeight:"normal",
        }}>
          {props.description}
        </div>
      </div>
      <div style={{
        marginRight:"2.5em",
        marginLeft:"2.5em",
        textAlign:"center",
        border:"thin solid #303437",
        borderRadius:"1em",
        backgroundColor:"white",
        color:"black",

      }}>
      <div style={{
        fontSize:".7em",
        marginTop:"-.2em",
        marginBottom:"-.2em",
        fontWeight:"normal",
        }}>
      {format(props.exp)}
      </div>
      </div>


    </div>
    </div>
  )
}

export default cardWidget
