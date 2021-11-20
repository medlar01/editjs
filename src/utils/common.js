export function objEach(obj, callback) {
    Object.keys(obj).forEach(i => callback(obj[i], i));
}

export function hasKey(obj, key) {
    return Object.keys(obj).includes(key);
}

const cacheUniques = [-1, 0];
/**
 * 使用日期生成唯一值
 * @returns 字符串
 */
 export function unique() {
    const timestamp = Date.now();
    const num = cacheUniques[0] === timestamp ? (cacheUniques[1] += 1) : (cacheUniques[1] = 0);
    cacheUniques[0] = timestamp;
    let str = timestamp + "" + num;
    let index = 0;
    let ret = "";
    while (index < str.length) {
        ret += parseInt(str.substr(index, 4)).toString(32);
        index += 4;
    }
    const hex = 'abcdefghijklmnopqrstuvwxyz';
    return hex.charAt(Math.random() * 25) + ret;
}

const cacheLimits = {};
// 限流，只执行最后一次的请求
export function limit(key, millis, callback) {
    if (!cacheLimits[key]) {
        cacheLimits[key] = {
            timer: setTimeout(callback, millis),
            millis: Date.now()
        };
        return;
    }
    const nMillis = Date.now();
    if (nMillis - millis < cacheLimits[key].millis) {
        clearTimeout(cacheLimits[key].timer);
    }
    cacheLimits[key] = {
        timer: setTimeout(callback, millis),
        millis: Date.now()
    };
}

const cacheOnces = {};
// 限流，只执行第一次
export function once(key, millis, callback) {
    if (!cacheOnces[key]) {
        cacheOnces[key] = Date.now();
        callback();
        return;
    }
    const nMillis = Date.now();
    if (nMillis - millis >= cacheOnces[key]) {
        callback();
    }
}