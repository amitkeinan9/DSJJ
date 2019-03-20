<template>
  <div>
    Hello {{msg}}, This is the mailing list page
  </div>
</template>

<script>
  import {
    mapActions
  } from 'vuex'

  export default {
    name: 'MailingListPage',
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
