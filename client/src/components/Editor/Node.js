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

const Node = forwardRef(({ id, x, y, type, selected, wireStart, wireEnd, dragStart, dragEnd, click, doubleClick }, ref) => {

  const textElement = useRef(null);
  const rectElement = useRef(null);
  const outputPorts = useRef([]);
  const outWires = useRef([]);
  const inWires = useRef([]);
  const dragStartPosition = useRef({ x, y }); // track drag start to get offsets of wires
  const isDrag = useRef(false);           // is dragging vs. clicking
  const clickCount = useRef(0);

  const [position, setPosition] = useState({
    x,
    y,
    coords: {},
  });

  const [width, setWidth] = useState(NODE_WIDTH);

  useImperativeHandle(ref, () => {
    return {
      getPortPosition: (type, port) => {
        const yPos = position.y + PORT_MARGIN + port * (PORT_HEIGHT_WIDTH + PORT_SPACING) + PORT_HEIGHT_WIDTH / 2;
        const xPos = position.x + (type === 'out' ? width : 0);
        return [xPos, yPos];
      },
      setDragWires: (inputWires, outputWires) => {
        inWires.current = inputWires;
        outWires.current = outputWires;
      }
    };
  }, [width, position.x, position.y]);

  useEffect(() => {
    if (textElement.current === null)
      return;
    // adjust width of node based on label
    const rectWidth = textElement.current.getComputedTextLength() + ICON_WIDTH + RIGHT_MARGIN;
    setWidth(rectWidth);

  }, [width]);

  const onMouseDown = (e) => {
    e.stopPropagation();
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
      // TODO: should this be moved to the editor and we have a monitor callback?
      for (const el of outWires.current) {
        el.moveStart(dragStartPosition.current.x - x, dragStartPosition.current.y - y);
      }
      for (const el of inWires.current) {
        el.moveEnd(dragStartPosition.current.x - x, dragStartPosition.current.y - y);
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

  const onMouseUp = (e) => {
    // fire click or double click if we didn't move
    if (!isDrag.current) {
      clickCount.current = clickCount.current + 1;
      // if we're here in time, we have a double click
      if (clickCount.current > 1) {
        doubleClick(e, id);
      }
      setTimeout(() => {
        // time has passed, but no second click
        if (clickCount.current === 1) {
          click(e, id);
        }
        // clear possibility of second click
        clickCount.current = 0;
      }, 100);
    }
    document.removeEventListener('mousemove', handleMouseMove);
    setPosition(position => {
      return { ...position, coords: {} };
    });
    dragStartPosition.current.x = position.x;
    dragStartPosition.current.y = position.y;
    dragEnd && dragEnd(id, position.x, position.y);
  }

  const onPortMouseUp = (e, type, port) => {
    wireEnd(e, id, type, port);
  }

  const onPortMouseDown = (portX, portY, type, port) => {
    // position of port is node position + port position
    let wireX = position.x + portX;
    let wireY = position.y + portY;
    wireStart(id, wireX, wireY, type, port);
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
      x={width - PORT_HEIGHT_WIDTH / 2}
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
    <g className={`editor-node ${selected ? 'editor-selected' : ''}`}
      transform={`translate(${position.x} ${position.y})`}>
      <rect ref={rectElement} width={width} height={nodeHeight} rx="5" ry="5"
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