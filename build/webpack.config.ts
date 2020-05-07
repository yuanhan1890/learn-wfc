// eslint-disable-next-line import/default
import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
// eslint-disable-next-line import/default
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { Configuration } from "webpack";

const ROOT = path.resolve(__dirname, "..");
const PATH_SOURCE = path.resolve(ROOT, "./src");
const PATH_APP = path.resolve(ROOT, "./src/index.ts");
const PATH_OUT = path.resolve(ROOT, "./dist");
const PATH_TEMPLATE = path.resolve(ROOT, "./src/index.html");
const PATH_PUBLIC = path.resolve(ROOT, "./public");

const isProd = process.env.NODE_ENV === "production";

const config = {
  mode: isProd ? "production" : "development",

  devtool: false,

  entry: {
    app: PATH_APP,
  },

  devServer: {
    contentBase: PATH_PUBLIC,
    publicPath: "/",
    historyApiFallback: true,
    hot: false,
    inline: true,
    host: "0.0.0.0",
  },

  output: {
    filename: "js/[name].[hash].js",
    chunkFilename: "js/[name].[chunkhash].js",
    path: PATH_OUT,
    publicPath: "/",
  },

  module: {
    rules: [
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
              name: "images/[name].[hash].[ext]",
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        loader: require.resolve("ts-loader"),
      },
      {
        test: /\.(l|c)ss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isProd ? false : true,
              reloadAll: true,
            },
          },
          {
            loader: require.resolve("css-loader"),
            options: {
              modules: true
            }
          },
          {
            loader: require.resolve("less-loader"),
          }
        ],
      },

      {
        test: /\.(l|c)ss$/,
        include: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isProd ? false : true,
              reloadAll: true,
            },
          },
          {
            loader: require.resolve("css-loader"),
            options: {
              modules: true,
            }
          },
          {
            loader: require.resolve("less-loader"),
          }
        ],
      },
    ]
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "commons",
          chunks: "all"
        },
      }
    }
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: PATH_TEMPLATE
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].[hash].css",
      chunkFilename: "[id].[hash].css",
      ignoreOrder: true,
    }),
  ],

  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: {
      "@": PATH_SOURCE,
    }
  }

} as Configuration;

export default config;
