var path = require("path");
var pkg = require("./package.json");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: "./lib/",
    library: "NES",
    filename: "nes.js",
    libraryExport: "Console",
    libraryTarget: "umd"
  },
  devtool: "source-map",

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          presets: ["es2015"],
          compact: false
        }
      }
    ]
  }
};
