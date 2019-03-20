<template>
  <div class="modal ">
    <div class="modal-background"></div>
    <div class="modal-content ">
      <div class="box is-12">
        <div v-for="field in fields" class="control">
          <input class="input" v-model="data[field.name]" type="text" :placeholder="field.displayName">
        </div>
        <br>
        <div class="control">
          <a @click="addDojo" class="button is-link is-outlined is-fullwidth">הוסף {{title}}</a>
        </div>
      </div>
    </div>
    <button class="modal-close is-large" aria-label="close" @click="$emit('close')"></button>
    
  </div>
</template>

<script>
  export default {
    name: 'addModal',
    props: ['title', 'fields'],
    data() {
      return {
        data: {}
      }
    },
    methods: {
      addDojo() {
        this.$emit('approve', this.data)
      }
    }
  }

</script>
