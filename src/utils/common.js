export function objEach(obj, callback) {
    Object.keys(obj).forEach(i => callback(obj[i], i));
}