<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
    import { getters, contract as currentContract } from './contract'
    import { capitalizeFirstLetter } from './utils/helpers'

    const descriptions = {
      test3: 'Literally just test for WWAT/Alex/Serg',
    }

    const titles = {
      test3: 'Test pool',
    }

	export default {
		metaInfo() {
			return {
				title: 'Curve.fi :: ' + titles[this.currentPool],
				meta: [
					{'property': 'og:title', 'content': 'curve.fi/' + this.currentPool},
					{'property': 'og:url', 'content': 'https://curve.fi/' + this.currentPool},
					{'property': 'og:type', 'content': 'website'},
					{'property': 'og:description', 'content': descriptions[this.currentPool]},
					{'property': 'og:image', 'content':  '/curve' + this.currentPool + '_preview.png'},
				]
			}
		},
    computed: {
      ...getters,
    },
	}
</script>