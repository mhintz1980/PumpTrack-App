module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',     // lets Jest parse “type Foo = …”
  ],
};
