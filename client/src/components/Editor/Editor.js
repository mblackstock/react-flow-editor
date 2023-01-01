import Node from "./Node";
import Wire from "./Wire"
import "./Editor.css";

import { useState, useEffect } from 'react';

const Editor = ({flow}) => {

    // nodes, wires, tabs in current flow
    const [nodes, setNodes] = useState([])
    // [wires, setWires] = useState([])
    // [tabs, setTabs] = useState([])

    useEffect(() => {
        if (flow?.nodes) {
            setNodes(flow.nodes)
        }
    }, [flow])

    // generate a unique node id
    const generateId = () => (Math.floor(1 + Math.random() * 4294967295)).toString(16);

    const drop = (e) => {
        e.preventDefault();
        // note e.target.getBoundingClientRect() gets child element bounding box, not the div!
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

    return (
        <div className="editor" >
            <svg width="1000px" height="1000px"
                shapeRendering="geometricPrecision"
                onDrop={drop}
                onDragOver={onDragOver}>
                <g className="all-nodes" >
                    {nodes.map((node) => (<Node
                        key={node.id}
                        id={node.id}
                        x={node.x}
                        y={node.y}
                        type={node.type}/>))}
                </g>
                <g className="all-wires" >
                </g>
                <Wire hidden={true} x1={200} y1={200} x2={300} y2={350}/>
            </svg>
        </div>)
}

export default Editor;