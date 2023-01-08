import Node from "./Node";
import Wire from "./Wire"
import "./Editor.css";

import { useState, useEffect, useCallback, useRef } from 'react';

const Editor = ({ flow }) => {

    // nodes, wires, tabs in current flow
    const [nodes, setNodes] = useState([])
    const [dragWire, setDragWire] = useState({
        hidden: true,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0
    });
    // [wires, setWires] = useState([])
    // [tabs, setTabs] = useState([])

    const svgElement = useRef(null);

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
        const newNode = {
            id: generateId(),
            type: nodeType,
            x, y
        }
        // add element there
        setNodes([...nodes, newNode])
    };

    const onDragOver = (e) => {
        // needed for drag to work
        e.preventDefault();
    }

    // dragging the wire

    const handleWireMouseMove = useRef((e) => {
        e.preventDefault();
        const rect = svgElement.current.getBoundingClientRect();
        const x = e.clientX - rect.left; //x position within the element.
        const y = e.clientY - rect.top;  //y position within the element.
        setDragWire(dragWire => {
            return {hidden:false, x1:dragWire.x1, y1:dragWire.y1, x2: x, y2: y }
        });
    }, []);

    const wireStart = (e, id, x, y, type, port) => {
        console.log(`wire start ${e} ${id} ${type} ${port}`);
        setDragWire({ hidden: false, x1: x, y1: y, x2: x, y2: y });
        document.addEventListener('mousemove', handleWireMouseMove.current);
    }

    const wireEnd = (e, id, type, port) => {
        console.log(`wire end ${e} ${id} ${type} ${port}`);
        setDragWire({...dragWire, hidden: false});
        document.removeEventListener('mousemove', handleWireMouseMove.current);
        // TODO: save the wire
    }
    // --end

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
                <g className="all-nodes" >
                    {nodes.map((node) => (<Node
                        key={node.id}
                        id={node.id}
                        x={node.x}
                        y={node.y}
                        type={node.type}
                        wireStart={wireStart}
                        wireEnd={wireEnd}
                    />))}
                </g>
                <g className="all-wires" >
                </g>

            </svg>
        </div>)
}

export default Editor;