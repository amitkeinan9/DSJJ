<template>
  <div>
    <div class="is-pulled-left control">
      <a class="button is-link is-outlined " @click="instructorModal = true">הוסף מאמן</a>
    </div>

    <h1 class="is-4 title">{{ dojo.name }}</h1>

    <br v-show="dojo.instructors">
    <p class="subtitle is-6" v-for="instructor in dojo.instructors">
      {{instructor.firstName}} {{instructor.lastName}}
    </p>
    <hr>
    <add-modal @approve="addInstructor" @close="instructorModal = false" title="מאמן" :fields='modalFields' :class="{'is-active': instructorModal}"></add-modal>
  </div>
</template>

<script>
  import AddModal from '@/components/addModal'

  export default {
    name: 'dojo',
    props: ['dojo'],
    components: {
      'add-modal': AddModal,
    },
    data() {
      return {
        instructorModal: false,
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
    methods: {
      addInstructor(data) {
        console.log(this.dojo)
        this.instructorModal = false;
        data['dojo'] = 'dojos/' + this.dojo.id
        this.$emit('addInstructor', data)
      }
    }
  }

</script>
