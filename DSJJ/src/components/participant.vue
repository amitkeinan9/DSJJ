<template>
  <div class="participant">
    <!-- <img :src="image" alt="">
    <p>{{name}}</p>
    <hr> -->
    <div class="card" @click="$emit('click')">
      <div class="card-content">
        <article class="media">
          <figure class="media-right">
            <p class="image is-64x64 image-cropper">
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

<style scoped>
        .image-cropper {
        width: 64px;
        height: 64px;
        position: relative;
        overflow: hidden;
        border-radius: 50%;
    }
    
    img {
        display: inline;
        margin: 0 auto;
    }
    </style>