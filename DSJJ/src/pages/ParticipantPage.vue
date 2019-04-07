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
                <p class="title">{{participant.rank.name}}</p>
              </div>
            </div>

            <div class="level-item has-text-centered">
              <div>
                <p class="heading">מאמן</p>
                <p class="title">{{participant.instructor.firstName}} {{participant.instructor.lastName}}</p>
              </div>
            </div>
            <div class="level-item has-text-centered">
              <div>
                <p class="heading">מועדון</p>
                <p class="title">{{participant.dojo.name}}</p>
              </div>
            </div>
          </nav>
          <hr>
          <edit-value :canEdit="false" title="birthdate" displayName="תאריך לידה" :value="participant.birthdate" :id="id"></edit-value>
          <br>
          <edit-value :canEdit="canEdit" title="phoneNumber" displayName="מספר טלפון" :value="participant.phoneNumber" :id="id"></edit-value>
          <br>
          <edit-value :canEdit="canEdit" title="parentPhoneNumber" displayName="מספר טלפון (הורים)" :value="participant.parentPhoneNumber" :id="id"></edit-value>
          <br>
          <edit-value :canEdit="canEdit" title="email" displayName="מייל" :value="email" :id="id"></edit-value>
          <div v-if="canEdit">
            <hr>
            <div class="columns is-mobile is-multiline is-centered">
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
            <edit-select v-if="type!='note' && editing" :title="title" :options="options" @approve="saveEvent"></edit-select>
            <div v-show="type=='note' && editing">

              <textarea ref="note" class="textarea" placeholder="כתוב הערה כאן" v-model="note"></textarea>
              <br>
              <button class="button is-outlined is-link is-fullwidth" @click="saveNote">הוסף</button>
            </div>
          </div>
          <hr>
          <timeline :events="participant.history"></timeline>
          <div v-if="isAdmin">
            <hr>
            <button class="is-outlined is-danger button is-fullwidth" @click="deleteParticipant">
              מחק חניך
            </button>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script>
  import {
    mapActions,
    mapState,
    mapGetters
  } from 'vuex'
  import firebase from 'firebase'
  import editSelect from '@/components/editSelect'
  import moment from 'moment'
  import timeline from '@/components/timeline'
  import router from '@/router'
  import editValue from '@/components/editValueComponent'

  export default {
    name: 'ParticipantPage',
    components: {
      'edit-select': editSelect,
      'timeline': timeline,
      'edit-value': editValue
    },
    props: ["participantprop", "id"],
    data() {
      return {
        participant: undefined,
        email: "",
        note: "",
        db: null,
        editing: false,
        options: [],
        title: "",
        type: "",
        dojos: []
      }
    },
    computed: {
      ...mapState(['ranks']),
      ...mapGetters(['isAdmin', 'isInstructor', 'isSuperInstructor', 'isViewer']),
      canEdit() {
        return this.isAdmin || this.isSuperInstructor || (this.isInstructor && this.participant.rank.rank < 7);
      }
    },
    methods: {
      ...mapActions(['authorizePage', 'showError']),
      editNote() {
        this.editing = !this.editing;
        if (this.editing) {
          this.type = "note"
          console.log(this.$refs.note);
          this.$refs.note.focus();
        } else {
          this.type = ""
        }

        if(this.editing && this.type == "note") {
          console.log(this.$refs);
          this.$refs.note.focus();
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
          this.showError()
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
        }).catch((error) => {
          if (error.code == 'permission-denied') {
            this.showError('אין לך הרשאה לפעולה זו')
          } else {
            this.showError();
          }
        })
      },
      deleteParticipant() {
        this.db.collection("participants").doc(this.id).delete().then(function () {
          router.push('/participants')
          Snackbar.show({
            text: 'החניך נמחק בהצלחה',
            showAction: false,
            backgroundColor: '#2fa04d'
          });
          
        }).catch(function (error) {
          if (error.code == 'permission-denied') {
            this.showError('אין לך הרשאה לפעולה זו')
          } else {
            this.showError();
          }
        });
      },
      editRank() {
        this.editing = !this.editing;
        if (this.editing) {
          this.title = "לדרגה החדשה"
          this.type = "rank"
          this.options = this.ranks
        } else {
          this.type = ""
        }
      },
      editDojo() {
        this.editing = !this.editing;
        if (this.editing) {
          this.title = "למועדון החדש"
          this.type = "dojo"
          this.options = this.dojos
        } else {
          this.type = ""
        }
      },
      saveEvent(data) {
        let event = {
          startDate: moment(data.date).toDate().getTime(),
          to: data.selected.name,
          type: this.type,
          uploadDate: moment().format('YYYY-MM-DD')
        }

        let update = {}
        if (this.type == "rank") {
          update.rank = data.selected.id
          event.from = this.participant.rank.name
        } else {
          const splitted = data.selected.id.split(" ")
          update.dojo = splitted[0]
          update.instructor = splitted[1]
          event.from = this.participant.dojo.name + " - " + this.participant.instructor.firstName + " " + this
            .participant.instructor.lastName
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
        }).catch((error) => {
          this.type = ""
          this.editing = false
          if (error.code == 'permission-denied') {
            this.showError('אין לך הרשאה לפעולה זו')
          } else {
            this.showError();
          }
        })
      }
    },
    created() {
      this.authorizePage(false);

      this.participant = this.participantprop

      this.db = firebase.firestore();
      if (this.participant)
        this.email = this.participant.email

      this.db.collection('participants').doc(this.id).onSnapshot(partRef => {
        if (!partRef.exists) {
          router.push("/noparticipant")
        } else {
          this.participant = partRef.data()
          this.db.collection("dojos").doc(this.participant.dojo).get().then((dojo) => this.participant.dojo = dojo
            .data());
          this.db.collection("ranks").doc(this.participant.rank).get().then((rank) => this.participant.rank = rank
            .data());
          this.db.collection("instructors").doc(this.participant.instructor).get().then((instructor) => this
            .participant.instructor = instructor.data());

          this.email = this.participant.email
          this.participant.name = this.participant.firstName + " " + this.participant.lastName
        }
      });

      this.db.collection("dojos").onSnapshot((dojoDocs) => {
        this.db.collection("instructors").onSnapshot((instDocs) => {
          const instructors = instDocs.docs.map(i => {
            let inst = i.data();
            inst.id = i.id;
            return inst;
          })
          this.dojos = _.flatten(dojoDocs.docs.map(d => {
            let dojo = d.data();
            dojo.id = d.id;
            dojo.instructors = instructors.filter(inst => {
              return inst.dojos.indexOf(dojo.id) != -1
            })

            return dojo.instructors.map(i => {
              return {
                name: dojo.name + " - " + i.firstName + " " + i.lastName,
                id: dojo.id + " " + i.id
              }
            });;
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
