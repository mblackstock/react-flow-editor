/**
 * EditorNode
 * 
 * Displays a node in the editor using SVG.
 * 
 * @link https://stackoverflow.com/questions/53458053/how-to-handle-react-svg-drag-and-drop-with-react-hooks
 */

import { useState, useRef, useCallback } from "react";
import { getNodeByType } from "../services/registry";

const EditorNode = ({ id, x, y, type }) => {

    const [position, setPosition] = useState({
        x,
        y,
        coords: {},
    });

    const isDrag = useRef(false)

    const [selected, setSelected] = useState(false);

    // Use useCallback to create the function once and hold a reference to it.  Otherwise
    // a different function is created every time its rendered
    const handleMouseMove = useCallback((e) => {
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
    },[]);

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
        document.addEventListener('mousemove', handleMouseMove);
    }

    const onMouseUp = (e) => {
        // toggle selected if we didn't move
        if (!isDrag.current) {
            setSelected(!selected);
        }
        document.removeEventListener('mousemove', handleMouseMove);
        setPosition({ ...position, coords: {} })
    }

    var node = getNodeByType(type);

    return (
        <g className={`editor-node ${selected?"editor-node-selected":""}`} transform={`translate(${position.x - 50} ${position.y - 15})`}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}>
            <rect width="100" height="30"  rx="5" ry="5" />
            <text className="editor-node-label" x="20" y="20" >{type}</text>
            {node.inputs > 0 && <rect width="10" height="10" rx="3" ry="3" x="-5" y="10" />}
            {node.outputs > 0 && <rect width="10" height="10" rx="3" ry="3" x="95" y="10" />}
        </g>);

}

export default EditorNode;