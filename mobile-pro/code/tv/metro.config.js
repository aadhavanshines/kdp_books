// Reelhouse TV is a standalone project (outside the npm workspace), so Metro
// only watches this folder and resolves from tv/node_modules.
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
