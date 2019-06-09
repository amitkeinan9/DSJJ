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
          <div class="control" v-if="isAdmin || isSuperInstructor">
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
    mapActions,
    mapGetters
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
    computed: {
      ...mapGetters(['isAdmin', 'isSuperInstructor', 'isInstructor'])
    },
    methods: {
      ...mapActions(['authorizePage', 'showError']),
      addDojo(data) {
        this.dojoModal = false;
        this.db.collection("dojos").add(data)
          .catch((error) => {
            if (error.code == 'permission-denied') {
              this.showError('אין לך הרשאה לפעולה זו')
            } else {
              this.showError();
            }
          });
      },

      addDojoToInstuctor(data) {
        let dojo = data.dojo;
        let update = {}
        update.dojos = firebase.firestore.FieldValue.arrayUnion(dojo)

        this.db.collection('instructors').doc(data.id).update(update).then(() => {
          Snackbar.show({
            text: 'המאמן נוסף בהצלחה',
            showAction: false,
            backgroundColor: '#2fa04d'
          })
        }).catch((error) => {
          this.type = ""
          this.editing = false
          if (error.code == 'permission-denied') {
            this.showError('אין לך הרשאה לפעולה זו')
          } else {
            this.showError();
          }
        });
      },
      addInstructor(data) {
        let doc = data;
        // doc.dojos = doc.dojos.map(dojo => {
        //   return this.db.doc(dojo)
        // });

        firebase.firestore().collection("instructors").where('email', '==', doc.email).get().then((snapshot) => {
          if (snapshot.empty) {
            firebase.functions().httpsCallable('createUser')({
              fullName: data.firstName + " " + data.lastName,
              email: doc.email,
            }).then((user) => {
              firebase.firestore().collection("instructors").add(data)
                .then((docRef) => {
                  Snackbar.show({
                    text: 'המאמן נוסף בהצלחה',
                    showAction: false,
                    backgroundColor: '#2fa04d'
                  });
                }).catch((error) => {
                  if (error.code == 'permission-denied') {
                    this.showError('אין לך הרשאה לפעולה זו')
                  } else {
                    this.showError();
                  }
                })

            })

          } else
            this.showError('המייל שהוכנס תפוס ');
        })
      },
    },
    created() {
      this.authorizePage({});
      this.db = firebase.firestore();
      this.db.collection("dojos").onSnapshot((dojoDocs) => {
        this.db.collection("instructors").onSnapshot((instDocs) => {
          this.instructors = instDocs.docs.map(i => {
            let inst = i.data();
            inst.id = i.id;
            return inst;
          })
          this.dojos = dojoDocs.docs.map(d => {
            let dojo = d.data();
            dojo.id = d.id;
            dojo.instructors = this.instructors.filter(inst => {
              return inst.dojos.indexOf(dojo.id) != -1
            })
            return dojo;
          });
          this.loading = true;
        });
      });
    },
  }

</script>
