/**
 * Modal Dialog component
 * 
 * @link: https://medium.com/tinyso/how-to-create-a-modal-component-in-react-from-basic-to-advanced-a3357a2a716a
 */

import React, { useEffect } from "react";
import "./Modal.css";

const Modal = ({title, show, onClose, children}) => {

    useEffect(() => {
        const closeOnEscapeKeyDown = e => {
            if ((e.charCode || e.keyCode) === 27) {
                onClose();
            }
        };

        document.body.addEventListener("keydown", closeOnEscapeKeyDown);
        return function cleanup() {
            document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
        };
    });

    return (
        <div className={`modal ${show ? 'show':''}`} onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h4 className="modal-title">{title}</h4>
                </div>
                <div className="modal-body">{children}</div>
                <div className="modal-footer">
                    <button onClick={onClose} className="button">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
