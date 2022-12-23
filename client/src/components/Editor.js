import EditorNode from "./EditorNode";
import { useState } from 'react';

const Editor = () => {

    // nodes in the current flow
    const [nodes, setNodes] = useState([])

    const drop = (e) => {
        // note e.target.getBoundingClientRect() gets child element bounding box, not the div!
        var rect = e.currentTarget.getBoundingClientRect();
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.
        const newNode = {
            id: Math.floor(Math.random() * 100000), //TODO
            name: 'hello',
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
            <svg width="1000px" height="1000px" onDrop={drop} onDragOver={onDragOver}>
                {nodes.map((node) => (<EditorNode key={node.id} x={node.x} y={node.y} name={node.name}/>))}
            </svg>
        </div>)
}

export default Editor;