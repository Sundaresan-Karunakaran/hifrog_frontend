// Import mermaid.js
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs";

mermaid.initialize({ startOnLoad: false });

export function generateGraph(stateString, result) {
    const lines = stateString.split(/\r?\n/).filter(line => line.trim() !== "");
    const steps = [];
    const unwindingCounts = {}; 
    const resultBox = document.getElementById("verfResult");
    
    lines.forEach(line => {
        if (line.includes("INLINING")) {
            steps.push({ type: "Inlining", name: line.replace("*** INLINING function:", "").trim() });
        } else if (line.includes("Processing")) {
            steps.push({ type: "Processing", name: line.replace("Processing a deferred function:", "").trim() });
        } else if (line.includes("Unwinding loop")) {
            const match = line.match(/Unwinding loop (\S+\.\d+)/);
            if (match) {
                const functionName = match[1]; 

                if (!unwindingCounts[functionName]) {
                    unwindingCounts[functionName] = 0;
                    steps.push({ type: "Processing", name: functionName }); 
                }
                unwindingCounts[functionName] += 1; 
            }
        }
    });

    let mermaidGraph = "graph TD;\n  Start((\"Start\")) --> Step0\n\n";
    const nodeMap = {};

    steps.forEach((step, index) => {
        let id = `Step${index}`;
        let label = `${step.type}: ${step.name}`;
        let position = step.type === "Inlining" ? "LEFT" : "RIGHT";

        nodeMap[step.name] = id;

        mermaidGraph += `  subgraph ${position}[ ]\n    ${id}["${label}"]\n  end\n`;
        if (index > 0) {
            mermaidGraph += `  Step${index - 1} --> ${id}\n`;
        }
    });

    Object.entries(unwindingCounts).forEach(([func, count]) => {
        let id = nodeMap[func];
        if (id) {
            mermaidGraph += `  ${id} -->|Unwound ${count} times| ${id}\n`;
        }
    });

    mermaidGraph += `  Step${steps.length - 1} --> End(("End"))\n`;

    document.getElementById("verfResult").innerHTML = `<pre>${result}</pre>`;
    resultBox.className = result.includes("UNSAT") ? "success" : "failed";

    document.getElementById("graphDiv").innerHTML = `<pre class="mermaid">${mermaidGraph}</pre>`;
    mermaid.init(undefined, document.querySelectorAll(".mermaid"));
}
