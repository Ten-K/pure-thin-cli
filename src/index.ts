import { cac } from 'cac'
import pc from 'picocolors'
import figlet from 'figlet'
import { create } from './template'
import { templates } from './constants'
import { TTemplateName } from './types'
import { isExistsFile } from './create-dir'
import { hasTemplate, clg } from './utils'
import { inputProjectName } from './prompt'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const version: string = require('../package.json').version

const cli = cac('pure')
cli.version(version)

cli
  .command('create', '创建一个新项目') // 增加创建指令
  .option('-f, --force', '如果目标文件存在，则强制覆盖') // 强制覆盖
  .action(async (cmd) => {
    const projectName = await inputProjectName()
    const isExists = await isExistsFile(projectName, cmd)
    if (isExists) return
    create(projectName)
  })

cli
  .command('init <template-name> <project-name>', '创建一个新项目') // 增加创建指令
  .option('-f, --force', '如果目标文件存在，则强制覆盖') // 强制覆盖
  .action(async (templateName, projectName, cmd) => {
    if (!hasTemplate(templateName)) return
    const isExists = await isExistsFile(projectName, cmd)
    if (isExists) return
    create(projectName, templateName)
  })

cli.help(() => {
  clg(
    '\r\n' +
      figlet.textSync('pure', {
        font: '3D-ASCII',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true
      })
  )
  clg(`运行 ${pc.cyan('pure <command> --help')} 查看有关命令的详细用法. \r\n`)
})

cli.command('list', '查看所有模板类型').action(() => {
  Object.keys(templates).forEach((key: string) => {
    clg(`${key} ${templates[key as TTemplateName].description}`)
  })
})

cli.parse()
