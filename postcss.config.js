module.exports = {
    addons: [
        'storybook-addon-sass-postcss',
        {
            name: 'storybook-addon-sass-postcss',
            options: {
                postcssLoaderOptions: {
                    implementation: require('postcss'),
                },
            },
        },
    ]
}
