import Vue from 'vue'
import Vuex from 'vuex'
import firebase from 'firebase'
import router from '@/router'

Vue.use(Vuex)
export default new Vuex.Store({
  state: {
    ranks: [],
    role: "viewer",
    auth: false
  },
  mutations: {
    SET_RANKS(state, ranks) {
      state.ranks = ranks
    },
    SET_ROLE(state, role) {
      state.role = role
    },
    SET_AUTH(state, auth) {
      state.auth = auth;
    }
  },
  actions: {
    authorizePage({}, redirect = true) {
      if (!sessionStorage.getItem("user") && redirect) 
        router.push("/")

    },
    initStore({
      commit
    }) {
      commit('SET_RANKS', []);
      commit('SET_ROLE', "");
    },
    setRole({
      commit
    }, role) {
      commit('SET_ROLE', role)
    },
    initRanks({
      commit,
      state
    }) {
      if (state.ranks.length == 0) {
        let max = ["super-instructor", 'admin'].indexOf(state.role) == -1 ? 6 : 17

        firebase.firestore().collection('ranks').where('rank', '<=', max).orderBy('rank').get().then((ranksRef) => {
          let ranks = ranksRef.docs.map(rank => {
            let r = rank.data();
            r.id = rank.id;
            return r;
          });
          commit('SET_RANKS', ranks)
          console.log(ranks)
        });
      }
    },
    setAuthorized({
      commit
    }, auth) {
      commit('SET_AUTH', auth)
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
      return state.role == 'admin';
    },
    isViewer(state) {
      return state.role == 'viewer';
    }
  }
})
