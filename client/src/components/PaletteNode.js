import { useState, useRef } from 'react';

const PaletteNode = ({ id, type }) => {

    const dragStart = (e, id) => {
        // send type of node to editor drop
        e.dataTransfer.setData("text/plain", type)
    };

    return (<div className="palette-node"
        onDragStart={(e) => dragStart(e, id)}
        draggable="true">
        {type}
    </div>)
}

export default PaletteNode;