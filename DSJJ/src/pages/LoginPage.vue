<template>
    <div>
    <login @loggedIn="loggedIn"></login>
    </div>
</template>
       
<script> 
    import Login from '@/components/login'
    import firebase from 'firebase'
    import { mapActions } from 'vuex'

    export default {
        name: 'LoginPage',
        components: {
            'login': Login,
        },
        data () {
            return {
            }
        },
        methods: {
            loggedIn({user}) {
                console.log(user)
                sessionStorage.setItem('user', user.email)
            }
        },
        mounted() {
            firebase.auth().signOut();
            sessionStorage.removeItem('user')
        }
    }
</script>
       
       