import {
    isInteger,
    isString,
    isBoolean,
    isPath,
    isArray
} from 'roc/validators';

const meta = {
    settings: {
        descriptions: {
            build: {
                assets: 'An array of files to include into the build process.'
            },
            dev: {
                port: 'Port for the dev server.',
                devMiddleware: {
                    noInfo: 'If no info should be sent to the console.',
                    quiet: 'If nothing should be sent to the console.'
                },
                hotMiddleware: {
                    reload: 'If the browser should be reloaded if it fails to hot update the code.',
                    overlay: 'If a overlay should be shown when an error has occurred.',
                    noInfo: 'If no info should be sent to the console.',
                    quiet: 'If nothing should be sent to the console.'
                }
            }
        },

        validations: {
            build: {
                assets: isArray(isPath),
                targets: /web/
            },
            dev: {
                debug: isString,
                port: isInteger,
                devMiddleware: {
                    noInfo: isBoolean,
                    quiet: isBoolean
                },
                hotMiddleware: {
                    reload: isBoolean,
                    overlay: isBoolean,
                    noInfo: isBoolean,
                    quiet: isBoolean
                }
            }
        }
    }
};

/**
 * Exports the `roc.config.meta.js`.
 *
 * @return {object} The `roc.config.meta.js`.
 */
export default meta;
