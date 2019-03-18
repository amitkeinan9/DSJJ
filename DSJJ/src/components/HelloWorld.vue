<template>
 <div>
   login<br>
   <input v-model="email" placeholder="email"><br>
   <input v-model="password" placeholder="password"><br>
   <button @click="login">LOGIN!</button>
 </div>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'HelloWorld',
  data () {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    login() {
      firebase.auth().signInWithEmailAndPassword(this.email, this.password)
      .then(
        (user) => { console.log(user)},
         (err) => { console.log(err) })
    }
  }
}
</script>

