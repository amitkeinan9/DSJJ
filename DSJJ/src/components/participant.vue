<template>
  <div class="participant">
    <!-- <img :src="image" alt="">
    <p>{{name}}</p>
    <hr> -->
    <div class="card" @click="$emit('click')">
      <div class="card-content">
        <article class="media">
          <figure class="media-right">
            <p class="image is-64x64">
              <img :src="image">
            </p>
          </figure>
          <div class="media-content">
            <div class="content has-text-right">
              <p class="title is-4">{{name}}</p>
              <p class="subtitle is-6">{{rank}}</p>
              <p><strong>{{dojo}}</strong>, {{instructor}}</p>
              
            </div>
          </div>
          <!-- <div class="media-right">
            <button class="button is-link is-outlined">ערוך</button>
          </div> -->
        </article>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'participant',
    props: ['name', 'image', 'dojo', 'rank', 'instructor'],
    data() {
      return {
        data: {}
      }
    },
    methods: {

    }
  }

</script>
