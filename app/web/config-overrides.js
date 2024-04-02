const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
const { configPaths } = require("react-app-rewire-alias")
const { aliasDangerous } = require("react-app-rewire-alias/lib/aliasDangerous");

module.exports = function override(config, env) {
    config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin instanceof ModuleScopePlugin));

    return aliasDangerous({
      ...configPaths("./tsconfig.paths.json")
    })(config);
};
