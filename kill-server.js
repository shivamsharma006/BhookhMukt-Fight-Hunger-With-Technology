const { exec } = require('child_process');
const os = require('os');

console.log('Killing any existing server processes on port 5000...');

// Function to kill processes on a specific port
function killProcessOnPort(port) {
  return new Promise((resolve, reject) => {
    const platform = os.platform();
    let command;

    if (platform === 'win32') {
      // Windows command to find and kill process on port
      command = `netstat -ano | findstr :${port}`;
    } else {
      // Unix/Linux/Mac command to find and kill process on port
      command = `lsof -i :${port} -t`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`No process found on port ${port}`);
        resolve();
        return;
      }

      if (platform === 'win32') {
        // Parse Windows output to get PID
        const lines = stdout.split('\n');
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length > 4) {
            const pid = parts[4];
            console.log(`Killing process with PID: ${pid}`);
            
            // Kill the process
            exec(`taskkill /F /PID ${pid}`, (killError) => {
              if (killError) {
                console.error(`Error killing process: ${killError.message}`);
              } else {
                console.log(`Process killed: SUCCESS: The process with PID ${pid} has been terminated.`);
              }
            });
          }
        });
      } else {
        // Parse Unix output to get PID
        const pids = stdout.split('\n').filter(pid => pid);
        pids.forEach(pid => {
          console.log(`Killing process with PID: ${pid}`);
          
          // Kill the process
          exec(`kill -9 ${pid}`, (killError) => {
            if (killError) {
              console.error(`Error killing process: ${killError.message}`);
            } else {
              console.log(`Process killed: Process with PID ${pid} has been terminated.`);
            }
          });
        });
      }
      
      resolve();
    });
  });
}

// Kill processes on port 5000
killProcessOnPort(5000)
  .then(() => {
    console.log('Server cleanup completed.');
  })
  .catch(err => {
    console.error('Error during server cleanup:', err);
  }); 