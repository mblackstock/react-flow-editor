

import { useRef, forwardRef, useImperativeHandle } from "react";

export const PORT_HEIGHT_WIDTH = 10;

export const Port = forwardRef(({ x, y, type, port, mouseDown, mouseUp }, ref) => {

    const rectElement = useRef(null);

    useImperativeHandle(ref, () => {
        return {
            // adjust with node width
            setX: (x) => {
                rectElement.current.setAttribute("x", x);
            }
        };
      },[]);

    const handleMouseDown = (e) => {
        e.preventDefault();
        // get x and y that may have moved
        x = +rectElement.current.getAttribute("x") + PORT_HEIGHT_WIDTH / 2
        y = +rectElement.current.getAttribute("y") + PORT_HEIGHT_WIDTH / 2
        mouseDown(x, y, type, port);
    }

    const handleMouseUp = (e) => {
        e.preventDefault();
        mouseUp(e, type, port);
    }

    return (
        <rect ref={rectElement}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            width={PORT_HEIGHT_WIDTH}
            height={PORT_HEIGHT_WIDTH}
            rx="3" ry="3"
            x={x}
            y={y} />)
})

export default Port;