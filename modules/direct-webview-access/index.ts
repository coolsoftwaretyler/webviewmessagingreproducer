// Reexport the native module. On web, it will be resolved to DirectWebviewAccessModule.web.ts
// and on native platforms to DirectWebviewAccessModule.ts
export { default } from './src/DirectWebviewAccessModule';
export { default as DirectWebviewAccessView } from './src/DirectWebviewAccessView';
export * from  './src/DirectWebviewAccess.types';
