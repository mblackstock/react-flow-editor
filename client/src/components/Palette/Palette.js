import Node from './Node'
import "./Palette.css";

const Palette = ({ nodes }) => {

  return (<div className="palette">
    {nodes && nodes.map((node, index) => (
      <Node
        key={node.id}
        type={node.type}
        inputs={node.inputs}
        outputs={node.outputs}
      />))}
  </div>)
}

export default Palette;