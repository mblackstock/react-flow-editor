import { useState, useRef } from "react";

// see https://stackoverflow.com/questions/53458053/how-to-handle-react-svg-drag-and-drop-with-react-hooks

// SvgNode
const EditorNode = ({ id, x, y, name }) => {

    const [position, setPosition] = useState({
        x,
        y,
        coords: {},
    });

    const isDrag = useRef(false)

    const [selected, setSelected] = useState(false);

    // Use useRef to create the function once and hold a reference to it.  Otherwise
    // a different function is created every time!
    const handleMouseMove = useRef((e) => {
        // we are dragging
        isDrag.current = true;
        setPosition(position => {
            const xDiff = position.coords.x - e.pageX;  // how far we moved
            const yDiff = position.coords.y - e.pageY;
            return {
                x: position.x - xDiff,                  // change group position by this amount
                y: position.y - yDiff,
                coords: {
                    x: e.pageX,
                    y: e.pageY,
                },
            };
        });
    });

    const onMouseDown = (e) => {
        // assume we are not dragging until we get a mouse move event
        isDrag.current = false;
        const pageX = e.pageX;
        const pageY = e.pageY;
        setPosition(position => Object.assign({}, position, {
            coords: {
                x: pageX,           // where we started
                y: pageY,
            },
        }));
        document.addEventListener('mousemove', handleMouseMove.current);
    }

    const onMouseUp = (e) => {
        // toggle selected if we didn't move
        if (!isDrag.current) {
            setSelected(!selected);
        }
        document.removeEventListener('mousemove', handleMouseMove.current);
        setPosition({ ...position, coords: {} })
    }

    return (
        <g className={`editor-node ${selected?"editor-node-selected":""}`} transform={`translate(${position.x - 50} ${position.y - 15})`}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}>
            <rect width="100" height="30"  rx="8" ry="8" />
            <text className="editor-node-label" x="20" y="20" >{name}</text>
        </g>);

}

export default EditorNode;