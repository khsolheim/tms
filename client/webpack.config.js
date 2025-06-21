/**
 * Advanced Webpack Configuration for TMS
 * 
 * Optimaliserer bundle size, tree shaking og performance
 */

const path = require('path');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = !isProduction;

  return {
    // Optimization configuration
    optimization: {
      // Aggressive tree shaking
      usedExports: true,
      sideEffects: false,
      
      // Bundle splitting strategy
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 200000,
        cacheGroups: {
          // Vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            maxSize: 250000,
          },
          
          // React and React-DOM
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
          
          // UI libraries (icons, charts)
          ui: {
            test: /[\\/]node_modules[\\/](react-icons|recharts|framer-motion)[\\/]/,
            name: 'ui-libs',
            chunks: 'all',
            priority: 15,
          },
          
          // Utility libraries
          utils: {
            test: /[\\/]node_modules[\\/](lodash|date-fns|axios)[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 12,
          },
          
          // Common code across pages
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
            priority: 5,
          },
          
          // Critical styles
          styles: {
            name: 'styles',
            type: 'css/mini-extract',
            chunks: 'all',
            enforce: true,
          }
        }
      },
      
      // Production optimizations
      ...(isProduction && {
        minimize: true,
        minimizer: [
          new (require('terser-webpack-plugin'))({
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
              },
              mangle: {
                safari10: true,
              },
              format: {
                comments: false,
              },
            },
            extractComments: false,
          }),
          new (require('css-minimizer-webpack-plugin'))(),
        ],
      }),
    },

    // Module resolution optimizations
    resolve: {
      alias: {
        // Use production builds
        'react': 'react/index.js',
        'react-dom': 'react-dom/index.js',
        
        // Optimize lodash imports
        'lodash': 'lodash-es',
        
        // Bundle alias for better tree shaking
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@utils': path.resolve(__dirname, 'src/utils'),
      },
      
      // Optimize module resolution
      modules: ['node_modules'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      
      // Faster symlink resolution
      symlinks: false,
    },

    // Module rules for tree shaking
    module: {
      rules: [
        // TypeScript/JavaScript with tree shaking
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', {
                    modules: false, // Preserve ES modules for tree shaking
                    useBuiltIns: 'usage',
                    corejs: 3,
                    targets: {
                      browsers: ['> 1%', 'last 2 versions'],
                    },
                  }],
                  '@babel/preset-react',
                  '@babel/preset-typescript',
                ],
                plugins: [
                  // Optimize imports
                  ['import', {
                    libraryName: 'lodash',
                    libraryDirectory: '',
                    camel2DashComponentName: false,
                  }, 'lodash'],
                  ['import', {
                    libraryName: 'react-icons',
                    libraryDirectory: '',
                    camel2DashComponentName: false,
                  }, 'react-icons'],
                  
                  // Dynamic imports
                  '@babel/plugin-syntax-dynamic-import',
                  
                  // Remove unused code
                  isProduction && 'babel-plugin-transform-remove-console',
                ].filter(Boolean),
              },
            },
          ],
        },
        
        // CSS with optimization
        {
          test: /\.css$/,
          use: [
            isProduction ? require('mini-css-extract-plugin').loader : 'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    require('tailwindcss'),
                    require('autoprefixer'),
                    isProduction && require('cssnano')({
                      preset: ['default', {
                        discardComments: { removeAll: true },
                        normalizeWhitespace: false,
                      }],
                    }),
                  ].filter(Boolean),
                },
              },
            },
          ],
        },
        
        // Images with optimization
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024, // 8kb
            },
          },
          generator: {
            filename: 'images/[name].[hash:8][ext]',
          },
        },
        
        // Fonts with optimization
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash:8][ext]',
          },
        },
      ],
    },

    // Plugins for optimization
    plugins: [
      // Environment variables
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      }),
      
      // Extract CSS
      isProduction && new (require('mini-css-extract-plugin'))({
        filename: 'css/[name].[contenthash:8].css',
        chunkFilename: 'css/[name].[contenthash:8].chunk.css',
      }),
      
      // Gzip compression
      isProduction && new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 8192,
        minRatio: 0.8,
      }),
      
      // Brotli compression (better than gzip)
      isProduction && new CompressionPlugin({
        filename: '[path][base].br',
        algorithm: 'brotliCompress',
        test: /\.(js|css|html|svg)$/,
        compressionOptions: {
          level: 11,
        },
        threshold: 8192,
        minRatio: 0.8,
      }),
      
      // Bundle analysis (only when needed)
      process.env.ANALYZE && new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: 'bundle-report.html',
      }),
      
      // Preload webpack plugin for critical chunks
      new (require('@vue/preload-webpack-plugin'))({
        rel: 'preload',
        include: 'initial',
        fileBlacklist: [/\.map$/, /hot-update\.js$/],
      }),
      
      // Prefetch webpack plugin for secondary chunks
      new (require('@vue/preload-webpack-plugin'))({
        rel: 'prefetch',
        include: 'asyncChunks',
      }),
      
    ].filter(Boolean),

    // Development optimizations
    ...(isDevelopment && {
      devtool: 'eval-cheap-module-source-map',
      devServer: {
        hot: true,
        compress: true,
        historyApiFallback: true,
      },
    }),

    // Production optimizations
    ...(isProduction && {
      devtool: 'source-map',
      
      // Performance budgets
      performance: {
        maxAssetSize: 250000, // 250kb per asset
        maxEntrypointSize: 500000, // 500kb for entry point
        hints: 'warning',
        assetFilter: (assetFilename) => {
          return !assetFilename.endsWith('.map');
        },
      },
    }),

    // Stats configuration
    stats: {
      assets: true,
      children: false,
      chunks: false,
      hash: false,
      modules: false,
      publicPath: false,
      timings: true,
      version: false,
      warnings: true,
      colors: true,
    },
  };
}; 