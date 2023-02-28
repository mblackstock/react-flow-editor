import { useState, useEffect } from 'react'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'

import './App.css';

import Palette from './components/Palette/Palette';
import Editor from './components/Editor/Editor';
import Modal from "./components/Modal/Modal";

import * as registry from './services/registry'
import * as flowService from './services/flow'

function App() {

  const [nodes, setNodes] = useState([])
  const [flow, setFlow] = useState({})

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // wrap in async function so we can call await
    const initAll = async () => {

      await registry.init();
      setNodes(registry.getNodes());

      // for now we are a single user, always get the first flow
      await flowService.init();
      let flowIds = await flowService.getFlowIds()
      let flow = {};
      if (flowIds.length > 0) {
        flow = await flowService.getFlowById(flowIds[0]);
      }
      setFlow(flow)
    }
    initAll().catch(console.error);

  }, [])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <div className="sidebar">
          <div className="panel">
            <div className="panel-header">Palette</div>
            <div className="panel-body">
              <Palette nodes={nodes} />
            </div>
          </div>
        </div>
        <div className="main">
          <div className="panel">
            <div className="panel-header">Editor</div>
            <div className="panel-body">
              <Editor flow={flow} />
            </div>
          </div>
        </div>
        <div className="footer">
          <div className="footer-file-info">
            <span className="file-info-source">src/styles.less</span>
            <span className="file-info-location">2:5</span>
          </div>
          <div className="footer-controls">
            <a href="/">LF</a>
            <a href="/">UTF-8</a>
            <a href="/">Less</a>
            <a href="/"><span className="icon-git-branch"></span>master</a>
            <a href="/">⬇︎ 5 ⬆︎</a>
            <button onClick={() => setShowModal(true)}>Test Modal</button>
            <a href="/"><span className="icon-diff"></span>1 file</a>
            <a href="/"><span className="icon-squirrel"></span></a>
          </div>
        </div>
        <Modal title="My Modal" onClose={() => setShowModal(false)} show={showModal}>
          <p>This is modal body</p>
        </Modal>
      </div>
    </DndProvider>
  );
}

export default App;
