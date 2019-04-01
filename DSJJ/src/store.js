import Vue from 'vue'
import Vuex from 'vuex'
import firebase from 'firebase'
import router from '@/router'

Vue.use(Vuex)
export default new Vuex.Store({
  state: {
    ranks: [],
    role: ""
  },
  mutations: {
    SET_RANKS(state, ranks) {
      state.ranks = ranks
    },
    SET_ROLE(state, role) {
      state.role = role
    }
  },
  actions: {
    authorizePage({}, cb) {
      if (!firebase.auth().currentUser) {
        router.push("/")
      }
      return;
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
    setRole({commit}, role) {
      commit('SET_ROLE', role)
    },
    initRanks({commit, state }) {
      if (state.ranks.length == 0) {
        firebase.firestore().collection('ranks').orderBy('rank').get().then((ranksRef) => {
          let ranks = ranksRef.docs.map(rank => rank.data());
          commit('SET_RANKS', ranks)
          console.log(ranks)
        });
      }
    },
    showError({}, msg = 'התרחשה שגיאה, אנא נסה מאוחר יותר') {
      Snackbar.show({
        text: msg,
        showAction: false,
        backgroundColor: '#dc3035'
      });
    },
  },
  getters: {
    isInstructor(state) {
      return state.role == 'instructor';
    },
    isSuperInstructor(state) {
      return state.role == 'super-instructor';
    },
    isAdmin(state) {
      console.log("====")
      console.log(state)
      return state.role == 'admin';
    }
  }
})
