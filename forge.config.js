const { makerSquirrel } = require("@electron-forge/maker-squirrel");
const { makerZIP } = require("@electron-forge/maker-zip");
const { makerDeb } = require("@electron-forge/maker-deb");
const { makerRpm } = require("@electron-forge/maker-rpm");
const { autoUnpackNodes } = require("@electron-forge/plugin-auto-unpack-nodes");

module.exports = {
	packagerConfig: {
		asar: true,
		extraResource: ["dist-frontend"],
		icon: 'public/favicon.ico'
	},
	makers: [
		makerSquirrel({}),
		makerZIP({}, ["darwin"]),
		makerDeb({}),
		makerRpm({}),
	],
	plugins: [autoUnpackNodes],
	hooks: {
		packageAfterPrune: async (
			forgeConfig,
			buildPath,
			electronVersion,
			platform,
			arch
		) => {
			return new Promise((resolve, reject) => {
				const fs = require("fs");
				const path = require("path");

				// Copy dist-frontend to the correct location
				const source = path.join(__dirname, "dist-frontend");
				const target = path.join(buildPath, "dist-frontend");

				fs.cp(source, target, { recursive: true }, (err) => {
					if (err) reject(err);
					console.log("Copied dist-frontend to build directory");
					resolve();
				});
			});
		},
	},
};
