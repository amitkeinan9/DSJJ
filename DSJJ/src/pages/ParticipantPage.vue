<template>
  <div>
    <div class="container">
      <div class="columns is-centered is-mobile">
        <div class="column is-8">
          <p class="title is-1 has-text-centered">{{ participant.name}}</p>
          <br>
          <div class="image-cropper">
            <img :src="participant.profilePicLink" class="rounded" />
          </div>
          <br>
          <nav class="level">
            <div class="level-item has-text-centered">
              <div>
                <p class="heading">חגורה</p>
                <p class="title">{{participant.rank}}</p>
              </div>
            </div>

            <div class="level-item has-text-centered">
              <div>
                <p class="heading">מאמן</p>
                <p class="title">{{participant.instructor}}</p>
              </div>
            </div>
            <div class="level-item has-text-centered">
              <div>
                <p class="heading">מועדון</p>
                <p class="title">{{participant.dojo}}</p>
              </div>
            </div>
          </nav>
          <hr>

          <nav class="level">
            <div class="level-left">
              <div class="level-item">
                <p class="subtitle is-5">
                  <strong>תאריך לידה:</strong>
                </p>
              </div>

            </div>
            <div class="level-right">
              <p class="level-item">{{participant.birthdate}}</p>
            </div>
          </nav>
          <nav class="level">
              <div class="level-left">
                <div class="level-item">
                  <p class="subtitle is-5">
                    <strong> מספר טלפון:</strong>
                  </p>
                </div>
  
              </div>
              <div class="level-right">
                <p class="level-item">{{participant.phoneNumber}}</p>
              </div>
            </nav>
            <nav class="level">
                <div class="level-left">
                  <div class="level-item">
                    <p class="subtitle is-5">
                      <strong> מספר טלפון (הורים):</strong>
                    </p>
                  </div>
    
                </div>
                <div class="level-right">
                  <p class="level-item">{{participant.parentPhoneNumber}}</p>
                </div>
              </nav>
          <nav class="level">
            <div class="level-left">
              <div class="level-item">
                <p class="subtitle is-5">
                  <strong>מייל:</strong>
                </p>
              </div>

            </div>
            <div class="level-right">
              <div class="level-item">
                <div v-if="!viewer">
                  <div class="field has-addons" dir="ltr">

                    <p class="control">
                      <input class="input" type="text" v-model="email">
                    </p>
                    <p class="control">
                      <button class="button" @click="updateEmail">
                        <span class="icon">
                          <i class="fas fa-save"></i>
                        </span>
                      </button>
                    </p>
                  </div>
                </div>
                <div v-else>
                  {{email}}
                </div>
              </div>
            </div>
          </nav>
          <div v-if="!viewer">
            <hr>
            <div class="columns is-mobile">
              <div class="column">
                <button class="is-outlined is-link button is-fullwidth" @click="editDojo">
                  <span v-if="type != 'dojo'">שנה מועדון</span>
                  <span v-else>סגור</span>
                </button>
              </div>
              <div class="column">
                <button class="is-outlined is-link button is-fullwidth" @click="editRank">
                  <span v-if="type != 'rank'">שנה חגורה</span>
                  <span v-else>סגור</span>
                </button>
              </div>
              <div class="column">
                <button class="is-outlined is-link button is-fullwidth" @click="editNote">
                  <span v-if="type != 'note'">הוסף הערה</span>
                  <span v-else>סגור</span>
                </button>
              </div>
            </div>
            <edit-select v-if="type!='note' && editing" :options="options" @approve="saveEvent"></edit-select>
            <div v-if="type=='note' && editing">

              <textarea class="textarea" placeholder="כתוב הערה כאן" v-model="note"></textarea>
              <br>
              <button class="button is-outlined is-link is-fullwidth" @click="saveNote">הוסף</button>
            </div>
          </div>
          <hr>
          <timeline :events="participant.history"></timeline>
        </div>
      </div>
    </div>


  </div>
</template>

