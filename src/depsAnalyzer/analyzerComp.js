const {genWxmlDepsGraph, genWxsDepsMap} = require('./wxml')
const {genEsModuleDepsGraph, genWxsModuleDepsGraph} = require('./esmodule')
const {genCompDepsGraph, genCompDepsMap} = require('./component')
const {genWxssDepsGraph} = require('./wxss')

// 分析组件的依赖情况，页面也可视为一个组件
const analyzeComponent = (entry) => {
  const esmoduleDepsGraph = genEsModuleDepsGraph(entry)
  const wxmlDepsGraph = genWxmlDepsGraph(entry)
  const wxssDepsGraph = genWxssDepsGraph(entry)
  const compDepsGraph = genCompDepsGraph(entry)
  const wxsMap = genWxsDepsMap(wxmlDepsGraph)
  const wxsDeps = []
  Object.values(wxsMap).forEach(wxsEntry => {
    const wxsDepsGraph = genWxsModuleDepsGraph(wxsEntry)
    const perWxsDeps = Object.keys(wxsDepsGraph.map)
    wxsDeps.push(...perWxsDeps)
  })
  return {
    esDeps: Object.keys(esmoduleDepsGraph.map),
    wxmlDeps: Object.keys(wxmlDepsGraph),
    wxssDeps: Object.keys(wxssDepsGraph),
    compDeps: genCompDepsMap(compDepsGraph),
    wxsDeps
  }
}

module.exports = {
  analyzeComponent
}