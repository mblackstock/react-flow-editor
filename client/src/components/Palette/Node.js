import { useDrag } from 'react-dnd'

const Node = ({ id, type, outputs, inputs }) => {

  const [, drag] = useDrag(() => ({
		// "type" is required. It is used by the "accept" specification of drop targets.
    type: 'PaletteNode',
    item: {type},
		// The collect function utilizes a "monitor" instance (see the Overview for what this is)
		// to pull important pieces of state from the DnD system.
    collect: (monitor) => {

    }
  }));

  return (
    <div className="palette-node" ref={drag}>
      <div className="palette-node-label">{type}</div>
      {inputs > 0 && <div className="palette-port" />}
      {outputs > 0 && <div className="palette-port palette-port-output" />}
    </div>
  )
}

export default Node;