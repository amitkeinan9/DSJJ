<template>
  <div>
    <nav class="level">
      <div class="level-item has-text-centered">
        <div>
          <h1 class="is-5 subtitle">{{ instructor.firstName }} {{ instructor.lastName}}</h1>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <div class="buttons has-addons" dir="ltr">
            <span class="button" @click="setRole('super-instructor')">מדריך על</span>
            <span class="button" @click="setRole('instructor')">מדריך</span>
          </div>
        </div>
      </div>
    </nav>
    <br>
  </div>
</template>

<script>
  import firebase from 'firebase';
  import {mapActions} from 'vuex';
  export default {
    name: 'instructor',
    props: ['instructor'],
    data() {
      return {
        instructorModal: false,
        selectModal: false,

      }
    },
    computed: {},
    methods: {
      ...mapActions(['showError']),
      setRole(role) {
        firebase.functions().httpsCallable('setRole')({
          role: role,
          email: this.instructor.email,
        }).then((result) => {
          
            Snackbar.show({
              text: 'התפקיד עודכן בהצלחה',
              showAction: false,
              backgroundColor: '#2fa04d'
            });
          
        }).catch(() => this.showError("קרתה תקלה, נסה שוב מאוחר יותר"))
      }
    }
  }

</script>
