const { exec } = require('child_process');
const process = require('process');

function checkAgyInstallation() {
  return new Promise((resolve) => {
    const cmd = process.platform === 'win32' ? 'agy --help' : 'zsh -c "agy --help"';
    exec(cmd, (error) => {
      resolve(!error);
    });
  });
}

function analyzeImage(imagePaths) {
  return new Promise((resolve, reject) => {
    // If it's a single string, wrap it in an array
    const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
    const pathsStr = paths.join(', ');

    const prompt = `Please act as an expert DSA and LLD companion. Analyze the problem statement shown spanning across the screenshots at ${pathsStr}. 
Provide a complete conceptual explanation of the solution using an easy-to-understand real-world analogy. DO NOT just provide minor hints.
If the problem is related to Low-Level Design (LLD), you MUST include a Mermaid UML class diagram inside a \\\`\\\`\\\`mermaid code block to visualize the system architecture.
Format your response clearly using Markdown.`;
    
    // Cross-platform command execution
    const cmd = process.platform === 'win32' 
      ? `cmd.exe /c "agy --dangerously-skip-permissions -p \\"${prompt}\\""`
      : `zsh -c "agy --dangerously-skip-permissions -p '${prompt}'"`;
    
    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error('Error running agy:', error, stderr);
        return reject(new Error('Failed to analyze the screen with the AI assistant.\\n\\n' + stderr));
      }
      
      resolve(stdout.trim());
    });
  });
}

module.exports = {
  analyzeImage,
  checkAgyInstallation
};
