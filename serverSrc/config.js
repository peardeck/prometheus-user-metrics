function env(key) {
    var val = process.env[key];
    if (val && (val != 'false') && (val != 'null')) {
        return val;
    } else if (val === 'false') {
        return false;
    } else if (val === 'null') {
        return null;
    } else {
        throw new Error(`Missing required env variable ${key}`)
    }
}

export const configPath = env('PUM_CONFIG_PATH');