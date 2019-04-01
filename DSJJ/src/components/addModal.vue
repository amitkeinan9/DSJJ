<template>
  <div class="modal">
    <div class="modal-background"></div>
    <div class="modal-content ">
      <div class="box is-8">
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
        if (this.checkProperties(this.data))
          this.$emit('approve', this.data) 
        else {
          Snackbar.show({
            text: 'אנא מלא את כל הפרטים',
            showAction: false,
            backgroundColor: '#dc3035'
          });
        }
      },
      checkProperties(obj) {
        console.log(obj)
        for (let key in obj) {
          if (obj[key] === null || obj[key] == "")
            return false;
        }
        return true;
      }
    },
    created() {
      this.fields.forEach(field => {
        this.data[field.name] = ""
      });
    }
  }

</script>
