const { spawn } = require("child_process");
const log = require("./logger/log.js");

const PORT = process.env.PORT || 3000; // Set default port to 3000 if not provided

function startProject() {
	const child = spawn("node", ["Goat.js"], {
		cwd: __dirname,
		stdio: "inherit",
		shell: true,
		env: { ...process.env, PORT } // Pass PORT as an environment variable
	});

	child.on("close", (code) => {
		if (code == 2) {
			log.info("Restarting Project...");
			startProject();
		}
	});
}

log.info(`Starting Goat Bot on port ${PORT}...`);
startProject();
