var path = require( 'path' );
var pkg = require( './package.json' );


module.exports = {
    entry: './src/index.js',
    output: {
        path: './lib/',
        library: pkg.name,
        libraryTarget: 'umd',
        filename: `${pkg.name}.js`
    },
    devtool: 'source-map',

    module: {
        loaders: [ {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: [ 'react', 'es2015', 'stage-0' ],
                compact: false
            }
        } ]
    }
}
