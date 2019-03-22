<template>
  <div>
      <p class="title is-1">רשימות תפוצה</p>
      <br>
      תוכן וכזה
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
