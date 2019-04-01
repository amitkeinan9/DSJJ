<template>
  <div class="edit" dir="ltr">
    <div class="timeline is-centered">
      <header class="timeline-header">
        <span class="tag is-medium is-link">התחלה</span>
      </header>

      <div v-for="event in fixedDatesEvents" class="timeline-item">
        <div class="timeline-marker is-image is-32x32">
          <img :src="getImgUrl(event.type)">
        </div>

        <div class="timeline-content">
          <p class="heading">{{ event.startDate }}</p>
          <p v-if="event.type == 'note'"> {{ event.note}} </p>
          <p v-else> {{ event.from }} ← {{event.to}} </p>
        </div>
      </div>
      <div class="timeline-header">
        <span class="tag is-medium is-link">סוף</span>
      </div>
    </div>

  </div>
</template>

<script>
  import moment from 'moment'
  export default {
    name: 'timeline',
    props: ['events'],
    data() {
      return {}
    },
    methods: {
      getImgUrl(name) {
        var assets = require.context('../assets/', false, /\.svg$/)
        return assets('./' + name + '.svg')
      },

    },
    computed: {
      sortedDates() {
        return this.events.sort((e1, e2) => {return  e1.startDate - e2.startDate })
      },
      fixedDatesEvents() {
        return this.sortedDates.map(e => {
          e.startDate = moment(e.startDate).format("DD-MM-YYYY")
          return e;
        })
      }
    }
  }

</script>
