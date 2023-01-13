import Node from "./Node";
import Wire from "./Wire"
import "./Editor.css";

import { useState, useEffect, useCallback, useRef } from 'react';

const Editor = ({ flow }) => {

    // nodes, wires, tabs in current flow
    const [nodes, setNodes] = useState([])
    const [dragWire, setDragWire] = useState({
        type: 'out',        // type of starting port
        startNode: '',          // start node id
        startPort:0,        // start port number
        endNode: '',
        endPort: 0,
    
        hidden: true,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0
    });

    const [wires, setWires] = useState([]);

    const svgElement = useRef(null);
    const nodeElements = useRef({});

    useEffect(() => {
        if (flow?.nodes) {
            setNodes(flow.nodes)
        }
    }, [flow])

    // generate a unique node id
    const generateId = () => (Math.floor(1 + Math.random() * 4294967295)).toString(16);

    const drop = (e) => {
        e.preventDefault();
        // note e.target.getBoundingClientRect() gets child element bounding box, not the svg!
        var rect = e.currentTarget.getBoundingClientRect();
        const nodeType = e.dataTransfer.getData("text");
        console.log(nodeType)
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.
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

    // dragging the wire

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

    const handleMouseUp = useCallback((e) => {
        // TODO: remove the drag wire and don't save since we didn't connect to 
        // anything
        // setDragWire({...dragWire, hidden: true});
        document.removeEventListener('mousemove', handleWireMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    });

    const wireStart = (e, id, x, y, type, port) => {
        console.log(`wire start ${e} ${id} ${type} ${port}`);
        setDragWire({ type, startNode: id, startPort: port, hidden: false, x1: x, y1: y, x2: x, y2: y });
        // TODO: save start wire
        document.addEventListener('mousemove', handleWireMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    const wireEnd = (e, id, type, port) => {
        console.log(`wire end ${e} ${id} ${type} ${port}`);
        setDragWire({...dragWire, hidden: false});
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

    // --end

    // TODO:

    /*
    generate a list of wires.
    need port locations, so probably best to move these to a helper service
    */

    const nodeList = nodes.map((node) => (<Node
        ref={(el) => nodeElements.current[node.id] = el}
        key={node.id}
        id={node.id}
        x={node.x}
        y={node.y}
        type={node.type}
        wireStart={wireStart}
        wireEnd={wireEnd}
    />));

    // const wireList = [];

    const wireList = wires.map((wire) => {
        // find the node element.  We assume the elements are up to date in the map
        // ask node for port position for start and end
        // create a wire.
        let el = nodeElements.current[wire.startNode];
        const [x1, y1] = el.getPortPosition('out', wire.startPort);
        el = nodeElements.current[wire.endNode];
        const [x2, y2] = el.getPortPosition('in', wire.endPort);
        
        return <Wire hidden={false} x1={x1} y1={y1} x2={x2} y2={y2} />
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