<template>
    <iframe v-if="props.plnum == 0" class="h-full w-full rounded-xl col-span-full group-hover:col-span-8" src="https://open.spotify.com/embed/playlist/417MYkbbHZeadIgEFq7G70" frameborder="0" allowtransparency="true" allow="encrypted-media">
    </iframe>

    <iframe v-else-if="props.plnum == 1" class="h-full w-full rounded-xl col-span-full group-hover:col-span-8" src="https://open.spotify.com/embed/playlist/417MYkbbHZeadIgEFq7G70" frameborder="0" allowtransparency="true" allow="encrypted-media">
    </iframe>

    <iframe v-else-if="props.plnum == 2" class="h-full w-full rounded-xl col-span-full group-hover:col-span-8" src="https://open.spotify.com/embed/playlist/417MYkbbHZeadIgEFq7G70" frameborder="0" allowtransparency="true" allow="encrypted-media">
    </iframe>

</template>

<script>
import { onMounted } from '@vue/runtime-core'
export default {
    props: {
        plkey: Number
    },
    setup(props) {
        onMounted(() => console.log(props.plkey))
        return {props}
    },
}
</script>