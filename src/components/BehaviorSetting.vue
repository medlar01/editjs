<template>
    <a-layout class="behavior-setting">
        <a-layout-sider>
            <a-menu mode="inline">
                <a-menu-item key="1">
                    <a-icon type="tags" />
                    <span class="nav-text">字段1</span>
                </a-menu-item>
                <a-menu-item key="2">
                    <a-icon type="tags" />
                    <span class="nav-text">字段2</span>
                </a-menu-item>
            </a-menu>
            <div class="toolbar">
                <a-button type="dashed" shape="round" size="small">
                    <a-icon type="edit" />
                    创建
                </a-button>
            </div>
        </a-layout-sider>
        <a-layout-content>

        </a-layout-content>
    </a-layout>
</template>

<script>
export default {
    
}
</script>

<style lang="scss">
.behavior-setting {
    .toolbar {
        margin: 10px 5px;
        text-align: center;
        > button {
            width: 100px;
        }
    }
}
</style>