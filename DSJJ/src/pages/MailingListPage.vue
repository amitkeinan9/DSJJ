<template>
  <div>
    <div class="container">
      <div class="columns is-centered is-mobile">
        <div class="column is-8">
          <p class="title is-1">רשימת תפוצה</p>
          <br>

          <article class="message is-warning" dir="rtl">
            <div class="message-body">
              שים לב! כאשר בוחרים את האופציה הראשונה, (כל המועדונים לדוגמה), נבחרות כל האופציות ברשימה. לא כל האופציות
              במערכת.
            </div>
          </article>

          <div class="margin select is-fullwidth">
            <select v-model="data.dojo">
              <option selected value="all">כל המועדונים</option>
              <option v-for="dojo in dojos" :value="dojo.id">{{dojo.name}}</option>
            </select>
          </div>
          <div class="margin select is-fullwidth">
            <select :disabled='isInstructor' v-model="data.instructor">
              <option selected value="all"> כל המאמנים</option>
              <option v-for="currInstructor in instructors" :value="currInstructor.id">{{currInstructor.name}}</option>
            </select>
          </div>
          <div class="margin select is-fullwidth">
            <select v-model="data.rank">
              <option selected value="all">כל הדרגות</option>
              <option v-for="rank in fullRanks" :value="rank.id">{{rank.name}}</option>
            </select>
          </div>
          <div class="columns is-fullwidth is-centered">
            <div class="column">
              <div class="  margin is-fullwidth">
                <input type="number" class="input" min=0 placeholder="מגיל" v-model="data.minAge">
              </div>
            </div>

            <div class="column">
              <div class="  margin is-fullwidth">
                <input type="number" class="input" :min="data.minAge" placeholder="עד גיל" v-model="data.maxAge">
              </div>
            </div>
          </div>
          <div class="  margin is-fullwidth">
            <input type="text" class="input" placeholder="נושא" v-model="email.subject">
          </div>
          <div class="  margin is-fullwidth">
            <textarea class="textarea" placeholder="תוכן" v-model="email.body"></textarea>
          </div>
          <div class="margin control">
            <a class="button is-link  is-outlined is-fullwidth" :class="{'is-loading': loading}" @click="sendMail">
              שלח מייל
            </a>
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
  import _ from 'lodash'
  import firebase from 'firebase'
  import steps from '@/components/steps'
  import moment from 'moment'
  export default {
    name: 'MailingListPage',
    components: {
      'steps': steps
    },
    data() {
      return {
        instructor: {},
        instructors: [],
        dojos: [],
        loading: false,
        data: {
          instructor: "all",
          dojo: "all",
          rank: "all",
        },
        email: {
        }
      }
    },
    computed: {
      ...mapState(['fullRanks']),
      ...mapGetters(['isAdmin', 'isInstructor', 'isSuperInstructor']),
      user() {
        return JSON.parse(sessionStorage.user)
      },
    },
    methods: {
      ...mapActions(['authorizePage', 'showError', 'rankToCardIndex']),
      initFields() {
        this.data = {
          instructor: "all",
          dojo: "all",
          rank: "all",
          minAge: 0,
          maxAge: 0
        }
      },
      sendMail() {
        if (this.email.subject && this.email.body) {
          let filters = {}
          if (this.data.dojo != "all")
            filters.dojo = this.data.dojo

          if (this.data.instructor != "all")
            filters.instructor = this.data.instructor
          else if(this.isInstructor)
            filters.instructor = this.instructor.id

          if (this.data.rank != "all")
            filters.rank = this.data.rank

          if (this.data.minAge)
            filters.minAge = moment().subtract(this.data.minAge, 'years').format("YYYY-MM-DD");

          if (this.data.maxAge)
            filters.maxAge = moment().subtract(this.data.maxAge, 'years').format("YYYY-MM-DD");

          console.log(filters)

          this.email.from = this.instructor.name

          firebase.functions().httpsCallable('sendEmail')({
            filters: filters,
            email: this.email,
          }).then((result) => {
            console.log(result)
            
              Snackbar.show({
                  text: 'ההודעה נשלחה בהצלחה',
                  showAction: false,
                  backgroundColor: '#2fa04d'
                });

            
          }).catch(() => {
            this.showError("קרתה תקלה, נסה שוב מאוחר יותר")
          })

        } else {
          this.showError("חובה למלא את הנושא ואת גוף ההודעה")
        }
      }
    },
    created() {
      this.authorizePage({}).then(() => {
        this.instructor = JSON.parse(sessionStorage.user);
        //this.data.instructor = this.instructor.id
        this.instructors = [this.instructor]
        this.dojos = this.instructor.dojos

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
                inst.dojos.forEach(dojo => {
                  if (!this.dojos.find(d => d.id == dojo.id)) {
                    this.dojos.push(dojo)
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

</style>
