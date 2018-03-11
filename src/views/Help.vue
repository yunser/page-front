<template>
    <my-page title="帮助">
        <article>
            <dl class="help-list">
                <dt><span class="key">?</span> </dt>
                <dd>帮助</dd>
                <dt><span class="key">Ctrl</span> + <span class="key">C</span> </dt>
                <dd>复制选中组件</dd>
                <dt><span class="key">Ctrl</span> + <span class="key">V</span> </dt>
                <dd>粘贴组件</dd>
                <dt><span class="key">Ctrl</span> + <span class="key">X</span> </dt>
                <dd>剪切选中组件</dd>
                <dt><span class="key">Delete</span> </dt>
                <dd>删除选中组件</dd>
            </dl>
        </article>
    </my-page>
</template>

<script>
    export default {
        data () {
            return {
            }
        },
        methods: {
            test() {
                alert(1)
            }
        }
    }
</script>

<style scoped>
    dt {
        font-weight: normal;
        margin: 0 0 1em 20px;
    }
    .help-list {
        font-size: 14px;
        line-height: 28px;
    }
    .help-list .key {
        display: inline-block;
        margin: 0 1px;
        padding: 0 5px;
        min-width: 1em;
        font: 11px/22px Menlo,Monaco,monospace;
        color: #888;
        border: 1px solid #C1C1C1;
        border-radius: 3px;
        text-align: center;
        box-shadow: inset 0 2px 2px #fff,0 1px 2px rgba(0,0,0,.1);
        background: -webkit-linear-gradient(top,#fff 0,rgba(240,240,240,.92) 83%,rgba(250,250,250,.91) 89%,rgba(188,188,188,.9) 100%);
    }
    .help-list dt {
        padding-right: 5px;
        float: left;
        clear: left;
        min-width: 105px;
        text-align: right;
    }
    .help-list dt:after {
        margin-left: 4px;
        content: ':';
        color: #999;
    }
    .help-list dd {
        float: left;
    }
</style>
