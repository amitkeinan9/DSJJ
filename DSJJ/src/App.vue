<template>
  <div id="app" dir="rtl">
    <navbar v-if="show"></navbar>
    <router-view />
    
  </div>
</template>

<script>
  import Navbar from '@/components/navbar'
  import firebase from 'firebase'
  import {mapActions} from 'vuex'
  export default {
    name: 'App',
    components: {
      'navbar': Navbar
    },
    computed: {
      show() {
        console.log(this.$route.name)
        console.log(['LoginPage'].indexOf(this.$route.name));
        
        return ['LoginPage'].indexOf(this.$route.name) == -1
      }
    },
    methods: {
      ...mapActions(['setRole'])
    },
    created() {
      firebase.auth().onAuthStateChanged((user) => {
        console.log(user)
        if (!user){
          router.push("/")
        } else {
          user.getIdTokenResult().then(a => { this.setRole(a.claims.role)})
          return true
        }
      });
    }
  }

</script>
