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
    authorizePage() {
      firebase.auth().onAuthStateChanged(function (user) {
        if (!user)
          router.push("/")
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
