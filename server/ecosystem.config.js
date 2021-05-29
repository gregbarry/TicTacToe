module.exports = {
    apps : [{
        name: 'tictactoe-server',
        script: './server.js',
        watch: false,
        exec_mode: 'fork',
        instances: 1,
        instance_var: 'INSTANCE_ID',
        env: {
            'NODE_ENV': 'production',
            'ALLOW_CONFIG_MUTATIONS': 'Y'
        }
    }]
};
