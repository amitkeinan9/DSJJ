<template>
  <div dir="ltr">
    <div class="margin control has-icons-left">
      <input v-model="email" class="input" type="email" placeholder="Email">
      <span class="icon is-small is-left">
        <i class="fas fa-envelope"></i>
      </span>
    </div>

    <div class="margin control has-icons-left">
      <input v-model="password" class="input" type="password" placeholder="Password">
      <span class="icon is-small is-left">
        <i class="fas fa-lock"></i>
      </span>
    </div>
    <div class="margin control">
      <button @click="login" class="button is-link  is-outlined is-fullwidth" :class="{'is-loading': loading}">התחבר</button>
    </div>

    <div class="column has-text-centered">
      <a class="" dir="rtl" @click="enterMail = true">
        שכחתי את הסיסמה שלי...  (או שהקישור שלי פג תוקף זה גם תופס)
      </a>
    </div>
    <div v-if="enterMail">
      <div class="margin control has-icons-left">
        <input v-model="forgotEmail" class="input" type="email" placeholder="Email">
        <span class="icon is-small is-left">
          <i class="fas fa-envelope"></i>
        </span>
      </div>
      <div class="margin control">
          <a @click="$emit('forgotEmail', forgotEmail)" class="button is-danger  is-outlined is-fullwidth">אפס סיסמה</a>
        </div>
    </div>
  </div>
</template>

<script>
  import firebase from 'firebase'

  export default {
    name: 'login',
    data() {
      return {
        forgotEmail: "",
        enterMail: false,
        email: '',
        password: '',
        loading: false
      }
    },
    methods: {
      login() {
        this.loading = true;
        firebase.auth().signInWithEmailAndPassword(this.email, this.password)
          .then(
            (user) => {
              this.loading = false
              this.$emit('loggedIn', user);
            },
            (err) => {
              this.loading = false
              Snackbar.show({
                text: 'שם המשתמש או הסיסמה לא נכונים',
                showAction: false,
                backgroundColor: '#dc3035'
              });
            })
      }
    }
  }

</script>

<style lang="css">
  .margin {
    margin-top: 10px;
  }

</style>
