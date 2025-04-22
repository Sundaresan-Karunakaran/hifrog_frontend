import {generateGraph} from './graph.js';


let fileName, logic, claim, unwind;


async function downloadOutput() {
    const graphElement = document.getElementById("graphDiv");
    const outputElement = document.getElementById("output");

    if (!graphElement || !outputElement) {
        console.error("Error: Output area not found!");
        return;
    }

    try {
        const canvas = await html2canvas(graphElement, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("p", "mm", "a4");

        pdf.addImage(imgData, "PNG", 10, 10, 190, 0);

        const outputText = outputElement.innerText || outputElement.textContent;
        pdf.addPage(); 

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);

        const marginLeft = 10;
        const marginTop = 40; 
        const maxWidth = 190;
        const lineHeight = 7;

        const splitText = pdf.splitTextToSize(outputText, maxWidth);

        let yOffset = marginTop;
        for (let i = 0; i < splitText.length; i++) {
            if (yOffset + lineHeight > 297 - 10) { 
                pdf.addPage();
                yOffset = 10; 
            }
            pdf.text(splitText[i], marginLeft, yOffset);
            yOffset += lineHeight;
        }

        pdf.save("hifrog_output.pdf");

    } catch (error) {
        console.error("Error exporting PDF:", error);
    }
}

function sayHelloDocker(){
    const apiURL = 'http://localhost:3000/';
    fetch(apiURL)
    .then(response => {
        if(!response.ok){
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        document.getElementById('output').innerHTML = `<pre>${data}</pre>`;
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}

function runHifrog() {
    const apiURL = 'http://localhost:3000/runHifrog?fileName='+fileName+'&logic='+logic+'&claim='+claim+'&unwind='+unwind;
    if(!logic || !claim || !unwind || !fileName) {
        document.getElementById('output').innerHTML = `<pre>Missing parameters. Please enter all the values</pre>`;
        return
    }
    document.getElementById('output').innerHTML = `Running command ./hifrog ${fileName} -logic ${logic} -claim ${claim} -unwind ${unwind}`;

    fetch(apiURL)
    .then(response => {
        if(!response.ok){
            if(response.status == 404) {
                console.log('File not found')
                return `<pre>File not found</pre>`;
            }
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        let { stateString, result } = getStateAndResult(data);
        generateGraph(stateString, result);
        
        document.getElementById('output').innerHTML = `<pre>${data}</pre>`;

    })
    .catch(error => {     
        console.error('There has been a problem with your fetch operation:', error);
    });
}

function changeParams(value,from) {
    if(from == 'logic') {
        logic = value.value;
    } else if(from == 'claim') {
        claim = value.value;
    } else if(from == 'unwind') {
        unwind = value.value;
    } else if(from == 'fileName') {
        fileName = value.value;
    }

    console.log('logic:', logic, 'claim:', claim, 'unwind:', unwind, 'fileName:', fileName);
}


function deleteSummary(){
    const apiURL = 'http://localhost:3000/deleteSummary';
    fetch(apiURL)
    .then(response => {
        if(!response.ok){
            if(response.status == 404) {
                console.log('Summary file not found')
                return `<pre>Summary (__summaries) file not found</pre>`;
            }
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        document.getElementById('output').innerHTML = `<pre>${data}</pre>`;
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}

function viewSummary(){
    const apiURL = 'http://localhost:3000/viewSummary';
    fetch(apiURL)
    .then(response => {
        if(!response.ok){
            if(response.status == 404) {
                console.log('Summary file not found')
                return `<pre>Summary (__summaries) file not found</pre>`;
            }
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        document.getElementById('output').innerHTML = `<pre>${data}</pre>`;
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}

function getStateAndResult(hifrogOutput) {
    const startMarker = "*** INLINING function: __CPROVER_initialize";
    const endMarker = "SYMEX TIME";

    const startIdx = hifrogOutput.indexOf(startMarker);
    const endIdx = hifrogOutput.indexOf(endMarker);

    let stateString = "Error: Specified markers not found in the output.";
    if (startIdx !== -1 && endIdx !== -1) {
        stateString = hifrogOutput.substring(startIdx, endIdx).trim();
    }

    const result = getVerificationResult(hifrogOutput);

    return { stateString, result };
}


function getVerificationResult(hifrogOutput) {
    const unsatPattern = /RESULT:\s*UNSAT/;
    const satPattern = /RESULT:\s*SAT/;

    if (unsatPattern.test(hifrogOutput)) {
        console.log('UNSAT');
        return "UNSAT - it holds"; // Success
    } else if (satPattern.test(hifrogOutput)) {
        console.log('SAT');
        return "SAT - doesn't hold"; // Failed
    } else {
        return "Error: No verification result found.";
    }
}


async function loadCFiles() {
    const select = document.getElementById("fileSelect");
    try {
      const res = await fetch("http://localhost:3000/getFiles");
      const files = await res.json();

      files.forEach(file => {
        console.log(file);
        const option = document.createElement("option");
        option.value = file;
        option.textContent = file;
        select.appendChild(option);
      });
    } catch (err) {
      console.error("Error loading C files:", err);
    }
}


// Add at the end of main.js
window.runHifrog = runHifrog;
window.changeParams = changeParams;
window.deleteSummary = deleteSummary;
window.viewSummary = viewSummary;
window.sayHelloDocker = sayHelloDocker;
window.downloadOutput = downloadOutput;
window.addEventListener("DOMContentLoaded", loadCFiles);