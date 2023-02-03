import {useRef, forwardRef, useImperativeHandle } from "react";


const Wire = forwardRef(({id, hidden, x1, y1, x2, y2, selected, click}, ref) => {
    
    const pathRef = useRef(null);

    useImperativeHandle(ref, () => {
        return {
            // dynamically move without render cycle
            moveStart: (x,y) => {
                pathRef.current.setAttribute("d",
                    `M ${x1-x} ${y1-y} C ${x1-x+50} ${y1-y}, ${x2-50} ${y2}, ${x2}, ${y2}`);
            },
            moveEnd: (x,y) => {
                pathRef.current.setAttribute("d",
                    `M ${x1} ${y1} C ${x1+50} ${y1}, ${x2-x-50} ${y2-y}, ${x2-x}, ${y2-y}`);
                }
        };
      },[x1, x2, y1, y2]);

    const handleOnClick = (e) => {
        e.stopPropagation();
        click(e, id);
    }

    return (
        <path ref={pathRef}
            onClick={handleOnClick}
            className={`wire ${hidden ? 'hidden':'' } ${selected ? 'editor-selected' : ''}`}
            d={`M ${x1} ${y1} C ${x1+50} ${y1}, ${x2-50} ${y2}, ${x2}, ${y2}`}/>
        )
});

export default Wire;