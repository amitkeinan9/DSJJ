<template>
  <div>
    <login @loggedIn="loggedIn"></login>
  </div>
</template>

<script>
  import Login from '@/components/login'
  import firebase from 'firebase'
  import {
    mapActions
  } from 'vuex'

  export default {
    name: 'LoginPage',
    components: {
      'login': Login,
    },
    data() {
      return {}
    },
    methods: {
      loggedIn({
        user
      }) {
        const db = firebase.firestore()
        db.collection('instructors').where('email', '==', user.email).get().then((results) => {
          const inst = results.docs[0].data();
          let userObj = {
            name: inst.firstName + " " + inst.lastName
          }
          db.doc('dojos/' + inst.dojo.id).get().then((d) => {
            userObj.dojo = d.data().name
            sessionStorage.setItem('user', JSON.stringify(userObj))
          })
        })
        
      }
    },
    mounted() {
      firebase.auth().signOut();
      sessionStorage.removeItem('user')
    }
  }

</script>
