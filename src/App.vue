<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
    import { getters, contract as currentContract } from './contract'
    import { capitalizeFirstLetter } from './utils/helpers'

    const descriptions = {
      test3: 'Literally just test foe WWAT/Alex/Serg',
    	compound: 'A curve.fi portal for swapping cDAI/cUSDC',
    	usdt: 'A curve.fi Tethered portal for swapping cDAI/cUSDC/USDT',
    	iearn: 'A curve.fi yTokens portal for swapping DAI/USDC/USDT/TUSD',
    	busd: 'A curve.fi portal for swapping BUSD and other stablecoins',
    }

    const titles = {
      test3: 'Test pool',
    	compound: 'Compounded',
    	usdt: 'Tethered',
    	iearn: 'Yield',
    	busd: 'bUSD',
    	susd: 'sUSD-yCurve old',
    	susdv2: 'sUSD',
      pax: 'PAX',
      tbtc: 'TBTC',
      ren: 'renBTC',
      sbtc: 'sBTC',
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