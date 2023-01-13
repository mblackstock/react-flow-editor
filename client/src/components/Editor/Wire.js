import {useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react";


const Wire = forwardRef(({hidden, x1, y1, x2, y2}, ref) => {
    
    const pathRef = useRef(null);

    useImperativeHandle(ref, () => {
        return {
            // dynamically move without render cycle
            moveStart: (x,y) => {
                const newX1 = x1-x;
                const newY1 = y1-y;
                pathRef.current.setAttribute("d",
                    `M ${newX1} ${newY1} C ${newX1+50} ${newY1}, ${x2-50} ${y2}, ${x2}, ${y2}`);
            },
            moveEnd: (x,y) => {
                const newX2 = x2-x;
                const newY2 = y2-y;
                pathRef.current.setAttribute("d",
                    `M ${x1} ${y1} C ${x1+50} ${y1}, ${newX2-50} ${newY2}, ${newX2}, ${newY2}`);
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