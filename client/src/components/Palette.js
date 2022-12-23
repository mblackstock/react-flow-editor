import PaletteNode from './PaletteNode'


 

const Palette = ({nodes}) => {

    return (<div className="palette">
        {nodes && nodes.map((node, index) => (
            <PaletteNode
                key={node.id}
                name={node.name}
                />))}
        </div>)
}

export default Palette;