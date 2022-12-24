import EditorNode from "./EditorNode";
import { useState } from 'react';

const Editor = () => {

    // nodes in the current flow
    const [nodes, setNodes] = useState([])

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
            name: nodeType,
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
                    {nodes.map((node) => (<EditorNode key={node.id} x={node.x} y={node.y} name={node.name}/>))}
                </g>
            </svg>
        </div>)
}

export default Editor;