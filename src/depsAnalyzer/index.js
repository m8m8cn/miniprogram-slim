const fs = require('fs-extra')
const ora = require('ora')
const program = require('commander')
const path = require('path')
const inspect = require('util').inspect
const {createLog} = require('./util')
const {analyzeComponent} = require('./analyzerComp')
const {findUnusedFiles} = require('./unused')
const log = createLog('@index')


/**
 * 1. 忽略引用插件中的组件
 * 2. 编译后的小程序根目录进行查询
 */
const genAppDepsGraph = (app) => {
  // log.setLevel('warn')

  // const appJsonPath = path.join(process.cwd(), app)
  const appJsonPath = 'app.json'
  const miniprogramRoot = path.dirname(appJsonPath)

  if (!fs.existsSync(appJsonPath)) {
    console.warn('Error: App.json is not exist')
    return
  }

  const appDeps = {
    app: {},
    pages: {},
    subpackages: {}
  }

  appDeps.app = analyzeComponent(appJsonPath)
  const appJson = fs.readJSONSync(appJsonPath)
  const subpackages = appJson.subpackages || appJson.subPackages || []
  subpackages.forEach(subpackage => {
    const {root, pages} = subpackage
    pages.forEach(page => {
      const entry = path.join(miniprogramRoot, root, page)
      const relativePath = path.join(root, page)
      appDeps.subpackages[relativePath] = analyzeComponent(entry)
    })
  })

  const entrys = appJson.pages
  entrys.forEach(entry => {
    appDeps.pages[entry] = analyzeComponent(entry)
  })
  
  const unused = findUnusedFiles(miniprogramRoot, appDeps)
  console.log(unused)
  // console.log('****** deps analyzer ******')
  // console.log(inspect(appDeps, {showHidden: false, depth: null}))
}

program
  .command('analyzer')
  .description('Analyze dependencies of source code')
  .action(genAppDepsGraph)