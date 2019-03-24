<template>
  <div>
    <p class="title is-1">חניכים</p>
    <br>
    <loading-spinner :class="{'is-hidden': !loading}"></loading-spinner>
    <participant @click="participantClick(participant)" v-for="participant in participants" :rank="participant.rank"
      :name="participant.name" :image="participant.profilePicLink" :dojo="participant.dojo" :instructor="participant.instructor">
    </participant>
    <div v-show="!loading && participants.length == 0">
      <p>
        אין חניכים במערכת לחצו 
        <a href="/#/addparticipant"> כאן כדי להוסיף חניכים</a>
      </p>
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
        participants: [],
        loading: true
      }
    },
    methods: {
      ...mapActions(['authorizePage']),
      participantClick(participant) {
        router.push('/participants/' + participant.id)
      }
    },
    created() {
      this.authorizePage();
      this.db = firebase.firestore();
      this.db.collection("participants").onSnapshot((participantsDocs) => {
        this.participants = participantsDocs.docs.map(p => {
          let participant = p.data()
          participant.name = participant.firstName + " " + participant.lastName
          participant.id = p.id
          return participant
        });

        this.loading = false;
      });
    },
  }

</script>
