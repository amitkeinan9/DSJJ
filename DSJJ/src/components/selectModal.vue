<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-content ">
      <div class="box is-8">
        <div class="margin select is-fullwidth">
          <select v-model="selected">
            <option v-for="instructor in instructors" :value="instructor.id">{{instructor.firstName}}
              {{instructor.lastName}}</option>
          </select>
        </div>
        <br>
        <br>
        <div class="control">
          <a class="button is-link is-outlined is-fullwidth" @click="$emit('approve', selected)">הוסף</a>
        </div>
      </div>
    </div>
    <button class="modal-close is-large" aria-label="close" @click="$emit('close')"></button>

  </div>
</template>

<script>
  export default {
    name: 'selectModal',
    props: ['instructors'],
    data() {
      return {
        selected: this.instructors[0].id
      }
    },
    methods: {

    },
    created() {
      
    }
  }

</script>
