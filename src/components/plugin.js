export default function(vm, editor) {
    if (vm.ctx) {
        editor.setContent(vm.ctx);
    }
    editor.tinymce = window.tinyMCE;
    editor.resolve = function(n, o) {
        return editor.tinymce.util.Tools.resolve(n, o);
    }
    editor.getEventDispatcher = function() {
        return this._eventDispatcher;
    }
    editor.on('NodeChange Change KeyUp KeyDown SetContent', function () {
        vm.ctx = editor.getContent();
        availableField(vm, (s) => editor.dom.$(s, editor.getBody()));
    });
    editor.on('undo', function() {
        vm.ctx = editor.getContent();
        availableField(vm, (s) => editor.dom.$(s, editor.getBody()));
    });
    const timer = setInterval(() => {
        if (editor.settings.distory) {
            clearInterval(timer);
            return;
        }
        availableField(vm, (s) => editor.dom?.$(s, editor.getBody()));
    }, 1000);

    editor.on('Cut Copy', function(e) {
        const selection = editor.selection;
        const content = selection.getContent();
        if (/[^a-zA-Z]+mce-field[^a-zA-Z]+/.test(content)) {
            e.preventDefault();
            editor.notificationManager.open({text: '【数据源/组件库】不可剪切、复制!', type: 'error'});
            return
        }
    });

    function changeEvents(edr, bindings, removed) {
        for (let index = 0; index < bindings.length; index++) {
            const binding = bindings[index];
            const events = edr.bindings[binding];

            for (let index = 0; index < events.length; index++) {
                const event = events[index];
                event.removed = removed;
            }
        }
    }

    editor.on('ObjectSelected', function() {
        setTimeout(function() {
            const node = editor.selection.getNode();
            const removed = containClass(node, 'mce-table-line');
            changeEvents(editor.getEventDispatcher(), ['mousemove'], removed);
        });
    });

    editor.on('dblclick', function(e) {
        if (containClass(e.target, 'mce-table-line')) {
            const localField = vm.data.lines?.find(f => f.id == e.target.id);
            if (localField && vm.editLineTable) {
                vm.editLineTable(e, localField);
            }
        }
    });

    editor.on('BeforeExecCommand', function(event) {
        event.target.settings.now_event_wait = event.command;
    });

    editor.on('GetContent', function(event) {
        if (event.target.settings.now_event_wait == 'mcePreview') {
            once('preview', 300, () => {
                const { content } = event.target.fire('preview', event);
                event.content = content;
            });
        }
    });

    editor.on('preview', (e) => vm.preview(e));
}


function availableField(vm, $) {
    for (let index = 0, fields = [...vm.data.main.fields, ...(vm.data.lines||[])];
            index < fields.length; index++) {
        const field = fields[index];
        const disabled = !(field.id && $('#' + field.id)?.length == 0);
        field.disabled = disabled;
    }
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


function containClass(node, clazz) {
    return (node&& node.classList && node.classList.contains(clazz));
}

const fn = function() {}
const cacheLimits = {};
// 限流，只执行最后一次的请求
function limit(key, millis, callback) {
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
function once(key, millis, callback) {
    if (!cacheLimits[key]) {
        cacheLimits[key] = Date.now();
        callback();
        return;
    }
    const nMillis = Date.now();
    if (nMillis - millis >= cacheLimits[key]) {
        callback();
    }
}
