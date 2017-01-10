var path = require( 'path' );
var pkg = require( './package.json' );


module.exports = {
    entry: './src/index.js',
    output: {
        path: './dist/',
        library: pkg.name,
        libraryTarget: 'umd',
        filename: `${pkg.name}.js`
    },
    devtool: 'source-map',

    // this is for pixi.js
    node: {
        fs: 'empty'
    },
    module: {
        loaders: [ {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: [ 'react', 'es2015', 'stage-0' ],
                compact: false
            }
        } ],
        postLoaders: [ {
            include: path.resolve( __dirname, 'node_modules/pixi.js' ),
            loader: 'transform?brfs'
        } ]
    }
}
