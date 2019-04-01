<template>
  <div dir="ltr">
    <ul class="steps is-small">
      <li v-for="n in completed" class="step-item is-completed is-link">
        <div class="step-marker">
          <span class="icon">
            <i class="fa fa-check"></i>
          </span>
        </div>
      </li>
      <li v-if="left >= 0" class="step-item is-active is-link">
        <div class="step-marker">{{  current }}</div>
      </li>


      <li v-if="left >= 0" v-for="n in left" class="step-item is-link">
        <div class="step-marker">{{ n + current }}</div>
      </li>


      <li class="step-item is-link" :class="{'is-active': last}">
        <div class="step-marker ">
          <span class="icon">
            <i class="fa fa-flag"></i>
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: 'steps',
    props: ['amount', 'current'],
    data() {
      return {

      }
    },
    computed: {
      completed() {
        return this.current - 1;
      },
      left() {
        return (this.amount - 1 - this.current)
      },
      last() {
        return this.amount == this.current
      }
    },
    methods: {

    }
  }

</script>
