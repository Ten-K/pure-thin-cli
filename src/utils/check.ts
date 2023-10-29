import boxen from 'boxen'
import pc from 'picocolors'
import semver from 'semver'
import ora, { Ora } from 'ora'
import { log, clg } from '../utils'
import { name, REGISTER } from '../constants'
import axios, { AxiosResponse } from 'axios'

const spinner: Ora = ora()

/**
 * 获取npm或taobao镜像对应的api
 * @param registerOrigin npm包信息来源
 * @returns
 */
export const getDefaultRegister = (registerOrigin: 'npm' | 'taobao' = 'taobao') => {
  return REGISTER[registerOrigin]
}

/**
 * 获取npm包信息
 * @param npmName 当前npm包名
 * @param register npm提供的api地址
 * @returns
 */
export const getNpmInfo = async (npmName: string, register = getDefaultRegister()) => {
  const npmUrl = register + npmName
  let res
  try {
    res = await axios.get(npmUrl)
  } catch (err) {
    log.err(err as string)
  }
  return res
}

/**
 * 获取npm包最新版本号
 * @param npmName 当前npm包名
 * @param register npm提供的api地址
 * @returns
 */
export const getNpmLatestVersion = async (npmName: string, register = getDefaultRegister()) => {
  const { data } = (await getNpmInfo(npmName, register)) as AxiosResponse
  return data['dist-tags'].latest
}

/**
 * 判断当前npm包版本是否需要更新
 * @param currentVersion 当前版本号
 * @param npmName 当前npm包名
 */
export const checkNpmVersion = async (currentVersion: string, npmName: string) => {
  const pkgName = pc.cyan(name)
  try {
    spinner.start(`正在检查 ${pkgName} 是否需要更新中...`)
    const latestVersion = await getNpmLatestVersion(npmName)
    if (semver.lt(latestVersion, currentVersion) || latestVersion === currentVersion) {
      spinner.succeed(`${pkgName} ${pc.gray('已是最新版本，无需更新')}`)
    }
    const dim = pc.dim
    const magenta = pc.magenta
    clg(
      boxen(
        `  😀 ${pc.yellow('哇~有更新!')} ${pc.red(currentVersion)} → ${pc.green(latestVersion)}.
  💯 ${
    magenta('更新日志: ') +
    dim(`https://github.com/Ten-K/${npmName}/releases/tag/v${latestVersion}`)
  }
  👻 ${dim('运行') + magenta(` npm i -g ${npmName} `) + dim('可以更新哦.')}

  💕 ${
    dim('关注') +
    magenta(' pure-thin-cli ') +
    dim(`了解最新动态: https://github.com/Ten-K/${npmName}`)
  }`,
        { padding: 1, margin: 1, borderColor: 'cyan', borderStyle: 'round' }
      )
    )
  } catch (error) {
    spinner.fail(
      `${pc.red(`检查`)} ${pkgName} ${pc.red(`更新失败, 但是不会影响下载项目的正常使用`)}`
    )
  }
}
