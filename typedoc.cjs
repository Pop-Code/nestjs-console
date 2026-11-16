module.exports = {
    out: 'docs',
    exclude: ['**/test/**/*'],
    theme: 'default',
    name: 'NestJS Console',
    excludePrivate: false,
    hideGenerator: true,
    entryPoints: ['src/index.ts'],
    includeVersion: true,
    // link the sources to master, not to a branch commit that disappears with the squash merge
    gitRevision: 'master'
};

