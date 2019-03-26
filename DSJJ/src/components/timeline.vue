<template>
  <div class="edit" dir="ltr">
    <div class="timeline is-centered">
      <header class="timeline-header">
        <span class="tag is-medium is-link">התחלה</span>
      </header>

      <div v-for="event in events" class="timeline-item">
        <div class="timeline-marker is-image is-32x32">
          <img :src="getImgUrl(event.type)">
        </div>
        <div class="timeline-content">
          <p class="heading">{{event.startDate}}</p>
          <p> {{ event.to }} ← {{event.from}} </p>
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
    }
  }

</script>
