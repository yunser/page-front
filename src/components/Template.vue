<template>
    <div>
        <div @click="selectTemplate('1')">我我我我我我</div>
        <div @click="selectTemplate('2')">们们们们们们们</div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
            }
        },
        props: {
            select: {
                type: Function
            },
        },
        methods: {
            selectTemplate(asd) {
                this.select && this.select(asd)
                this.$emit('change', asd)
            }
        }
    }
</script>

<style lang="scss" scoped>
    
</style>
