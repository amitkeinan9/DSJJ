<template>
  <div>
    <div class="container">
      <div class="columns is-centered is-mobile">
        <div class="column is-8">
          <p class="title is-1">הוספת חניך</p>
          <br>
          <img id="img" width="20%" :src="imgSrc" alt="">
          <input type="file" accept="image/*" @change="imageSelected">
          <br><br>
          <article class="message is-warning" dir="rtl">
            <div class="message-body">
              שים לב! במידה והחניך מתחת לגיל 18, מספר הטלפון של ההורים הוא חובה והשני הוא רשות. כאשר החניך מעל גיל 18 יש להכניס לפחות מספר טלפון אחד.
            </div>
          </article>
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
          <div class="margin control">
            <input class="input" type="text" placeholder="מספר טלפון של ההורים" v-model="data.parentPhoneNumber">
          </div>
          <div class="margin control">
            <input class="input" type="text" placeholder="מספר טלפון" v-model="data.phoneNumber">
          </div>

          <div class="margin select is-fullwidth">
            <select v-model="data.dojo">
              <option disabled selected>מועדון</option>
              <option v-for="dojo in dojos" :value="dojo.id">{{dojo.name}}</option>
            </select>
          </div>
          <div class="margin select is-fullwidth">
            <select :disabled='isInstructor' v-model="data.instructor">
              <option v-for="currInstructor in instructors" :value="currInstructor.id">{{currInstructor.name}}</option>
            </select>
          </div>
          <div class="margin select is-fullwidth">
            <select v-model="data.rank">
              <option disabled selected>דרגה</option>
              <option v-for="rank in ranks" :value="rank.id">{{rank.name}}</option>
            </select>
          </div>
          <div class="margin control">
            <a class="button is-link  is-outlined is-fullwidth" :class="{'is-loading': loading}"
              @click="addParticipant">הוסף
              חניך</a>
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
  import steps from '@/components/steps'
  import moment from 'moment'
  export default {
    name: 'AddParticipantPage',
    components: {
      'steps': steps
    },
    data() {
      return {
        loading: false,
        file: null,
        imgSrc: this.getImgUrl(),
        instructor: {},
        instructors: [],
        data: {
          history: [],
          firstName: "",
          lastName: "",
          email: "",
          birthdate: "2000-10-14",
          instructor: "",
          dojo: "מועדון",
          rank: "דרגה",
          parentPhoneNumber: "",
          phoneNumber: ""
        }
      }
    },
    computed: {
      ...mapState(['ranks']),
      ...mapGetters(['isAdmin', 'isInstructor', 'isSuperInstructor']),
      user() {
        return JSON.parse(sessionStorage.user)
      },
      dojos() {
        if (this.data.instructor == this.instructor.id)
          return this.instructor.dojos
        else if (this.instructors.length > 0)
          return this.instructors.filter(i => {
            return i.id == this.data.instructor
          })[0].dojos
        else
          return []
      }
    },
    methods: {
      ...mapActions(['authorizePage', 'showError', 'rankToCardIndex']),
      above18(){
        return moment().diff(moment(this.data.birthdate), 'years') >= 18; 
      },
      phoneNumberValid(data){
        return (this.above18() && (data.phoneNumber || data.parentPhoneNumber)) || (!this.above18() && (data.parentPhoneNumber));
      },
      imageSelected(event) {
        loadImage(
          event.target.files[0],
          (img) => {
            this.imgSrc = img.toDataURL();
            fetch(this.imgSrc)
              .then(res => res.blob())
              .then(blob => {
                this.file = blob
              });
          }, {
            maxWidth: 100,
            orientation: 1,
            noRevoke: true,
            
          } // Options
        );
      },
      getImgUrl() {
        var assets = require.context('../assets/', false, /\.png$/)
        return assets('./profileImage.png')
      },
      initFields() {
        this.file = null
        this.imgSrc = this.getImgUrl()
        this.data = {

          history: [],
          firstName: "",
          lastName: "",
          email: "",
          birthdate: "2000-10-14",
          instructor: this.instructor.id,
          dojo: "מועדון",
          rank: "דרגה",
          parentPhoneNumber: "",
          phoneNumber: ""
        }
      },
      addParticipant() {
        if (this.file && this.phoneNumberValid(this.data) && this.data.firstName && this.data
          .lastName && this.data.email && this.data.birthdate &&
          this.data.instructor && this.data.dojo != 'מועדון' && this.data.rank != 'דרגה') {
          if (!this.data.phoneNumber) {
            this.data.phoneNumber = "לא הוכנס"
          }
          if (!this.data.parentPhoneNumber) {
            this.data.parentPhoneNumber = "לא הוכנס"
          }
          this.loading = true;
          firebase.firestore().collection("participants").add(this.data).then(participantRef => {
            const fileName = participantRef.id
            const name = this.data.firstName + " " + this.data.lastName
            firebase.storage().ref().child("profile_pictures/" + fileName).put(this.file, {"autoOrient": true}).then((
              snapshot) => {
              snapshot.ref.getDownloadURL().then((link) => {
                participantRef.set({
                  profilePicLink: link
                }, {
                  merge: true
                })
              }).then(() => {
                this.loading = false;
                Snackbar.show({
                  text: 'החניך נוסף בהצלחה',
                  showAction: false,
                  backgroundColor: '#2fa04d'
                });
                


                let rank = this.ranks.find((rank => rank.id == this.data.rank))
                let inst = this.instructors.find((i => i.id == this.data.instructor))
                console.log(rank.rank)
                let dojo = inst.dojos.find(d => d.id == this.data.dojo)
      
                if(rank.rank > 0) {
                  firebase.functions().httpsCallable('createCard')({
                    id: participantRef.id,
                    name: name,
                    rank: rank,
                    dojo: dojo.name,
                    instructor: inst.name
                  })
                }
                this.initFields()
              }).catch((e) => {
                console.log(e)
                this.showError();
                // this.initFields()
              })
            });
          }).catch((error) => {
            console.log(error)
            this.loading = false;
            if (error.code == 'permission-denied') {
              this.showError('אין לך הרשאה לפעולה זו')
            } else {
              this.showError();
            }
          })
        } else {
          this.showError('אנא מלא את כל הפרטים');
        }
      }
    },
    created() {
      this.authorizePage({}).then(() => {
        this.instructor = JSON.parse(sessionStorage.user);
        this.data.instructor = this.instructor.id
        this.instructors = [this.instructor]

        if (!this.isInstructor) {
          firebase.firestore().collection('instructors').get().then(instRef => {
            this.instructors = instRef.docs.map(i => {
              let inst = {};
              let data = i.data();
              inst.name = data.firstName + " " + data.lastName;
              inst.id = i.id;
              Promise.all(data.dojos.map(id => firebase.firestore().collection('dojos').doc(id)
                .get())).then((res) => {
                inst.dojos = res.map(r => {
                  return {
                    name: r.data().name,
                    id: r.id
                  }
                });
              });
              return inst
            })
          })
        }
      });
    },
  }

</script>

<style lang="css" scoped>
  .margin {
    margin-top: 10px;
  }

  #img {
    image-orientation: from-image;
  }

</style>
