/**
 * Node
 * 
 * Displays a node in the editor using SVG.
 * 
 * @link https://stackoverflow.com/questions/53458053/how-to-handle-react-svg-drag-and-drop-with-react-hooks
 */

import { useState, useRef, useCallback, useEffect } from "react";
import * as registry from "../../services/registry";
import { Port, PORT_HEIGHT_WIDTH } from "./Port";

const PORT_MARGIN = 8;
const PORT_SPACING = 4;
const NODE_WIDTH = 100;
const ICON_WIDTH = 20; // left margin
const RIGHT_MARGIN = 15;

const Node = ({ id, x, y, type, wireStart, wireEnd }) => {

    const textElement = useRef(null);
    const rectElement = useRef(null);
    const outputPorts = useRef([]);

    useEffect(() => {
        if (textElement.current === null)
            return;

        // adjust width of node based on label
        const rectWidth = textElement.current.getComputedTextLength() + ICON_WIDTH + RIGHT_MARGIN;
        rectElement.current.setAttribute("width", rectWidth);

        // move the output ports in position after resize
        for (const port of outputPorts.current) {
            port.setAttribute("x", rectWidth - PORT_HEIGHT_WIDTH / 2)
        }

        // find the newly added wire and adjust its position?
        
    }, []);

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
        console.log('move')
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
    }, []);

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

    const onPortMouseUp = (e, type, port) => {
        console.log(`port mouse up${type} ${port}`);
        wireEnd(e, id, type, port);
    }

    const onPortMouseDown = (e, portX, portY, type, port) => {
        console.log(`port mouse down ${type} ${port}`);
        // position of port is node position + port position
        let wireX = position.x + portX - 50;
        let wireY = position.y + portY - 15;
        wireStart(e, id, wireX, wireY, type, port);
    }

    // TODO: from registry, create flow node entry
    let nodeFromRegistry = registry.getNodeByType(type);
    let node = { ...nodeFromRegistry, id }

    let maxPorts = Math.max(node.inputs, node.outputs);
    let nodeHeight = PORT_MARGIN * 2 + maxPorts * (PORT_HEIGHT_WIDTH + PORT_SPACING) - PORT_SPACING;

    let inputs = [];
    let key = 1;
    for (let i = 0; i < node.inputs; i++) {
        let yPos = PORT_MARGIN + i * (PORT_HEIGHT_WIDTH + PORT_SPACING);
        inputs.push(<Port
            key={key}
            x={-PORT_HEIGHT_WIDTH / 2}
            y={yPos}
            type='input'
            port={i}
            mouseDown={onPortMouseDown}
            mouseUp={onPortMouseUp}
        />)
        key++;
    }

    let outputs = [];
    for (let i = 0; i < node.outputs; i++) {
        let yPos = PORT_MARGIN + i * (PORT_HEIGHT_WIDTH + PORT_SPACING);
        outputs.push(<Port
            key={key}
            ref={(el) => outputPorts.current.push(el)}
            x={NODE_WIDTH - PORT_HEIGHT_WIDTH / 2}
            y={yPos}
            type='output'
            port={i}
            mouseDown={onPortMouseDown}
            mouseUp={onPortMouseUp}
        />)
        key++;
    }

    // note that we add mousdown/up events to sub elements.  If we add it to the group
    // then the ports don't get events.
    return (
        <g className={`editor-node ${selected ? 'editor-node-selected' : ''}`}
            transform={`translate(${position.x - 50} ${position.y - 15})`}>
            <rect ref={rectElement} width={NODE_WIDTH} height={nodeHeight} rx="5" ry="5"
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp} />
            <text ref={textElement} className="editor-node-label" x="20" y="18"
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
            >{type}</text>
            {inputs}
            {outputs}
        </g >);

};

export default Node;