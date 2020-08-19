const webpack = require("webpack");
const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const resourceFolder = "../../build/resources/main/assets/";
// Get appName from gradle.properties, will always get brand :
const fs = require("fs");

let appName = "defaultAppName";
const lines = fs.readFileSync("../../gradle.properties", "utf-8").split("\n");
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.startsWith("appName")) {
    appName = line.substring(line.indexOf("=") + 1).trim();
    break;
  }
}

module.exports = {
  entry: {
    main: "./scripts/main.jsx"
  },
  devtool: "eval-source-map",
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
      allChunks: true
    })
  ],
  module: {
    rules: [
      {
        test: /\.(es6|jsx)?$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(s(a|c)ss)$/,
        use: ['css-loader',
          {
            loader: 'sass-loader',
            // Requires sass-loader@^8.0.0
            options: {
              implementation: require('sass'),
              sassOptions: {
                fiber: require('fibers'),
                indentedSyntax: true // optional
              }
            },
          }]
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: "file-loader?name=fonts/[name].[ext]&publicPath=../"
          }
        ]
      },
      {
        test: /\.(svg|gif|png|jp?g|webp)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "images/[name].[ext]",
              publicPath: "../"
            }
          },
          {
            loader: "img-loader",
            options: {
              plugins: [
                require("imagemin-gifsicle")({
                  interlaced: false
                }),
                require("imagemin-mozjpeg")({
                  progressive: true,
                  arithmetic: false
                }),
                require("imagemin-pngquant")({
                  floyd: 0.5,
                  speed: 2
                }),
                require("imagemin-svgo")({
                  plugins: [
                    { removeTitle: true },
                    { convertPathData: false }
                  ]
                })
              ]
            }
          }
        ]
      },
    ]
  },
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, resourceFolder),
    chunkFilename: "js/[name].chunk.js",
    publicPath: `/_/asset/${appName}:[hash]/`
  }
};
