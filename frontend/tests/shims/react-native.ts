// Minimal Node-only stand-in so the SQLite flow test does not parse React Native's Flow source.
export const Platform = { OS: 'test', select: <T>(values: { default?: T }) => values.default };
