<template>
  <div>
    <div class="is-pulled-left control" v-if="isAdmin || isSuperInstructor">
      <a class="button is-link is-outlined " @click="instructorModal = true">הוסף מאמן חדש</a>
      <a class="button is-link is-outlined " @click="selectModal = true">הוסף מאמן קיים</a>

    </div>

    <h1 class="is-4 title">{{ dojo.name }}</h1>

    <br v-show="dojo.instructors">
    <p class="subtitle is-6" v-for="instructor in dojo.instructors">
      {{instructor.firstName}} {{instructor.lastName}}
    </p>
    <hr>
    <select-modal @approve="addSelect" v-if="selectModal"  @close="selectModal = false" :instructors="instructors"></select-modal>
    <add-modal @approve="addInstructor" @close="instructorModal = false" title="מאמן" :fields='modalFields' :class="{'is-active': instructorModal}"></add-modal>
  </div>
</template>

<script>
  import AddModal from '@/components/addModal'
  import {mapGetters} from 'vuex'
  import selectModal from '@/components/selectModal'

  export default {
    name: 'dojo',
    props: ['dojo', 'instructors'],
    components: {
      'add-modal': AddModal,
      'select-modal': selectModal
    },
    data() {
      return {
        instructorModal: false,
        selectModal: false,
        modalFields: [{
            name: "firstName",
            displayName: "שם פרטי"
          },
          {
            name: "lastName",
            displayName: "שם משפחה"
          },
          {
            name: "email",
            displayName: "מייל"
          }
        ]
      }
    },
    computed: {
      ...mapGetters(['isAdmin', 'isSuperInstructor'])
    },
    methods: {
      addInstructor(data) {
        console.log(this.dojo)
        this.instructorModal = false;
        data['dojos'] = [this.dojo.id]
        this.$emit('addInstructor', data)
      },
      addSelect(selected) {
        let data = {id: selected}
        this.selectModal = false;
        data.dojo = this.dojo.id
        this.$emit('addDojoToInstructor', data)
      }
    }
  }

</script>
