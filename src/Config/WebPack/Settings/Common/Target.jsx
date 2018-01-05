export default function (contextPath, absOutputPath, compileTarget) {
  return {
    target: compileTarget || 'web'
  };
}
