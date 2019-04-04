<template>
  <div>
    <a class="button" @click="show=!show"><span class="icon is-large"><i class="fas fa-qrcode"></i></span></a>
    <div v-if="show">
      <div class="modal is-active">
        <div class="modal-background "></div>
        <div class="modal-content">
          <p class="title has-text-centered has-text-white-bis">
            {{msg}}
          </p>
          <p class=" is-1by1">
            <scanner :use-back-camera="true" :draw-on-found="false" :responsive="true" @code-scanned="codeArrived" />

          </p>

        </div>
        <button class="modal-close is-large" aria-label="close" @click="show=false"></button>
      </div>
    </div>
</div>
</template>

<script>
  import VueQrReader from 'vue-qr-reader/dist/lib/vue-qr-reader.umd.js';
  import router from '../router'
  export default {
    name: 'QRScanner',
    data() {
      return {
        show: false,
        msg: "סרוק קוד חניך"
      }
    },
    components: {
      'scanner': VueQrReader,
    },
    methods: {
      codeArrived(c) {
        const startWith = "https://dsjj-5820a.firebaseapp.com/#"
        if (c.startsWith(startWith)) {
          router.push(c.substring(startWith.length))
        } else {
          this.msg = "הקוד שנסרק הוא לא תקין";
        }
      }
    },
    mounted() {
      console.log("MOUNTED");

    },
    created() {
      console.log("CREATED")
    }
  }

</script>
