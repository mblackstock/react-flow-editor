const Node = ({ id, type, outputs, inputs }) => {

    const dragStart = (e, id) => {
        // send type of node to editor drop
        e.dataTransfer.setData("text/plain", type)
    };

    return (<div className="palette-node"
        onDragStart={(e) => dragStart(e, id)}
        draggable="true">
        <div className="palette-node-label">{type}</div>
        {inputs > 0 && <div className="palette-port"/>}
        {outputs > 0 && <div className="palette-port palette-port-output"/>}
    </div>)
}

export default Node;