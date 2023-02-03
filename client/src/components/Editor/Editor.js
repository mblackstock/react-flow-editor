import Node from "./Node";
import Wire from "./Wire"
import "./Editor.css";

import { useState, useEffect, useCallback, useRef } from 'react';

const Editor = ({ flow }) => {

    // const [, forceUpdate] = useReducer(x => x + 1, 0);

    // nodes, wires, tabs in current flow
    const [nodes, setNodes] = useState([]);
    const [wires, setWires] = useState([]);

    /* wire schema:
        selected: false,
        startNode: '',      // start node id
        startPort:0,        // start port number
        endNode: '',
        endPort: 0,
    */

    /* node schema
        selected: false,
        id: generateId(),
        type: nodeType,
        x: x - 50, y: y - 15  // TODO: place it in the canvas more centered - figure out offsets?
    */

    const [dragWire, setDragWire] = useState({
        type: 'out',        // type of starting port
        startNode: '',      // start node id
        startPort: 0,        // start port number
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

    const deleteFunction = useCallback((e) => {
        if (e.key === "Delete") {
            const selectedNodes = nodes.filter(node => node.selected).map(node=>node.id);
            setWires(wires => wires.filter(wire => {
                return !(selectedNodes.includes(wire.startNode) || selectedNodes.includes(wire.endNode));
            }))
            setNodes((nodes) => nodes.filter((node) => !node.selected));
        }
    }, [nodes]);

    useEffect(() => {
        document.addEventListener("keydown", deleteFunction, false);

        return () => {
            document.removeEventListener("keydown", deleteFunction, false);
        };
    }, [deleteFunction]);

    // generate a unique node id
    const generateId = () => (Math.floor(1 + Math.random() * 4294967295)).toString(16);

    const drop = (e) => {
        e.preventDefault();
        // note e.target.getBoundingClientRect() gets child element bounding box, not the svg!
        const rect = e.currentTarget.getBoundingClientRect();
        const nodeType = e.dataTransfer.getData("text");
        const x = e.clientX - rect.left; //x position within the element.
        const y = e.clientY - rect.top;  //y position within the element.
        // create a new node
        setNodes(nodes => {
            const newNode = {
                selected: false,
                id: generateId(),
                type: nodeType,
                x: x - 50, y: y - 15  // TODO: place it in the canvas more centered - figure out offsets?
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

    // when drag completed, update our node array state with position
    const nodeDragEnd = (id, x, y) => {
        // setTimeout forces re-rendering later, otherwise wire
        // rendering uses old node positions
        setTimeout(() => {
            setNodes((nodes) => {
                const newNodes = [...nodes];
                const node = newNodes.find(node => node.id === id);
                node.x = x; node.y = y;
                return newNodes;
            });
        }, 0);
    }

    // dragging the wire between ports
    const handleWireMouseMove = useCallback((e) => {
        e.preventDefault();
        const rect = svgElement.current.getBoundingClientRect();
        const x = e.clientX - rect.left; //x position within the element.
        const y = e.clientY - rect.top;  //y position within the element.
        setDragWire(dragWire => {
            const newDragWire = { ...dragWire };
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

    // deselect all nodes if we click on the canvas
    const handleMouseDown = useCallback(() => {
        setNodes((nodes) => {
            return nodes.map((node) => {
                node.selected = false;
                return node;
            });
        });
        setWires((wires) => {
            return wires.map((wire) => {
                wire.selected = false;
                return wire;
            });
        });
    }, []);

    const handleMouseUp = useCallback(() => {
        setDragWire({ ...dragWire, hidden: true });
        document.removeEventListener('mousemove', handleWireMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }, [dragWire, handleWireMouseMove]);

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
        setDragWire({ ...dragWire, hidden: true });
        document.removeEventListener('mousemove', handleWireMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // can't connect inputs to inputs, outputs to outputs
        if (type === dragWire.type) return;

        // add the new wire to our state to be draw in rendering
        const newWire = {selected:false};
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
        newWire.id=`${newWire.startNode}-${newWire.startPort}-${newWire.endNode}-${newWire.endPort}`
        setWires([...wires, newWire]);
    }

    const nodeClick = (e, id) => {
        setNodes((nodes) => {
            return nodes.map((node) => {
                if (!e.shiftKey && node.id !== id) {
                    node.selected = false;
                }
                if (node.id === id) {
                    node.selected = true;
                }
                return node;
            });
        });
    }

    const doubleClick = (e, id) => {
        console.log(`doubleClick ${id}`);
    }

    const wireClick = (e, id) => {
        console.log(`wireClick`);
        setWires((wires) => {
            return wires.map((wire) => {
                if (!e.shiftKey && wire.id !== id) {
                    wire.selected = false;
                }
                if (wire.id === id) {
                    wire.selected = true;
                }
                return wire;
            });
        });
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
        selected={node.selected}
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
                el && wireElements.current.push({ el: el, startNode: wire.startNode, endNode: wire.endNode });
            }}
            id={wire.id}
            key={wire.id}
            hidden={false} x1={x1} y1={y1} x2={x2} y2={y2}
            selected={wire.selected}
            click={wireClick} />
    });


    return (
        <div className="editor" >
            <svg ref={svgElement} width="1000px" height="1000px"
                shapeRendering="geometricPrecision"
                onDrop={drop}
                onDragOver={onDragOver}
                onMouseDown={handleMouseDown}>
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