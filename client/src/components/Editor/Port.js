
export const PORT_HEIGHT_WIDTH = 10;

export const Port = ({x,y,mouseDown, mouseUp}) => {

    return (
        <rect
            onMouseDown={mouseDown}
            onMouseUp={mouseUp}
            width={PORT_HEIGHT_WIDTH}
            height={PORT_HEIGHT_WIDTH}
            rx="3" ry="3"
            x={x}
            y={y} />)
}

export default Port;