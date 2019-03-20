<template>
  <div>
    Hello {{msg}}, This is the add participant page
  </div>
</template>

<script>
  import {
    mapActions
  } from 'vuex'

  export default {
    name: 'AddParticipantPage',
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
