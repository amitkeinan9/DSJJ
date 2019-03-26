<template>
  <div id="app" dir="rtl">
    <navbar></navbar>
    <router-view />
    
  </div>
</template>

<script>
  import Navbar from '@/components/navbar'
  export default {
    name: 'App',
    components: {
      'navbar': Navbar
    }
  }

</script>
