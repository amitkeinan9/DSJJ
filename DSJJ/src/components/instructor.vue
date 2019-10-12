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
            <span :class="{'is-selected is-info ' : isSuperInstructor }" class="button" @click="setRole('super-instructor')">מדריך על</span>
            <span :class="{'is-selected is-info ' : isInstructor }" class="button" @click="setRole('instructor')">מדריך</span>
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
        isInstructor: false, 
        isSuperInstructor: false

      }
    },
    computed: {

    },
    methods: {
      ...mapActions(['showError']),
      setRole(role) {
        firebase.functions().httpsCallable('setRole')({
          role: role,
          email: this.instructor.email,
        }).then((result) => {
          this.isSuperInstructor = role == "super-instructor"
            this.isInstructor = role == "instructor"
            Snackbar.show({
              text: 'התפקיד עודכן בהצלחה',
              showAction: false,
              backgroundColor: '#2fa04d'
            });
          
        }).catch(() => this.showError("קרתה תקלה, נסה שוב מאוחר יותר"))
      }
    },
    mounted() {
      this.isSuperInstructor = this.instructor.role == "super-instructor"
      this.isInstructor = this.instructor.role == "instructor"
    }
  }

</script>
