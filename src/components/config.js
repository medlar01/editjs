export default function(vm) {
    return {
        selector: '#' + vm.tinymceId,
        language: vm.lang,
        skin: 'oxide-x',
        height: '100%',
        menubar: false,
        toolbar_sticky: false,
        plugins: 'print preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking toc insertdatetime advlist lists imagetools textpattern noneditable help charmap quickbars emoticons',
        toolbar: 'undo redo | fullscreen  preview code | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | table | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | insertfile image media template link codesample | visualblocks ltr rtl',
        content_style: `
            body { font-family:Helvetica,Arial,sans-serif; font-size:14px } 
            .mce-content-body [contentEditable=false][data-mce-selected] { outline: 2px solid #b4d7ff; cursor: default }
            .mce-visualblocks { min-width: calc(100% - 32px); width: fit-content }
            .mce-field { display: inline-block; min-width: 200px; min-height: 20px; border: 1px solid grey; font-size: 12px;
                line-height: 20px; padding: 0 2px; margin: 0 2px; -webkit-user-select:none; -moz-user-select:none;  -ms-user-select:none; user-select:none;
                outline: 0px; border-radius: 0px
            }
            .mce-table-line { position: relative; display: block; padding-top: 10px; border: 1px dashed #bbb; min-height: 20px; margin: 2px }
            .mce-table-line::before { content: attr(title); position: absolute; width: 100%; height: 100%; top: 0; left: 0; z-index: 10; font-size: 10px; color: #666666 }
        `,
        table_clone_elements: 'strong em b i font h1 h2 h3 h4 h5 h6 p div',
        table_sizing_mode: 'fixed',
        noneditable_noneditable_class: 'unedit',
        quickbars_insert_toolbar: false,
        toolbar_mode: 'sliding',
        force_br_newlines: false,
        force_p_newlines: false,
        forced_root_block: vm.block,
        visualblocks_default_state: true,
        resize: false,
        init_instance_callback(editor) {
            vm.$emit('init-event', editor);
        }
    }
}