<script>
  import {
    mapActions,
    mapState
  } from 'vuex'
  import firebase from 'firebase'
  import editSelect from '@/components/editSelect'
  import moment from 'moment'
  import timeline from '@/components/timeline'
  import router from '@/router'

  export default {
    name: 'ParticipantPage',
    components: {
      'edit-select': editSelect,
      'timeline': timeline
    },
    props: ["participant", "id"],
    data() {
      return {
        email: "",
        note: "",
        db: null,
        editing: false,
        options: [],
        type: "",
        dojos: [],
        viewer: false
      }
    },
    computed: {
      ...mapState(['ranks']),
    },
    methods: {
      ...mapActions(['authorizePage', 'initRanks']),
      editNote() {
        this.editing = !this.editing;
        if (this.editing) {
          this.type = "note"

        } else {
          this.type = ""
        }
      },
      saveNote() {
        
        let event = {
          startDate: moment().toDate().getTime(),
          note: this.note, 
          type: this.type,
          uploadDate: moment().format('YYYY-MM-DD')
        }

        let update = {}
        
        update.history = firebase.firestore.FieldValue.arrayUnion(event)

        this.db.collection('participants').doc(this.id).update(update).then(() => {
          Snackbar.show({
            text: 'המידע עודכן בהצלחה',
            showAction: false,
            backgroundColor: '#2fa04d'
          })
          this.type = ""
          this.editing = false
        }).catch(() => {
          this.type = ""
          this.editing = false
          Snackbar.show({
            text: 'התרחשה שגיאה, נסה שנית מאוחר יותר',
            showAction: false,
            backgroundColor: '#dc3035'
          });
        });
      },
      updateEmail() {
        this.db.collection('participants').doc(this.id).update({
          email: this.email
        }).then(() => {
          Snackbar.show({
            text: 'המייל עודכן בהצלחה',
            showAction: false,
            backgroundColor: '#2fa04d'
          });
        }).catch(() => {
          Snackbar.show({
            text: 'התרחשה שגיאה, נסה שנית מאוחר יותר',
            showAction: false,
            backgroundColor: '#dc3035'
          });
        });
      },
      editRank() {
        this.editing = !this.editing;
        if (this.editing) {
          this.type = "rank"
          this.options = this.ranks.map(r => r.name)
        } else {
          this.type = ""
        }
      },
      editDojo() {
        this.editing = !this.editing;
        if (this.editing) {
          this.type = "dojo"
          this.options = this.dojos
        } else {
          this.type = ""
        }
      },
      saveEvent(data) {
        let event = {
          startDate: moment(data.date).toDate().getTime(),
          to: data.selected,
          type: this.type,
          uploadDate: moment().format('YYYY-MM-DD')
        }

        let update = {}
        if (this.type == "rank") {
          update.rank = data.selected
          event.from = this.participant.rank
        } else {
          const splitted = data.selected.split(" - ")
          update.dojo = splitted[0]
          update.instructor = splitted.slice(1).join(" - ")
          event.from = this.participant.dojo + " - " + this.participant.instructor
        }

        update.history = firebase.firestore.FieldValue.arrayUnion(event)

        this.db.collection('participants').doc(this.id).update(update).then(() => {
          Snackbar.show({
            text: 'המידע עודכן בהצלחה',
            showAction: false,
            backgroundColor: '#2fa04d'
          })
          this.type = ""
          this.editing = false
        }).catch(() => {
          this.type = ""
          this.editing = false
          Snackbar.show({
            text: 'התרחשה שגיאה, נסה שנית מאוחר יותר',
            showAction: false,
            backgroundColor: '#dc3035'
          });
        });
      }
    },
    created() {
      this.authorizePage(() => {
        this.viewer = true
      })
      // console.log("====" + !this.authorizePage(true))

      this.db = firebase.firestore();
      if (this.participant)
        this.email = this.participant.email

      this.db.collection('participants').doc(this.id).onSnapshot(partRef => {
        if (!partRef.exists) {
          router.push("/noparticipant")
        } else {
          this.participant = partRef.data()
          this.email = this.participant.email
          this.participant.name = this.participant.firstName + " " + this.participant.lastName
        }
      });
      this.initRanks();
      this.db.collection("dojos").onSnapshot((dojoDocs) => {
        this.db.collection("instructors").onSnapshot((instDocs) => {
          const instructors = _.groupBy(instDocs.docs.map(i => i.data()), 'dojo.id')
          this.dojos = _.flatten(dojoDocs.docs.map(d => {
            let name = d.data().name;
            console.log(instructors[d.id][0])
            return instructors[d.id].map(i => name + " - " + i.firstName + " " + i.lastName)
          }));
          this.loading = true;
        });
      });
    }
  }

</script>

<style scoped>
  .image-cropper {
    width: 100px;
    height: 100px;
    position: relative;
    overflow: hidden;
    border-radius: 50%;
    margin: auto;
  }

  img {
    display: inline;
    margin: 0 auto;
  }

</style>
