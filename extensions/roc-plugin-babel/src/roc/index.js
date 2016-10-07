import { readFileSync } from 'fs';
import { join } from 'path';

import isFunction from 'lodash.isfunction';
import { merge, fileExists } from 'roc';
import log from 'roc/log/default/small';

export default {
    actions: [{
        hook: 'babel-config',
        description: 'Base Babel configuration',
        action: () => () => (babelConfig) => ({
            ...babelConfig,
            // We disable babelrc here since it often results in strange behaviors
            babelrc: false,
            presets: [],
            plugins: [],
            env: {},
        }),
        post: ({ context: { config: userConfig, directory, packageJSON } }) => (target) => {
            let userBabelConfig;

            /**
            The priority when Roc loads Babel configuration.

            1. "babel" inside roc.config.js
            2. .babelrc
            3. "babel" inside package.json
            */
            if (userConfig.babel) {
                if (fileExists('.babelrc', directory)) {
                    log.warn('You have defined a Babel configuration in the roc.config.js file that will be used ' +
                        'over the existing .babelrc file.');
                } else if (packageJSON.babel) {
                    log.warn('You have defined a Babel configuration in the roc.config.js file that will be used ' +
                        'over the configuration inside package.json.');
                }

                userBabelConfig = isFunction(userConfig.babel) ?
                   userConfig.babel(target) : userConfig.babel;
            } else if (fileExists('.babelrc', directory)) {
                userBabelConfig = JSON.parse(readFileSync(join(directory, '.babelrc'), 'utf-8'));
            } else if (packageJSON.babel) {
                userBabelConfig = packageJSON.babel;
            }

            if (userBabelConfig) {
                return (babelConfig) => {
                    const newBabelConfig = merge(babelConfig, userBabelConfig);
                    newBabelConfig.plugins = [...(userBabelConfig.plugins || []), ...(babelConfig.plugins || [])];

                    // We need to flip the order here because of the way that Babel processes presets
                    newBabelConfig.presets = [...(babelConfig.presets || []), ...(userBabelConfig.presets || [])];

                    // Merge env configuration with special consideration for plugins & presets
                    Object.keys(newBabelConfig.env).forEach((env) => {
                        const babelConfigEnv = babelConfig.env[env] || {};
                        const userBabelConfigEnv = userBabelConfig.env[env] || {};

                        const envPresets = [
                            ...(babelConfigEnv.presets || []),
                            ...(userBabelConfigEnv.presets || []),
                        ];

                        newBabelConfig.env[env].presets = envPresets;

                        const envPlugins = [
                            ...(userBabelConfigEnv.plugins || []),
                            ...(babelConfigEnv.plugins || []),
                        ];

                        newBabelConfig.env[env].plugins = envPlugins;
                    });

                    return newBabelConfig;
                };
            }

            return undefined;
        },
    }],
};
