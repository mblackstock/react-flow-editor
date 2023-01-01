/**
 * EditorNode
 * 
 * Displays a node in the editor using SVG.
 * 
 * @link https://stackoverflow.com/questions/53458053/how-to-handle-react-svg-drag-and-drop-with-react-hooks
 */

import { useState, useRef, useCallback } from "react";
import * as registry from "../services/registry";


const PORT_MARGIN = 8;
const PORT_HEIGHT_WIDTH = 10;
const PORT_SPACING = 4;
const NODE_WIDTH = 100;

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

    // TODO: from registry, create flow node entry
    let nodeFromRegistry = registry.getNodeByType(type);
    let node = {...nodeFromRegistry, id:id}

    let maxPorts = Math.max(node.inputs, node.outputs);
    let nodeHeight = PORT_MARGIN*2+maxPorts*(PORT_HEIGHT_WIDTH+PORT_SPACING)-PORT_SPACING;

    let inputs = [];
    for (let i=0; i<node.inputs; i++) {
        let yPos = PORT_MARGIN+i*(PORT_HEIGHT_WIDTH+PORT_SPACING);
        inputs.push(<rect key={i+1}
            width={PORT_HEIGHT_WIDTH}
            height={PORT_HEIGHT_WIDTH}
            rx="3" ry="3"
            x={-PORT_HEIGHT_WIDTH/2}
            y={yPos} />)
    }

    let outputs = [];
    for (let i=0; i<node.outputs; i++) {
        let yPos = PORT_MARGIN+i*(PORT_HEIGHT_WIDTH+PORT_SPACING);
        outputs.push(<rect key={i+1}
            width="10"
            height="10"
            rx="3" ry="3"
            x={NODE_WIDTH-PORT_HEIGHT_WIDTH/2}
            y={yPos} />)
    }

    return (
        <g className={`editor-node ${selected?"editor-node-selected":""}`} transform={`translate(${position.x - 50} ${position.y - 15})`}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}>
            <rect width={NODE_WIDTH} height={nodeHeight} rx="5" ry="5" />
            <text className="editor-node-label" x="20" y="18" >{type}</text>
            {inputs}
            {outputs}
        </g>);

}

export default EditorNode;