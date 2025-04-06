const { spawn } = require('child_process');
const { platform } = require('os');

console.log('Starting Bhookmukt website...');
console.log('This will start the server and open your website in the default browser.');

const port = 5000;
const serverProcess = spawn('node', ['server.js']);

serverProcess.stdout.on('data', (data) => {
    console.log(data.toString());
    if (data.toString().includes(`Server is running on port ${port}`)) {
        console.log(`Opening website in browser at port ${port}...`);
        const url = `http://localhost:${port}`;
        
        // Open URL based on platform
        switch (platform()) {
            case 'win32':
                spawn('cmd', ['/c', 'start', url]);
                break;
            case 'darwin':
                spawn('open', [url]);
                break;
            default:
                spawn('xdg-open', [url]);
        }
    }
});

serverProcess.stderr.on('data', (data) => {
    console.error('Server error:', data.toString());
});

serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
});

process.on('SIGINT', () => {
    serverProcess.kill();
    process.exit();
}); 