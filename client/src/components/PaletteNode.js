import { useState, useRef } from 'react';

const PaletteNode = ({ id, name }) => {
    const dragItem = useRef();

    const dragStart = (e, id) => {
        dragItem.current = id;
        console.log(e.target.innerHTML);
    };

    return (<div className="palette-node"
        onDragStart={(e) => dragStart(e, id)}
        draggable="true">
        {name}
    </div>)
}

export default PaletteNode;