//import webpack from "webpack";
const webpack = require('webpack');
const config = require("../webpack.config.js");
const WebpackDevServer = require("webpack-dev-server");

const compiler = webpack(config);

module.exports = (PORT) => {
  const server = new WebpackDevServer( compiler, {
       proxy: {
         "/api*" : `http://localhost:${PORT - 1}/`
       },
       historyApiFallback: true,
       // ... rest of the options
       contentBase: './src/public',
       stats: 'minimal'
     });
  server.listen(PORT, 'localhost');
};
