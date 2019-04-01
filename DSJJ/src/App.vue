<template>
  <div id="app" dir="rtl">
    <navbar v-if="show"></navbar>
    <router-view />
    
  </div>
</template>

<script>
  import Navbar from '@/components/navbar'
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
    }
  }

</script>
