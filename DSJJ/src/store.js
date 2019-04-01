import Vue from 'vue'
import Vuex from 'vuex'
import firebase from 'firebase'
import router from '@/router'

Vue.use(Vuex)
export default new Vuex.Store({
  state: {
    ranks: []
  },
  mutations: {
    SET_RANKS(state, ranks) {
      state.ranks = ranks
    }
  },
  actions: {
    authorizePage({}, cb) {
      firebase.auth().onAuthStateChanged((user) => {
        console.log(user)
        if (!user){
          if(cb)
            cb()
          else
            router.push("/")
        } else {
          return true
        }
      });
    },
    initRanks({commit, state }) {
      if (state.ranks.length == 0) {
        firebase.firestore().collection('ranks').orderBy('rank').get().then((ranksRef) => {
          let ranks = ranksRef.docs.map(rank => rank.data());
          commit('SET_RANKS', ranks)
          console.log(ranks)
        });
      }
    }
  }
})
