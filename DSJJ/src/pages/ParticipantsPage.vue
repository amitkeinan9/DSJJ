<template>
  <div>
      <p class="title is-1">חניכים</p>
      <br>
      תוכן וכזה
  </div>
</template>

<script>
  import {
    mapActions
  } from 'vuex'

  export default {
    name: 'ParticipantsPage',
    components: {

    },
    data() {
      return {
        msg: "",
      }
    },
    methods: {
      ...mapActions(['authorizePage']),
    },
    created() {
      this.authorizePage();
      this.msg = sessionStorage.getItem('user')
    },
  }

</script>
