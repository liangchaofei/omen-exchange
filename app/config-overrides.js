/*
 * @Author: your name
 * @Date: 2021-09-16 13:45:29
 * @LastEditTime: 2021-09-16 15:02:09
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /app/config-overrides.js
 */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const RemovePlugin = require('remove-files-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const WorkboxWebpackPlugin = require('workbox-webpack-plugin')

// Used to make the build reproducible between different machines (IPFS-related)
module.exports = (config, env) => {
  if (env !== 'production') {
    return config
  }
  const gitRevisionPlugin = new GitRevisionPlugin()
  const shortCommitHash = gitRevisionPlugin.commithash().substring(0, 8)
  config.output.filename = `static/js/[name].${shortCommitHash}.js`
  config.output.chunkFilename = `static/js/[name].${shortCommitHash}.chunk.js`
  config.plugins = config.plugins.filter(
    plugin =>
      !(
        plugin instanceof WorkboxWebpackPlugin.GenerateSW ||
        plugin instanceof ManifestPlugin ||
        plugin instanceof MiniCssExtractPlugin
      ),
  )
  config.plugins.push(
    new MiniCssExtractPlugin({
      filename: `static/css/[name].${shortCommitHash}.css`,
      chunkFilename: 'static/css/[name].chunk.css',
    }),
  )
  config.plugins.push(
    new RemovePlugin({
      before: {
        include: [
          './node_modules/ethers/dist/ethers.min.js',
          './node_modules/react-datepicker/dist/react-datepicker.min.js',
        ],
      },
    }),
  )

  config?.module?.rules[2]?.oneOf?.find(rule => rule.loader === require.resolve('file-loader')).options.name =
    'static/media/[name].[ext]'
  config?.module?.rules[2]?.oneOf?.find(rule => rule.loader === require.resolve('url-loader')).options.name =
    'static/media/[name].[ext]'
  config.optimization.moduleIds = 'hashed'
  return config
}
