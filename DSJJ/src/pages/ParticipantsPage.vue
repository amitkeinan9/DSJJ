<template>
  <div>
    <div class="container">
      <div class="columns is-centered is-mobile">
        <div class="column is-8">
          <p class="title is-1">חניכים</p>
          <br>
          <loading-spinner v-show="loading"></loading-spinner>

          <div v-if="participants && participants.length == 0">
            <p>
              אין חניכים במערכת לחצו
              <a href="/#/addparticipant"> כאן כדי להוסיף חניכים</a>
            </p>
          </div>
          <div v-else>
              <div class="field">
                  <p class="control has-icons-left has-icons-right">
                    <input class="input" type="email" placeholder="חפש" v-model="search">
                    <span class="icon is-small is-left">
                      <i class="fas fa-search"></i>
                    </span>
                  </p>
                </div>
            <br>
            <participant @click="participantClick(participant)" v-for="participant in filteredParticipants"
              :rank="participant.rank" :name="participant.name" :image="participant.profilePicLink"
              :dojo="participant.dojo" :instructor="participant.instructor">
            </participant>

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
  import participant from '@/components/participant'
  import loadingSpinner from '@/components/loadingSpinner'

  import router from '@/router'
  import firebase from 'firebase'

  export default {
    name: 'ParticipantsPage',
    components: {
      'participant': participant,
      'loading-spinner': loadingSpinner
    },
    data() {
      return {
        db: null,
        participants: null,
        loading: true,
        search: ""
      }
    },
    computed: {
      filteredParticipants() {
        return this.participants.filter(p => p.name.includes(this.search) || p.dojo.includes(this.search) || p.instructor.includes(this.search) || p.rank.includes(this.search))
      }
    },
    methods: {
      ...mapActions(['authorizePage']),
      participantClick(participant) {
        router.push({name: 'ParticipantPage', params: {participant: participant, id: participant.id}})
      }
    },
    created() {
      this.authorizePage();
      this.db = firebase.firestore();
      this.db.collection("participants").onSnapshot((participantsDocs) => {
        this.participants = participantsDocs.docs.map(p => {
          let participant = p.data()
          this.db.collection("dojos").doc(participant.dojo).get().then((dojo) => participant.dojo = dojo.data());
          this.db.collection("ranks").doc(participant.rank).get().then((rank) => participant.rank = rank.data());
          this.db.collection("instructors").doc(participant.instructor).get().then((instructor) => participant.instructor = instructor.data());

          participant.name = participant.firstName + " " + participant.lastName
          participant.id = p.id
          console.log(participant)
          return participant
        });

        this.loading = false;
      });
    },
  }

</script>
