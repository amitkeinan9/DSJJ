<template>
  <div id="app" dir="rtl">
    <navbar></navbar>
    <div class="container">
      <div class="columns is-centered is-mobile">
        <div class="column is-8">
          <router-view />
      </div>
      </div>
    </div>
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
