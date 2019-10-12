<template>
  <div id="premissionsPage">
    <div class="container">
      <div class="columns is-centered is-mobile">
        <div class="column is-8">
          <p class="title is-1">הרשאות</p>
          <br>
          <loading-spinner :class="{'is-hidden': loading}"></loading-spinner>
          <instructor v-for="instructor in instructors" :instructor="instructor"></instructor>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    mapActions,
    mapGetters
  } from 'vuex'
  import loadingSpinner from '@/components/loadingSpinner'
  import Instructor from '@/components/instructor'

  import firebase from 'firebase'


  export default {
    name: 'SettingsPage',
    components: {
      'loading-spinner': loadingSpinner,
      'instructor': Instructor
    },
    data() {
      return {
        db: null,
        loading: false,
        instructors: []
      }
    },
    methods: {
      ...mapActions(['authorizePage', 'showError']),
    },
    created() {
      this.authorizePage({
        adminOnly: true
      });
      this.db = firebase.firestore();
      this.db.collection("instructors").onSnapshot((instDocs) => {
        this.instructors = instDocs.docs.map(i => {
          let inst = i.data();
          inst.id = i.id;
          return inst;
        })
        const getRoles = firebase.functions().httpsCallable('getRoles');
        getRoles({emails: this.instructors.map(i => i.email)}).then((roles) => {
          
          this.instructors.forEach(i => {            
            i.role = roles.data.find(r => r.email == i.email).role;
          });
          this.instructors = this.instructors.filter(i => i.role != "admin")
          this.loading = true;
        });
        
        
      });
    },
  }

</script>
