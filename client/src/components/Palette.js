import PaletteNode from './PaletteNode'

const Palette = ({nodes}) => {

    return (<div className="palette">
        {nodes && nodes.map((node, index) => (
            <PaletteNode
                key={node.id}
                type={node.type}
                inputs={node.inputs}
                outputs={node.outputs}
                />))}
        </div>)
}

export default Palette;