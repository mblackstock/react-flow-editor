const Wire = ({hidden, x1, y1, x2, y2}) => {
    
    return (
        <path className={`wire ${hidden ? 'hidden':'' }`} d={`M ${x1} ${y1} C ${x1+50} ${y1}, ${x2-50} ${y2}, ${x2}, ${y2}`}/>
        )
}

export default Wire;