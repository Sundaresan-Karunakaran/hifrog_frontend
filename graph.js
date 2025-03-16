// graph.js

// Import mermaid.js from CDN
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs";

// Initialize mermaid
mermaid.initialize({ startOnLoad: false });

// Export the function to generate the graph
export function generateGraph(stateString) {
    let states = stateString.split('\n');
    let graphDefinition = `
    graph TD
    A[Start] --> B[__CPROVER_initialize]
    `;
    let prevStateID = 'B';
    let prevState = '__CPROVER_initialize';
    for (let i = 0; i < states.length; i++) {
        if(states[i].includes('INLINING function') && !states[i].includes('__CPROVER_initialize')){
            let state = states[i].split('INLINING function')[1].split(' ')[1];
            if(state == prevState){
                graphDefinition += `${prevStateID} --> ${prevStateID}[${state}]\n`;
                continue
            }
            let nextStateID = String.fromCharCode(prevStateID.charCodeAt() + 1)
            console.log(nextStateID)
            graphDefinition += `${prevStateID} --> ${nextStateID}[${state}]\n`;
            prevStateID = nextStateID;
            prevState = state;
        }
    }
    // const graphDefinition = `
    // graph TD
    //     A[Start] --> B[End]
    //     B --> C[Process]
    // `;
    
    // Assuming you have a div with id "graphDiv" where the graph will be rendered
    document.getElementById("graphDiv").innerHTML = `<pre class="mermaid">${graphDefinition}</pre>`;
    
    // Render the graph using mermaid
    mermaid.init(undefined, document.querySelectorAll(".mermaid"));
}
