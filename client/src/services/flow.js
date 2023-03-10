/**
 * Flow service
 * 
 * Use this service to retrieve and update flows from the server.
 * A single flow runs as one data flopw, even though it is in separate tabs.
 */

export const init = async () => {

}

export const getFlowById = async id => {
  const res = await fetch(`http://localhost:4000/flows/${id}`)
  let flow = await res.json();
  return flow;
}

export const updateFlow = async flow => {
  if (!flow.id) {
    throw new Error('id required');
  }
  // do the update
}

export const createFlow = async flow => {
  // write flow to server
  // return id generated by server if needed
}

export const getFlowIds = async () => {
  // return list of flows available for the current user/account
  const res = await fetch('http://localhost:4000/flows')
  const flows = await res.json()
  return flows.map(flow => flow.id);
}