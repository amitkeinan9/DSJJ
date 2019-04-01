<template>
  <div id="settingsPage">
    <add-modal @approve="addDojo" @close="dojoModal = false" title="מועדון"
      :fields='[{name: "name", displayName: "שם מועדון"}]' :class="{'is-active': dojoModal}"></add-modal>

    <div class="container">
      <div class="columns is-centered is-mobile">
        <div class="column is-8">
          <p class="title is-1">מועדונים</p>
          <br>
          <loading-spinner :class="{'is-hidden': loading}"></loading-spinner>
          <dojo v-for="dojo in dojos" :dojo="dojo" @addDojoToInstructor="addDojoToInstuctor"
            @addInstructor="addInstructor" :instructors="instructors"></dojo>
          <div class="control">
            <a @click="dojoModal=true" class="button is-link is-outlined is-fullwidth"
              :class="{'is-hidden': !loading}">הוסף
              מועדון</a>
          </div>

        </div>
      </div>
    </div>
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
        dojoModal: false,
        instructors: []
      }
    },
    methods: {
      ...mapActions(['authorizePage']),
      addDojo(data) {
        this.dojoModal = false;
        this.db.collection("dojos").add(data)
          .catch(function (error) {
            Snackbar.show({
              text: 'התרחשה שגיאה, נסה שנית מאוחר יותר',
              showAction: false,
              backgroundColor: '#dc3035'
            });
          });
      },
      generatePassword() {
        return Math.random().toString(36).slice(-8);
      },
      addDojoToInstuctor(data) {
        let dojo = this.db.doc(data.dojo);
        let update = {}
        update.dojos = firebase.firestore.FieldValue.arrayUnion(dojo)

        // this.db.collection('instructors').where('email', '==', data.email)
        this.db.collection('instructors').where('email', '==', data.email).get().then(res => {
          console.log(res)
          res.docs[0].ref().update(update).then(() => {
            Snackbar.show({
              text: 'המאמן נוסף בהצלחה',
              showAction: false,
              backgroundColor: '#2fa04d'
            })
          }).catch(() => {
            this.type = ""
            this.editing = false
            Snackbar.show({
              text: 'התרחשה שגיאה, נסה שנית מאוחר יותר',
              showAction: false,
              backgroundColor: '#dc3035'
            });
          });

        })
      },
      addInstructor(data) {
        let doc = data;
        doc.dojos = doc.dojos.map(dojo => {
          return this.db.doc(dojo)
        });

        firebase.auth().createUserWithEmailAndPassword(doc.email, this.generatePassword())
          .then((userRef) => {
            userRef.user.updateProfile({
              displayName: doc.firstName + " " + doc.lastName,
            }).then(function () {
              firebase.auth().sendPasswordResetEmail(doc.email).then(function () {
                firebase.firestore().collection("instructors").add(data)
                  .then((docRef) => {
                    Snackbar.show({
                      text: 'המשתמש נוסף בהצלחה',
                      showAction: false,
                      backgroundColor: '#2fa04d'
                    });
                  })
                  .catch(function (error) {
                    Snackbar.show({
                      text: 'התרחשה שגיאה, נסה שנית מאוחר יותר',
                      showAction: false,
                      backgroundColor: '#dc3035'
                    });
                    // TODO: Make a good notification
                  });
              }).catch(function (error) {
                Snackbar.show({
                  text: 'התרחשה שגיאה, נסה שנית מאוחר יותר',
                  showAction: false,
                  backgroundColor: '#dc3035'
                });
              });
            }).catch(function (error) {
              Snackbar.show({
                text: 'התרחשה שגיאה, נסה שנית מאוחר יותר',
                showAction: false,
                backgroundColor: '#dc3035'
              });
            });
          })
          .catch(function (error) {
            if (error.code == "auth/invalid-email") {
              Snackbar.show({
                text: 'המייל שהוכנס לא תקין',
                showAction: false,
                backgroundColor: '#dc3035'
              });
            } else {
              Snackbar.show({
                text: 'התרחשה שגיאה, נסה שנית מאוחר יותר',
                showAction: false,
                backgroundColor: '#dc3035'
              });
            }

          });



      }
    },
    created() {
      this.authorizePage();
      this.db = firebase.firestore();
      this.db.collection("dojos").onSnapshot((dojoDocs) => {
        this.db.collection("instructors").onSnapshot((instDocs) => {
          this.instructors = instDocs.docs.map(i => i.data())
          this.dojos = dojoDocs.docs.map(d => {
            let dojo = d.data();
            dojo.id = d.id;
            dojo.instructors = this.instructors.filter(inst => {
              return inst.dojos.map(instDojo => instDojo.id).indexOf(dojo.id) != -1
            })
            return dojo;
          });
          this.loading = true;
        });
      });
    },
  }

</script>
