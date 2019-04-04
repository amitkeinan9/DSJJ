<template>
  <div>
    <div class="container">
      <div class="columns is-centered is-mobile">
        <div class="column is-8">
          <p class="title is-1">רשימות תפוצה</p>
          <br>
          תוכן וכזה



          <scanner></scanner>
        </div>
      </div>
    </div>
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
        msg: ""
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
