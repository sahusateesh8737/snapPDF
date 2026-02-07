const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const CONCURRENT_REQUESTS = 5;
const TOTAL_REQUESTS = 10;
const TARGET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/convert/word-to-pdf';
const FILE_PATH = path.join(__dirname, 'test_input.docx');

if (!fs.existsSync(FILE_PATH)) {
    console.error(`Test file not found at ${FILE_PATH}`);
    process.exit(1);
}

console.log(`Starting stress test against ${TARGET_URL}`);
console.log(`Concurrency: ${CONCURRENT_REQUESTS}`);
console.log(`Total Requests: ${TOTAL_REQUESTS}`);

let completed = 0;
let success = 0;
let failed = 0;
const startTime = Date.now();

async function sendRequest(id) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(FILE_PATH));

    const start = Date.now();
    try {
        const response = await axios.post(TARGET_URL, formData, {
            headers: {
                ...formData.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            responseType: 'arraybuffer' // We don't need to process the file, just receive it
        });

        if (response.status === 200) {
            const duration = Date.now() - start;
            console.log(`[Req ${id}] ✅ Success (${duration}ms)`);
            success++;
        }
    } catch (err) {
        const msg = err.response ? `${err.response.status} ${err.response.statusText}` : err.message;
        console.error(`[Req ${id}] ❌ Error: ${msg}`);
        failed++;
    } finally {
        completed++;
        checkDone();
        if (requestQueue.length > 0) {
            const nextId = requestQueue.shift();
            sendRequest(nextId);
        }
    }
}

function checkDone() {
    if (completed >= TOTAL_REQUESTS) {
        const totalTime = Date.now() - startTime;
        console.log('\n--- Test Completed ---');
        console.log(`Total Time: ${(totalTime / 1000).toFixed(2)}s`);
        console.log(`Successful: ${success}`);
        console.log(`Failed: ${failed}`);
        console.log(`Avg Time per Req: ${(totalTime / TOTAL_REQUESTS).toFixed(0)}ms`);
        // Throughput = Success / Total Time in Seconds
        console.log(`Throughput: ${(success / (totalTime / 1000)).toFixed(2)} req/sec`);
    }
}

const requestQueue = Array.from({ length: TOTAL_REQUESTS }, (_, i) => i + 1);

const initialBatch = requestQueue.splice(0, CONCURRENT_REQUESTS);
initialBatch.forEach(id => sendRequest(id));
