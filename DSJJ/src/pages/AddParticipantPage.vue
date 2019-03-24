<template>
  <div>
    <p class="title is-1">הוספת חניך</p>
    <br>
    <img :src="imgSrc" width="20%" alt="">
    <input type="file" accept="image/*" capture="camera" @change="imageSelected">
    <div class="margin control">
      <input class="input" type="text" placeholder="שם פרטי" v-model="data.firstName">
    </div>
    <div class="margin control">
      <input class="input" type="text" placeholder="שם משפחה" v-model="data.lastName">
    </div>
    <div class="margin control">
      <input dir="rtl" class="input" type="date" v-model="data.birthdate">
    </div>

    <div class="margin control">
      <input class="input" type="email" placeholder="מייל" v-model="data.email">
    </div>

    <div class="margin select is-fullwidth">
      <select disabled>
        <option value="" selected>{{data.dojo}}</option>
      </select>
    </div>
    <div class="margin select is-fullwidth">
      <select disabled>
        <option value="" selected>{{data.instructor}}</option>
      </select>
    </div>
    <div class="margin select is-fullwidth">
      <select v-model="data.rank">
        <option disabled selected>דרגה</option>
        <option v-for="rank in ranks">{{rank.name}}</option>
      </select>
    </div>
    <div class="margin control">
      <a class="button is-link  is-outlined is-fullwidth" :class="{'is-loading': loading}" @click="addParticipant">הוסף
        חניך</a>
    </div>
  </div>
</template>

<script>
  import {
    mapActions,
    mapState
  } from 'vuex'
  import firebase from 'firebase'

  export default {
    name: 'AddParticipantPage',
    components: {},
    data() {
      return {
        loading: false,
        file: null,
        imgSrc: this.getImgUrl(),
        data: {
          firstName: "",
          lastName: "",
          email: "",
          birthdate: "2000-10-14",
          instructor: "", //JSON.parse(sessionStorage.user).name,
          dojo: "", //JSON.parse(sessionStorage.user).dojo,
          rank: "דרגה",
        }
      }
    },
    computed: {
      ...mapState(['ranks']),
      user() {
        return JSON.parse(sessionStorage.user)
      }
    },
    methods: {
      ...mapActions(['authorizePage', 'initRanks']),
      imageSelected(event) {
        this.file = (event.target.files[0])
        this.imgSrc = URL.createObjectURL(this.file);
      },
      getImgUrl() {
        var assets = require.context('../assets/', false, /\.png$/)
        return assets('./profileImage.png')
      },
      addParticipant() {
        if (this.file && this.data.firstName && this.data.lastName && this.data.email && this.data.birthdate &&
          this.data.instructor && this.data.dojo && this.data.rank != 'דרגה') {
          this.loading = true;
          firebase.firestore().collection("participants").add(this.data).then(participantRef => {
            const fileName = participantRef.id
            const name = this.data.firstName + " " + this.data.lastName
            firebase.storage().ref().child("profile_pictures/" + fileName).put(this.file).then((
              snapshot) => {
              console.log(snapshot)
              snapshot.ref.getDownloadURL().then((link)=>{
                participantRef.set({profilePicLink: link}, { merge: true })
              })
              
              firebase.functions().httpsCallable('createCard')({
                id: participantRef.id,
                name: name
              }).then(() => {
                this.loading = false;
                Snackbar.show({
                  text: 'החניך נוסף בהצלחה',
                  showAction: false,
                  backgroundColor: '#2fa04d'
                });
              }).catch((e) => {
                console.log(e)
                Snackbar.show({
                  text: 'התרחשה שגיאה, נסה שנית מאוחר יותר',
                  showAction: false,
                  backgroundColor: '#dc3035'
                });
              })
            });
          })
        } else {
          Snackbar.show({
            text: 'אנא מלא את כל הפרטים',
            showAction: false,
            backgroundColor: '#dc3035'
          });
        }
      }
    },
    created() {
      this.authorizePage().then(() => {
        this.data.instructor = JSON.parse(sessionStorage.user).name
        this.data.dojo = JSON.parse(sessionStorage.user).dojo
      });
      this.initRanks();
    },
  }

</script>

<style lang="css">
  .margin {
    margin-top: 10px;
  }

</style>
