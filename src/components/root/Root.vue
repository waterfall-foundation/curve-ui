<template>
	<div>

	    <basic-trade />

		<div class="window white">
	        <fieldset class='poolsdialog'>
	            <legend>
	            	Curve pools
	            	<span class='tooltip'>
	            		$
	            		<span class='tooltiptext'>
	            			Your total balances: ${{ +sumBalances.toFixed(2) }} 
	            		</span>
	            	</span>
	            </legend>
	            <div :class="{selected: activePoolLink == 0}">
	                <router-link to = '/test3'>
	                	<span class='index'>1.</span>
	                    <span class='pooltext'>Test3</span>
	                    <span class='pools'>[wWAT, Alex, Serg]</span>
	                    <span class='apr'>
	                    	<span>
	                    		<span class='tooltip'>APY:
	                    			<span class='tooltiptext long'>
			                    		<div>Pool APY + Lending APY (annualized)</div>
			                    		<div>Daily APY: {{daily_apy[8]}}%</div>
			                    		<div>Weekly APY: {{weekly_apy[8]}}%</div>
			                    		<div>Monthly APY: {{+monthly_apy[8] == 0 ? 'N/A' : monthly_apy[8]}}%</div>
			                    		<div>Total APY: {{apy[8]}}%</div>
			                    	</span>
	                    		</span> 
	                    		<span :class="{'loading line': !daily_apy[8]}">{{daily_apy[8]}}%</span>
	                    	</span>
	                    </span>
	                    <span class='volume'>Vol: <span :class="{'loading line': volumes.sbtc && volumes.sbtc[0] < 0}">
	                    	<span v-show='volumes.sbtc && volumes.sbtc[0] >= 0'>${{(volumes.sbtc && volumes.sbtc[0] | 0) | formatNumber(0)}}</span>
               	 		</span></span>
               	 		<span class='balance'>
           	 				<span class='showmobile' v-show='balances.sbtc > 0'>Balance: ${{balances.sbtc && balances.sbtc.toFixed(2)}} </span>
               	 			<span class='tooltip' v-show='balances.sbtc > 0'>
               	 				<img :src="publicPath + 'dollar-sign-solid.svg'">
               	 				<span class='tooltiptext'>Balance: ${{balances.sbtc && balances.sbtc.toFixed(2)}}</span>
               	 			</span>
               	 		</span>
	                </router-link>
	            </div>
	        </fieldset>
	    </div>

	    <total-balances :total-volume='totalVolume'/>

	</div>
</template>

