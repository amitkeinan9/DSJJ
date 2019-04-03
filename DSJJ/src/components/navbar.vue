<template>
  <div class="tabs is-centered nav">
    <ul>
      <router-link tag="li" to="/addparticipant">
        <a>
          <span class="icon">
            <i class="fas fa-user-plus"></i>
          </span>
        </a>
      </router-link>
      <router-link tag="li" to="/participants">
        <a>
          <span class="icon">
            <i class="fas fa-users"></i>
          </span>
        </a>
      </router-link>
      <!-- <router-link tag="li" to="/mailinglist">
        <a>
          <span class="icon">
            <i class="fas fa-mail-bulk"></i>
          </span>
        </a>
      </router-link> -->
      <router-link tag="li" to="/dojos">
        <a>
          <span class="icon">
            <i class="fas fa-cog"></i>
          </span>
        </a>
      </router-link>
      <router-link tag="li" to="/" exact>
        <a>
          <span class="icon">
            <i class="fas fa-sign-out-alt"></i>
          </span>
        </a>
      </router-link>

    </ul>
  </div>
</template>

<script>
  export default {
    name: 'navbar',
    data() {
      return {}
    },
    methods: {}
  }

</script>

<style>
  .nav {
    margin: 0;
  }

</style>
