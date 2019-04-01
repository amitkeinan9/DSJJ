<template>
  <div>
    <div class="container">
      <div class="columns is-centered is-mobile">
        <div class="column is-8">
          <login @loggedIn="loggedIn"></login>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import Login from '@/components/login'
  import firebase from 'firebase'
  import {
    mapActions
  } from 'vuex'
  import router from '@/router';

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

          userObj.dojos = []
          let proms = inst.dojos.map((dojo) => db.doc('dojos/' + dojo.id).get());
          Promise.all(proms).then((dojos) => {
            userObj.dojos = dojos.map(d => d.data().name);
            sessionStorage.setItem('user', JSON.stringify(userObj))
            router.push('/participants')
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
