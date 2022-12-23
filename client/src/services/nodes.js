
export const fetchNodes = async () => {
    const res = await fetch('http://localhost:4000/nodes')
    const data = await res.json()
    return data
}
