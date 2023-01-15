import {useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react";


const Wire = forwardRef(({hidden, x1, y1, x2, y2}, ref) => {
    
    const pathRef = useRef(null);

    useImperativeHandle(ref, () => {
        return {
            // dynamically move without render cycle
            moveStart: (x,y) => {
                pathRef.current.setAttribute("d",
                    `M ${x} ${y} C ${x+50} ${y}, ${x2-50} ${y2}, ${x2}, ${y2}`);
            },
            moveEnd: (x,y) => {
                pathRef.current.setAttribute("d",
                    `M ${x1} ${y1} C ${x1+50} ${y1}, ${x-50} ${y}, ${x}, ${y}`);
                }
        };
      },[]);

    return (
        <path ref={pathRef}
            className={`wire ${hidden ? 'hidden':'' }`}
            d={`M ${x1} ${y1} C ${x1+50} ${y1}, ${x2-50} ${y2}, ${x2}, ${y2}`}/>
        )
});

export default Wire;