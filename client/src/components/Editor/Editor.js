import Node from "./Node";
import Wire from "./Wire"
import "./Editor.css";

import { useState, useEffect, useCallback, useRef } from 'react';

const Editor = ({ flow }) => {

    // const [, forceUpdate] = useReducer(x => x + 1, 0);

    // nodes, wires, tabs in current flow
    const [nodes, setNodes] = useState([]);
    const [wires, setWires] = useState([]);

    const [dragWire, setDragWire] = useState({
        type: 'out',        // type of starting port
        startNode: '',      // start node id
        startPort:0,        // start port number
        endNode: '',
        endPort: 0,
    
        hidden: true,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0
    });

    const svgElement = useRef(null);
    const nodeElements = useRef({});
    const wireElements = useRef([]);

    // load up the nodes provided
    useEffect(() => {
        if (flow?.nodes) {
            setNodes(flow.nodes)
        }
    }, [flow]);

    // generate a unique node id
    const generateId = () => (Math.floor(1 + Math.random() * 4294967295)).toString(16);

    const drop = (e) => {
        e.preventDefault();
        // note e.target.getBoundingClientRect() gets child element bounding box, not the svg!
        const rect = e.currentTarget.getBoundingClientRect();
        const nodeType = e.dataTransfer.getData("text");
        console.log(nodeType)
        const x = e.clientX - rect.left; //x position within the element.
        const y = e.clientY - rect.top;  //y position within the element.
        // create a new node
        setNodes(nodes => {
            const newNode = {
                id: generateId(),
                type: nodeType,
                x:x-50, y:y-15  // TODO: place it in the canvas more centered - figure out offsets?
            }
            // add element there
            return [...nodes, newNode];
        });
    };

    const onDragOver = (e) => {
        // needed for drag to work
        e.preventDefault();
    }

    // moved a node
    const nodeDragStart = (id) => {
        // find the wires that are attached to the node for the drag
        const outputWires = [];
        const inputWires = [];
        const nodeElement = nodeElements.current[id];
        // find all of the rendered wires connected to the node for drag
        for (const wire of wireElements.current) {
            if (wire.startNode === id)
                outputWires.push(wire.el);
            if (wire.endNode === id)
                inputWires.push(wire.el);
        }
        // tell the node component about wires connected during drag
        nodeElement.setDragWires(inputWires, outputWires);
    }

    const changeNode = (nodes, id, change) => {
        const newNodes = [...nodes];
        const node = newNodes.find(node => node.id === id);
        change(node);
        return newNodes;
    }

    // when drag completed, update our node array state with position
    const nodeDragEnd = (id, x, y) => {
        // setTimeout forces re-rendering later, otherwise wire
        // rendering uses old node positions
        setTimeout(() => {
            setNodes((nodes) => {
                return changeNode(nodes, id, (node) => {
                    node.x = x; node.y = y;
                });
            });
        },0);
    }

    // dragging the wire between ports
    const handleWireMouseMove = useCallback((e) => {
        e.preventDefault();
        const rect = svgElement.current.getBoundingClientRect();
        const x = e.clientX - rect.left; //x position within the element.
        const y = e.clientY - rect.top;  //y position within the element.
        setDragWire(dragWire => {
            const newDragWire = {...dragWire};
            if (dragWire.type === 'out') {
                newDragWire.x1 = dragWire.x1;
                newDragWire.y1 = dragWire.y1;
                newDragWire.x2 = x;
                newDragWire.y2 = y;
            } else {
                newDragWire.x1 = x;
                newDragWire.y1 = y;
                newDragWire.x2 = dragWire.x2;
                newDragWire.y2 = dragWire.y2;
            }
            return newDragWire;
        });
    }, []);

    const handleMouseUp = useCallback(() => {
        setDragWire({...dragWire, hidden: true});
        document.removeEventListener('mousemove', handleWireMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    },[dragWire, handleWireMouseMove]);

    // port mouse down on this node
    const wireStart = (id, x, y, type, port) => {
        setDragWire({
            type,
            startNode: id,
            startPort: port,
            hidden: false,
            x1: x,
            y1: y,
            x2: x,
            y2: y
        });
        document.addEventListener('mousemove', handleWireMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    // port mouse up on this node
    const wireEnd = (e, id, type, port) => {
        setDragWire({...dragWire, hidden: true});
        document.removeEventListener('mousemove', handleWireMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // can't connect inputs to inputs, outputs to outputs
        if (type === dragWire.type) return;

        // add the new wire to our state to be draw in rendering
        const newWire = {};
        if (dragWire.type === 'out') {
            newWire.startNode = dragWire.startNode;
            newWire.startPort = dragWire.startPort;
            newWire.endNode = id;
            newWire.endPort = port;
        } else {
            newWire.endNode = dragWire.startNode;
            newWire.endPort = dragWire.startPort;
            newWire.startNode = id;
            newWire.startPort = port;
        }
        setWires([...wires, newWire]);
    }

    const nodeClick = (id) => {
        console.log(`click ${id}`);
        setNodes((nodes) => {
            return changeNode(nodes, id, (node) => {
                node.selected = true;
            });
        });
    }

    const doubleClick = (id) => {
        console.log(`doubleClick ${id}`);
    }

    const nodeList = nodes.map((node) => (<Node
        ref={(el) => {
            if (el === null) {
                delete nodeElements.current[node.id];
            } else {
                nodeElements.current[node.id] = el;
            }
        }}
        key={node.id}
        id={node.id}
        x={node.x}
        y={node.y}
        type={node.type}
        selected={node.selected?true:false}
        wireStart={wireStart}
        wireEnd={wireEnd}
        dragStart={nodeDragStart}
        dragEnd={nodeDragEnd}
        click={nodeClick}
        doubleClick={doubleClick}
    />));

    wireElements.current = [];
    const wireList = wires.map((wire) => {
        // get the positions of ports to draw the wires
        let el = nodeElements.current[wire.startNode];
        const [x1, y1] = el.getPortPosition('out', wire.startPort);
        el = nodeElements.current[wire.endNode];
        const [x2, y2] = el.getPortPosition('in', wire.endPort);
        return <Wire
            ref={(el) => {
                el && wireElements.current.push({el:el, startNode: wire.startNode, endNode: wire.endNode});
            }}
            key={`${wire.startNode}/${wire.startPort}-${wire.endNode}/${wire.endPort}`}
            hidden={false} x1={x1} y1={y1} x2={x2} y2={y2} />
    });
    

    return (
        <div className="editor" >
            <svg ref={svgElement} width="1000px" height="1000px"
                shapeRendering="geometricPrecision"
                onDrop={drop}
                onDragOver={onDragOver}>
                <Wire hidden={dragWire.hidden}
                    x1={dragWire.x1}
                    y1={dragWire.y1}
                    x2={dragWire.x2}
                    y2={dragWire.y2} />
                <g className="all-wires" >
                    {wireList}
                </g>
                <g className="all-nodes" >
                    {nodeList}
                </g>
            </svg>
        </div>)
}

export default Editor;