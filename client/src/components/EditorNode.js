import { useState, useRef } from "react";

// see https://stackoverflow.com/questions/53458053/how-to-handle-react-svg-drag-and-drop-with-react-hooks

// SvgNode
const EditorNode = ({ x, y, name }) => {

    const [position, setPosition] = useState({
        x,
        y,
        coords: {},
    });

    // Use useRef to create the function once and hold a reference to it.
    const handleMouseMove = useRef((e) => {
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

    const startDrag = (e) => {
        // Save the values of pageX and pageY and use it within setPosition.
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

    const endDrag = (e) => {
        document.removeEventListener('mousemove', handleMouseMove.current);
        setPosition({ ...position, coords: {} })
    }

    return (
        <g transform={`translate(${position.x - 50} ${position.y - 15})`}
            onMouseDown={startDrag}
            onMouseUp={endDrag}>
            <rect width="100" height="30" style={{
                fill: "rgb(200,200,200)",
                strokeWidth: 2,
                stroke: "rgb(0,0,0)",
                rx: 8,
                ry: 8
            }} />
            <text x="20" y="20">{name}</text>
        </g>);

}

export default EditorNode;