<script>
	import Vue from 'vue'
	import TotalBalances from './TotalBalances.vue'
	import BasicTrade from '../graphs/BasicTrade.vue'
	import allabis, { ERC20_abi, balancer_ABI, balancer_address, } from '../../allabis'
	import * as volumeStore from '@/components/common/volumeStore'
	import * as priceStore from '@/components/common/priceStore'

	import * as helpers from '../../utils/helpers'

	import { contract } from '../../contract'

	export default {
		components: {
			TotalBalances,
			BasicTrade,
		},
		data: () => ({
			activePoolLink: -1,
			pools: ['test3'],
			daily_apy: [],
			weekly_apy: [],
			monthly_apy: [],
			apy: [],
			start: 0,
			end: 0,
			volumes: {
				test3: [-1, -1, -1],
			},
			balances: {
        test3: -1,
			},
			snxRewards: null,
			sbtcRewards: null,
			balRewards: null,
			btcPrice: null,
		}),
		async created() {
			var start = new Date();
			start.setHours(0,0,0,0);
			this.start = start.getTime() / 1000

			var end = new Date();
			end.setHours(23,59,59,999);
			this.end = end.getTime() / 1000

			this.$watch(() => contract.web3 && contract.multicall, val => {
				if(!val) return;
				// this.getCurveRewards()
				this.getBalances()
			})
		},
		async mounted() {
			this.keydownListener = document.addEventListener('keydown', this.handle_pool_change)
			contract.web3 && contract.multicall && /*this.getCurveRewards() && */this.getBalances();
			this.btcPrice = await priceStore.getBTCPrice()
	        this.getAPY()
		},
		beforeDestroy() {
			document.removeEventListener('keydown', this.handle_pool_change);
		},
		computed: {
			totalVolume() {
				return volumeStore.totalVolume()
			},
			publicPath() {
                return process.env.BASE_URL
            },
			sumBalances() {
				return Object.values(this.balances).filter(balance => balance > 0).reduce((a, b) => a + b, 0)
			},
		},
		methods: {
			async getCurveRewards() {
				let curveRewards = new contract.web3.eth.Contract(allabis.susdv2.sCurveRewards_abi, allabis.susdv2.sCurveRewards_address)
				let sbtcRewards = new contract.web3.eth.Contract(allabis.sbtc.sCurveRewards_abi, allabis.sbtc.sCurveRewards_address)

				let sCurve = new contract.web3.eth.Contract(allabis.susdv2.swap_abi, allabis.susdv2.swap_address)
				let sbtcCurve = new contract.web3.eth.Contract(allabis.sbtc.swap_abi, allabis.sbtc.swap_address)

				let balancerPool = new contract.web3.eth.Contract(balancer_ABI, balancer_address)

				let calls = [
					[curveRewards._address, curveRewards.methods.totalSupply().encodeABI()],
					[sCurve._address, sCurve.methods.get_virtual_price().encodeABI()],
					[curveRewards._address, curveRewards.methods.DURATION().encodeABI()],
					[curveRewards._address, curveRewards.methods.rewardRate().encodeABI()],

					[sbtcRewards._address, sbtcRewards.methods.totalSupply().encodeABI()],
					[sbtcCurve._address, sbtcCurve.methods.get_virtual_price().encodeABI()],

					[
						balancerPool._address,
						balancerPool.methods.getBalance('0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f').encodeABI()
					],
                    [
                    	balancerPool._address,
                    	balancerPool.methods.getBalance('0x408e41876cccdc0f92210600ef50372656052a38').encodeABI()
                	],
				]

				let aggcalls = await contract.multicall.methods.aggregate(calls).call();
				let decoded = aggcalls[1].map(hex => contract.web3.eth.abi.decodeParameter('uint256', hex))
				let requests = await Promise.all([
					fetch('https://api.coinpaprika.com/v1/tickers/hav-havven'),
					fetch('https://api.coinpaprika.com/v1/tickers/ren-republic-protocol'),
					fetch('https://api.coinpaprika.com/v1/tickers/btc-bitcoin'),
					fetch('https://api.coingecko.com/api/v3/simple/price?ids=balancer&vs_currencies=usd'),
					fetch('https://pushservice.curve.fi/getBalancerTVL'),
				])
				let prices = await Promise.all(requests.map(request => request.json()))
				let [snxPrice, renPrice, btcPrice, balPrice, balancerTVL] = prices;
				snxPrice = snxPrice.quotes.USD.price;
				renPrice = renPrice.quotes.USD.price;
				btcPrice = btcPrice.quotes.USD.price;
				balPrice = balPrice.balancer.usd;
				balancerTVL = balancerTVL.TVL

				//total factor 0.64

				this.balRewards = (decoded[6] / 1e18 * snxPrice + decoded[7] / 1e18 * renPrice) * 0.64 / balancerTVL * balPrice * 100

				this.snxRewards = 365 * (decoded[2] * decoded[3] / 1e18)/7*snxPrice/((+decoded[0]) * (+decoded[1])/1e36) * 100

				this.sbtcRewards = (10000 * snxPrice + 25000 * renPrice) / 7 * 365 / (btcPrice * decoded[4] * decoded[5] / 1e36) * 100

      },
			async getBalances() {
				if(!contract.default_account) return;
				contract.contracts.compound = contract;
				let calls = this.pools.flatMap(k => {
					return [
						//balanceOf(address)
						[allabis[k].token_address, '0x70a08231000000000000000000000000' + contract.default_account.slice(2)],
						//get_virtual_price
						[allabis[k].swap_address, "0xbb7b8b80"]
					]})
				let aggcalls = await contract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
				//this.balances = []
				helpers.chunkArr(decoded, 2).slice(0,this.pools.length).map((v, i) => {
					let key = this.pools[i]
					Vue.set(this.balances, key, +v[0] * (+v[1]) / 1e36);
				})
			},
			handle_pool_change(e) {
				if(document.querySelector('#from_currency') == document.activeElement 
					|| document.querySelector('#custom_slippage_input') == document.activeElement
					|| document.querySelector('#custom_gas_input') == document.activeElement) return;
				if(this.activePoolLink == -1) return this.activePoolLink = 0
	            if(e.code == 'ArrowUp' && this.activePoolLink != 0) {
	                e.preventDefault();
	                this.activePoolLink--;
	            }
	            if(e.code == 'ArrowDown' && this.activePoolLink < 6) {
	                e.preventDefault();
	                this.activePoolLink++;
	            }
	            if(e.code.includes('Digit')) {
	                e.preventDefault();
	                var digit = e.code.slice(-1);
	                if(digit > 6) return;
	                this.activePoolLink = digit
	            }
	            if(e.code == 'Enter') {
	                e.preventDefault();
	                this.$router.push('/'+pools[this.activePoolLink])
	            }
			},
			async getAPY() {
				let pools = ['test3',]
	            let stats = await fetch(`${window.domain}/raw-stats/apys.json`)
	            stats = await stats.json()
                for(let [key, value] of Object.entries(volumeStore.state.volumes)) {
                	if(volumeStore.state.volumes[key] && volumeStore.state.volumes[key][0] == -1) {
                		let volume = key == 'ren' ? stats.volume.ren2 : key == 'sbtc' ? stats.volume.rens : stats.volume[key]
                		Vue.set(volumeStore.state.volumes[key], 0, volume || 0)
                	}
                }
                this.volumes = volumeStore.state.volumes;
	            for(let [i, pool] of pools.entries()) {
	                var daily_apy = stats.apy.day[pool];
	                var weekly_apy = stats.apy.week[pool];
	                var monthly_apy = stats.apy.month[pool];
	                var apy = stats.apy.total[pool];
	                this.daily_apy.push((daily_apy*100).toFixed(2))
	                this.weekly_apy.push((weekly_apy*100).toFixed(2))
	                this.monthly_apy.push((monthly_apy*100).toFixed(2))
	                this.apy.push((apy*100).toFixed(2))
	            }
			}
		}
	}
