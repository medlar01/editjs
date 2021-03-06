export default function(vm) {
    return {
        selector: '#' + vm.tinymceId,
        language: vm.lang,
        skin: 'oxide-x',
        height: '100%',
        menubar: false,
        toolbar_sticky: false,
        plugins: 'print preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking toc insertdatetime advlist lists imagetools textpattern noneditable help charmap quickbars emoticons',
        toolbar: 'fieldreadonly undo redo | fullscreen  preview code | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | table | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | insertfile image media template link codesample | visualblocks ltr rtl',
        content_style: `
            body { font-family:Helvetica,Arial,sans-serif; font-size:14px; padding: 5px } 
            .mce-content-body [contentEditable=false][data-mce-selected] { outline: 2px solid #b4d7ff; cursor: default }
            .mce-visualblocks { min-width: calc(100% - 32px); width: fit-content }
            .mce-field { display: inline-block; min-height: 20px; border: 1px solid grey; font-size: 12px; position: relative;
                line-height: 20px; padding: 0 2px; margin: 0 1px 0 2px; -webkit-user-select:none; -moz-user-select:none;  -ms-user-select:none; user-select:none;
                color: #666666; font-weight: bold;
            }
            .mce-field > i {
                background-color: white;position: absolute; right: 0px; padding: 0 5px;
            }
            .mce-field[mce-nobor="true"] {
                border: 1px dashed
            }
            .mce-table-line { position: relative; display: block; padding-top: 10px; border: 1px dashed #bbb; min-height: 20px; margin: 2px }
            .mce-table-line::before { content: attr(title); position: absolute; width: 100%; height: 100%; top: 0; left: 0; z-index: 10; font-size: 10px; color: #666666 }
            .line_field { position: relative }
        `,
        content_css: ['https://cdn.jsdelivr.net/gh/medlar01/tinymce-cdn@5.9.2.4/icons/iconfont/iconfont.css'],
        extended_valid_elements: 'i[class],span[id|class|style|mce-nobor|mce-required],td[*]',
        table_clone_elements: 'strong em b i font h1 h2 h3 h4 h5 h6 p div',
        table_sizing_mode: 'fixed',
        table_default_styles: {
            width: '100%'
        },
        noneditable_noneditable_class: 'unedit',
        quickbars_insert_toolbar: false,
        toolbar_mode: 'sliding',
        force_br_newlines: false,
        force_p_newlines: false,
        draggable_modal: true,
        forced_root_block: vm.block,
        visualblocks_default_state: true,
        resize: false,
        init_instance_callback(editor) {
            vm.$emit('init-event', editor);
        }
    }
}

export const constTableTpl = `
<table class="line_field" style="width: 939.016px; background-color: white" border="1">
<thead>
<tr style="text-align: center;">
<td v-if="!printMode" class="checkbox" style="width: 20px" scope="col">//</td>
<td style="width: 220.719px;" scope="col"></td>
<td style="width: 220.719px;" scope="col"></td>
<td style="width: 220.719px;" scope="col"></td>
<td style="width: 220.734px;" scope="col"></td>
</tr>
</thead>
<tbody>
<tr class="line_field_row">
<td v-if="!printMode" class="checkbox" style="width: 20px;"><input type="checkbox"/></td>
<td style="width: 220.719px;"></td>
<td style="width: 220.719px;"></td>
<td style="width: 220.719px;"></td>
<td style="width: 220.734px;"></td>
</tr>
</tbody>
<tfoot>
<tr style="background-color: #ecf0f1;">
<td v-if="!printMode" class="checkbox" style="width: 20px"></td>
<td style="width: 220.719px;"></td>
<td style="width: 220.719px;"></td>
<td style="width: 220.719px;"></td>
<td style="width: 220.734px;"></td>
</tr>
</tfoot>
</table>
`