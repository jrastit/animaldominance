import { useState, useEffect } from 'react'

const PositionHelper = (props: { children: any }) => {
  const inputRef = { current: null } as { current: any };

  const [dom, setDom] = useState<any>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  })

  useEffect(() => {
    if (inputRef.current) {
      const current = inputRef.current as any
      setDom(current.getBoundingClientRect())
      //console.log(current.getBoundingClientRect());
    } else {
      //console.log('here')
    }
  }, [inputRef.current && inputRef.current.getBoundingClientRect()])

  const width = dom.width;
  const height = dom.height / 2;

  const length = Math.sqrt((width * width) + (height * height))

  const angle = Math.floor(Math.atan2(height, width) * 180) / Math.PI

  console.log(angle)

  return (
    <>
      <div style={{
        position: 'absolute',
        top: (dom ? dom.y : '0') + 'px',
        left: (dom ? dom.x : '0') + 'px',
        //border : '5px solid black',
        width: length + 'px',
        zIndex: 1,
        transform: 'rotate(' + angle + 'deg)',
        transformOrigin: '20px 0',
        textAlign: 'center',
        fontSize: '40px',
        color: 'red',
      }}> Wanted
    </div>
      <div ref={ref => inputRef.current = ref} style={{
        border: 'thin solid red'
      }}>
        {props.children}
      </div>
    </>
  )

}

export default PositionHelper
