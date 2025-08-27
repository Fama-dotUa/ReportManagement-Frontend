module.exports = {
  plugins: [
    require('postcss-preset-env')({
      stage: 3,
      features: { 'nesting-rules': true }
    }),
    ...(process.env.NODE_ENV === 'production'
      ? [require('@fullhuman/postcss-purgecss')({
          content: [
            './index.html',
            './src/**/*.{ts,tsx,js,jsx}',
          ],
          defaultExtractor: content =>
            content.match(/[\w-/:%.]+(?<!:)/g) || [],
          safelist: {
            standard: [
              // добавь сюда динамические классы, если генерируешь их строками
              // пример: 'modal-open', /^toast-/
            ]
          }
        }),
        require('cssnano')({
          preset: ['default', {
            discardComments: { removeAll: true },
            mergeIdents: true,
            reduceIdents: true,
          }]
        })]
      : [])
  ]
};
