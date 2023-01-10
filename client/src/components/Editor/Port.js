

import { useRef, forwardRef } from "react";

export const PORT_HEIGHT_WIDTH = 10;

export const Port = forwardRef(({ x, y, type, port, mouseDown, mouseUp }, ref) => {

    const rectElement = useRef(null);

    const handleMouseDown = (e) => {
        e.preventDefault();
        console.log(rectElement.current);
        // get x and y that may have moved
        x = +rectElement.current.getAttribute("x") + PORT_HEIGHT_WIDTH / 2
        y = +rectElement.current.getAttribute("y") + PORT_HEIGHT_WIDTH / 2
        mouseDown(e, x, y, type, port);
    }

    const handleMouseUp = (e) => {
        e.preventDefault();
        mouseUp(e, type, port);
    }

    return (
        <rect ref={(el) => {
                // use ref to rectangle locally
                rectElement.current = el;
                // forward ref from node
                if (ref) {
                    if (typeof ref === 'function') {
                        return ref(el);
                    } else if (ref) {
                        ref.current = el;
                    }
                }
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            width={PORT_HEIGHT_WIDTH}
            height={PORT_HEIGHT_WIDTH}
            rx="3" ry="3"
            x={x}
            y={y} />)
})

export default Port;