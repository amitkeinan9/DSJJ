<template>
  <div class="edit">
    <form @submit="submit">
      <div class="margin control">
        
        <p class="has-text-right"><strong> תחילת תוקף {{title}}</strong></p>
        <input dir="rtl" class="input" type="date" v-model="data.date" :max="today">
      </div>
      <p class="has-text-right"><strong>ערך חדש</strong></p>
      <div class="margin select is-fullwidth">

        <select required v-model="data.selected">
          <option v-for="option in options" :value="option">{{option.name}}</option>
        </select>
      </div>
      <button type="submit" class="button is-outlined is-fullwidth is-link margin" >עדכן</button>
    </form>
  </div>
</template>

<script>
  import moment from 'moment'
  export default {
    name: 'editSelect',
    props: ['options', 'title'],
    data() {
      return {
        today: moment().format('YYYY-MM-DD'),
        data: {
          date: moment().format('YYYY-MM-DD'),
          selected: ""
        }
      }
    },
    methods: {
        submit(e) {
          e.preventDefault();
            this.$emit('approve', this.data)
            return false;
        }
    }
  }

</script>

<style scoped>
  .margin {
    margin-bottom: 10px;
  }

</style>
