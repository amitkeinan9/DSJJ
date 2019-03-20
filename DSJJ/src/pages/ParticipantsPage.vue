<template>
  <div>
    Hello {{msg}}, This is the participants page
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