</script>

<style scoped>
	@media only screen and (min-device-width : 320px) and (max-device-width : 730px) {
		#app .tradeview {
 	 		width: 90%;
		}
		.poolsdialog.poolsdialog > div a {
			display: block;
		  text-align: center;
		}
		.poolsdialog .balance {
			width: 100%;
		}
		.poolsdialog .balance .showmobile {
			display: block;
			text-align: center;
		}
		.poolsdialog .balance .tooltip {
			display: none;
		}
		.poolsdialog.poolsdialog > div a > span {
			display: block;
			text-align: center;
		}
		.poolsdialog.poolsdialog > div span.pooltext, .poolsdialog.poolsdialog > div span.index {
			display: inline;
		}
		.pools {
		  width: 100%;
		}
		.poolsdialog .incentive-apr {
			text-align: center;
		}
	}
	.poolsdialog > div a {
		display: flex;
		justify-content: space-between;
	}
	.poolsdialog > div > a:hover .tooltip {
 		border-bottom: 1px dotted white;
	}
	.poolsdialog > div > a:hover img {
		filter: invert(1);
	}
	.poolsdialog > div a span {
		text-align: left;
	}
	.index {
		flex: 0.1;
	}
	.pooltext {
		flex: 0.4;
	}
	.pools {
		flex: 1.6;
	}
	.apr {
		flex: 0.8;
	}
	.volume {
		flex: 0.8;
	}
	.balance {
		width: 12px;
	}
	.pools .tooltip {
		vertical-align: bottom;
		overflow: hidden;
	}
	.tooltip {
		position: relative;
		margin-left: 0;
	}
	.tooltiptext.long {
		max-width: 250px;
		position: absolute;
		margin-left: 0;
		transform: translateX(-50%) translateX(6px);
	}
	.tooltiptext.long a {
		display: inline-block;
		background: transparent;
		text-decoration: underline;
	}
	.tooltiptext.long > div {
		padding-left: 1em;
		text-align: left;
	}
	.tooltiptext.long > div:hover {
		background: none;
	}
	.balance img {
		height: 12px;
	}
</style>