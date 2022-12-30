/**
 * Node registry.
 * 
 * Makes it straightforward to get information about nodes available from the server
 * Call init first asynchronously to load nodes, then call getNodes, or getNodeByType
 * 
 */

var nodes = [];
var nodeMap = {};

export const init = async () => {
    const res = await fetch('http://localhost:4000/nodes')
    const data = await res.json()
    nodes = data;
    nodes.map(node => nodeMap[node.type] = node);
}

export const getNodes = () => {
    return nodes;
}

export const getNodeByType= type => {
    return nodeMap[type]
}


