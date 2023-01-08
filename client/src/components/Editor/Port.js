
export const PORT_HEIGHT_WIDTH = 10;

export const Port = ({ x, y, type, port, mouseDown, mouseUp }) => {

    return (
        <rect
            onMouseDown={e => { e.preventDefault();
                mouseDown(e, x+PORT_HEIGHT_WIDTH/2,y+PORT_HEIGHT_WIDTH/2,type, port);
                }}
            onMouseUp={e => {e.preventDefault();
                mouseUp(e, type, port);
                }}
            width={PORT_HEIGHT_WIDTH}
            height={PORT_HEIGHT_WIDTH}
            rx="3" ry="3"
            x={x}
            y={y} />)
}

export default Port;