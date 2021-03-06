// 应急管理
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;
const projectName = "oh-asm";
const projectBuildPathName = "oh";
module.exports = {
  runtimeCompiler: true,
  publicPath:
    process.env.NODE_ENV === "production"
      ? `/${projectName}/${projectBuildPathName}/`
      : "/", // 基本路径
  outputDir: `${projectBuildPathName}`, // 输出文件目录
  configureWebpack: config => {
    config["externals"] = {
      tMap: "T"
    };
    if (process.env.NODE_ENV === "production") {
      // 为生产环境修改配置...
      config.mode = "production";
      // 将每个依赖包打包成单独的js文件
      let optimization = {
        runtimeChunk: "single",
        splitChunks: {
          chunks: "all",
          maxInitialRequests: Infinity,
          minSize: 20000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )[1];
                return `npm.${packageName.replace("@", "")}`;
              }
            }
          }
        }
      };
      Object.assign(config, {
        optimization
      });
    } else {
      // 为开发环境修改配置...
      config.mode = "development";
    }
    const plugins = [];

    // Begin 生成 gzip 压缩文件
    plugins.push(
      new CompressionWebpackPlugin({
        filename: "[path].gz[query]",
        algorithm: "gzip",
        test: productionGzipExtensions,
        threshold: 10240,
        minRatio: 0.8
      })
    );
    // End 生成 gzip 压缩文件

    config.plugins = [...config.plugins, ...plugins];
  },
  productionSourceMap: false, // 生产环境是否生成 sourceMap 文件
  // css相关配置
  css: {
    extract: true, // 是否使用css分离插件 ExtractTextPlugin
    sourceMap: false, // 开启 CSS source maps?
    loaderOptions: {
      css: {}, // 这里的选项会传递给 css-loader
      postcss: {} // 这里的选项会传递给 postcss-loader
    }, // css预设器配置项
    modules: false // 启用 CSS modules for all css / pre-processor files.
  },
  parallel: require("os").cpus().length > 1, // 是否为 Babel 或 TypeScript 使用 thread-loader。该选项在系统的 CPU 有多于一个内核时自动启用，仅作用于生产构建。
  pwa: {}, // PWA 插件相关配置 see https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa
  // webpack-dev-server 相关配置
  devServer: {
    open: process.platform === "darwin",
    host: "0.0.0.0", // 允许外部ip访问
    port: 6001, // 端口
    https: false, // 启用https
    overlay: {
      warnings: false,
      errors: false
    }, // 错误、警告在页面弹出
    proxy: {
      "/api": {
        target: `http://10.11.16.20:8096/${projectName}`,
        changeOrigin: true, // 允许websockets跨域
        // ws: true,
        pathRewrite: {
          "^/admin": ""
        }
      }
    } // 代理转发配置，用于调试环境
  },
  // 第三方插件配置
  pluginOptions: {},
  // echarts Babel 转译范围配置
  transpileDependencies: ["vue-echarts", "resize-detector"]
};
