<template>
  <div>
    <p class="title is-1">הוספת חניך</p>
    <br>
    <img :src="url" width="30%" alt="">
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
      <a class="button is-link  is-outlined is-fullwidth" @click="addParticipant">הוסף חניך</a>
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
        url: "/static/img/profileImage.6e63041.png",
        file: null,
        data: {
          firstName: "",
          lastName: "",
          email: "",
          birthdate: "2000-10-14",
          instructor: JSON.parse(sessionStorage.user).name,
          dojo: JSON.parse(sessionStorage.user).dojo,
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
        this.url = URL.createObjectURL(this.file);
      },
      addParticipant() {
        if (this.file && this.data.firstName && this.data.lastName && this.data.email && this.data.birthdate &&
          this.data.instructor && this.data.dojo && this.data.rank != 'דרגה') {
          firebase.firestore().collection("participants").add(this.data).then(participantRef => {
            const fileName = participantRef.id //  
            const name = this.data.firstName + " " +  this.data.lastName
            firebase.storage().ref().child("profile_pictures/" + fileName).put(this.file).then(function (
              snapshot) {
              firebase.functions().httpsCallable('createCard')({
                id: participantRef.id,
                name: name
              }).then(() => {
                alert("Participant Created succefully")
              }).catch((e) => {
                console.log(e)
                alert("error")
              })

            });
          })
        } else {
          console.log("fill everything");

        }

      }
    },
    created() {
      this.authorizePage();
      this.initRanks();
    },

  }

</script>

<style lang="css">
  .margin {
    margin-top: 10px;
  }

</style>
