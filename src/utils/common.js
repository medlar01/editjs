export function objEach(obj, callback) {
    Object.keys(obj).forEach(i => callback(obj[i], i));
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