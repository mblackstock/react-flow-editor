/**
 * Node
 * 
 * Displays a node in the editor using SVG.
 * 
 * @link https://stackoverflow.com/questions/53458053/how-to-handle-react-svg-drag-and-drop-with-react-hooks
 */

import * as registry from "../../services/registry";
import { Port, PORT_HEIGHT_WIDTH } from "./Port";

import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";

const PORT_MARGIN = 8;
const PORT_SPACING = 4;
const NODE_WIDTH = 100;
const ICON_WIDTH = 20; // left margin
const RIGHT_MARGIN = 15;

const Node = forwardRef(({ id, x, y, type, wireStart, wireEnd, dragStart, dragEnd }, ref) => {

    const textElement = useRef(null);
    const rectElement = useRef(null);
    const outputPorts = useRef([]);
    const outWires = useRef([]);
    const inWires = useRef([]);
    // track drag start to get offsets of wires
    const dragStartPosition = useRef({x,y});

    const [position, setPosition] = useState({
        x,
        y,
        coords: {},
    });

    useImperativeHandle(ref, () => {
        return {
          getPortPosition: (type, port) => {
            const rectWidth = +rectElement.current.getAttribute('width');
            // properties may not be out of date since we were dragged
            const yPos = position.y + PORT_MARGIN + port * (PORT_HEIGHT_WIDTH + PORT_SPACING)+PORT_HEIGHT_WIDTH/2;
            const xPos = position.x + (type === 'out' ? rectWidth:0);
            return [xPos, yPos];
          },
          setDragWires: (inputWires, outputWires) => {
            inWires.current = inputWires;
            outWires.current = outputWires;
          }
        };
      }, [position.x, position.y]);

    useEffect(() => {
        if (textElement.current === null)
            return;

        // adjust width of node based on label
        const rectWidth = textElement.current.getComputedTextLength() + ICON_WIDTH + RIGHT_MARGIN;
        rectElement.current.setAttribute("width", rectWidth);

        // move the output ports in position after resize
        for (const port of outputPorts.current) {
            port.setX(rectWidth - PORT_HEIGHT_WIDTH / 2)
        }

    }, []);

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

            // new position of the node
            const x = position.x - xDiff;
            const y = position.y - yDiff;

            // move the wires as we drag, but don't rerender them.
            for (const el of outWires.current) {
                el.moveStart(dragStartPosition.current.x-x,dragStartPosition.current.y-y);
            }
            for (const el of inWires.current) {
                el.moveEnd(dragStartPosition.current.x-x,dragStartPosition.current.y-y);
            }
            return {
                x,                  // change group position by this amount
                y,
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
        dragStart && dragStart(id);
    }

    const onMouseUp = (e) => {
        // toggle selected if we didn't move
        if (!isDrag.current) {
            setSelected(!selected);
        }
        document.removeEventListener('mousemove', handleMouseMove);
        setPosition({ ...position, coords: {} });
        dragStartPosition.current.x = position.x;
        dragStartPosition.current.y = position.y;
        dragEnd && dragEnd(id, position.x, position.y);
    }

    const onPortMouseUp = (e, type, port) => {
        console.log(`port mouse up${type} ${port}`);
        wireEnd(e, id, type, port);
    }

    const onPortMouseDown = (e, portX, portY, type, port) => {
        console.log(`port mouse down ${type} ${port}`);
        // position of port is node position + port position
        let wireX = position.x + portX;
        let wireY = position.y + portY;
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
            type='in'
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
            ref={(el) => el && outputPorts.current.push(el)}
            x={NODE_WIDTH - PORT_HEIGHT_WIDTH / 2}
            y={yPos}
            type='out'
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
            transform={`translate(${position.x} ${position.y})`}>
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

});

export default Node;