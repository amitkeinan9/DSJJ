<template>
        <div class="tabs is-centered is-fixed-bottom" >
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
                    <router-link tag="li" to="/mailinglist">
                        <a>
                                <span class="icon">
                                    <i class="fas fa-mail-bulk"></i>
                                </span>
                            </a>
                    </router-link>
                    <router-link tag="li" to="/dojos">
                        <a>
                                <span class="icon">
                                    <i class="fas fa-cog"></i>
                                </span>
                            </a>
                    </router-link>
                  
                </ul>
              </div>
</template>
           
<script> 
    export default {
        name: 'navbar',
        data () {
            return {
            }
        },
        methods: {
        }
    }
</script>
           
           