<template>
  <div>
    <nav class="level">
      <div class="level-left">
        <div class="level-item">
          <p class="subtitle is-5">
            <strong>{{displayName}}:</strong>
          </p>
        </div>

      </div>
      <div class="level-right">
        <div class="level-item">
          <div v-if="canEdit">
            <div class="field has-addons" dir="ltr">

              <p class="control">
                <input class="input" type="text" v-model="localValue">
              </p>
              <p class="control">
                <button class="button" @click="updateValue">
                  <span class="icon">
                    <i class="fas fa-save"></i>
                  </span>
                </button>
              </p>
            </div>
          </div>
          <div v-else>
            {{localValue}}
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
  import {
    mapActions
  } from 'vuex'
  import firebase from 'firebase'
  export default {
    name: 'edit',
    props: ['title', 'canEdit', 'value', 'displayName', 'id'],
    data() {
      return {
        localValue: ""
      }
    },
    created() {
      this.localValue = this.value
    },
    methods: {
      ...mapActions(['showError']),
      updateValue() {
        let obj = {};
        obj[this.title] = this.localValue;
        firebase.firestore().collection('participants').doc(this.id).update(obj).then(() => {
          Snackbar.show({
            text: this.displayName + ' עודכן בהצלחה',
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
    }
  }

</script>

<style>
  .nav {
    margin: 0;
  }

</style>
