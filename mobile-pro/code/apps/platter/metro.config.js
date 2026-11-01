// Expo's default config already understands npm workspaces (it watches the
// repository root and resolves @pro/ui and @pro/api from packages/).
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
