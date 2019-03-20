<template>
  <div id="settingsPage">
    <p class="title is-1">מועדונים</p>
    <br>
    <loading-spinner :class="{'is-hidden': loading}"></loading-spinner>
    <dojo v-for="dojo in dojos" :dojo="dojo" @addInstructor="addInstructor"></dojo>
    <div class="control">
      <a @click="dojoModal=true" class="button is-link is-outlined is-fullwidth" :class="{'is-hidden': !loading}">הוסף
        מועדון</a>
    </div>
    <add-modal @approve="addDojo" @close="dojoModal = false" title="מועדון" :fields='[{name: "name", displayName: "שם מועדון"}]'
      :class="{'is-active': dojoModal}"></add-modal>

  </div>
</template>

<script>
  import {
    mapActions
  } from 'vuex'
  import Dojo from '@/components/dojo'
  import Spinner from '@/components/loadingSpinner'
  import AddModal from '@/components/addModal'

  import firebase from 'firebase'
  import _ from 'lodash'

  export default {
    name: 'SettingsPage',
    components: {
      'dojo': Dojo,
      'loading-spinner': Spinner,
      'add-modal': AddModal,
    },
    data() {
      return {
        db: null,
        dojos: [],
        loading: false,
        dojoModal: false
      }
    },
    methods: {
      ...mapActions(['authorizePage']),
      addDojo(data) {
        this.dojoModal = false;
        this.db.collection("dojos").add(data)
          .catch(function (error) {
            alert("An error occurred")
            // TODO: Make a good notification
          });
      },
      generatePassword() {
        return Math.random().toString(36).slice(-8);
      },
      addInstructor(data) {
        let doc = data;
        doc.dojo = this.db.doc(data.dojo);

        firebase.auth().createUserWithEmailAndPassword(doc.email, this.generatePassword())
          .then((userRef) => {
            userRef.user.updateProfile({
              displayName: doc.firstName + " " + doc.lastName,
            }).then(function () {
              firebase.auth().sendPasswordResetEmail(doc.email).then(function () {
                firebase.firestore().collection("instructors").add(data)
                  .then((docRef) => {
                    alert("המשתמש נוצר")
                  })
                  .catch(function (error) {
                    alert("An error occurred")
                    // TODO: Make a good notification
                  });
              }).catch(function (error) {
                console.log(error)
              });
            }).catch(function (error) {
              console.log(error)
            });
          })
          .catch(function (error) {
            console.log(error)
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
          });



      }
    },
    created() {
      this.authorizePage();
      this.db = firebase.firestore();
      this.db.collection("dojos").onSnapshot((dojoDocs) => {
        this.db.collection("instructors").onSnapshot((instDocs) => {
          const instructors = _.groupBy(instDocs.docs.map(i => i.data()), 'dojo.id')
          this.dojos = dojoDocs.docs.map(d => {
            let dojo = d.data();
            dojo.id = d.id;
            dojo.instructors = instructors[d.id]
            return dojo;
          });
          this.loading = true;
        });
      });
    },
  }

</script>
