<template>
	<div class = 'tradeview window white'>
		<fieldset id='onesplit'>
			<legend class='text-center'>Swap using all Curve pools</legend>
			<div class='aligncontainer'>
				<div class='info-message gentle-message pulseinfo' v-show='contactUs'>
					We believe there was an issue with your swap. 
					Please contact us on <a href='https://t.me/curvefi'>Telegram</a> or <a href='https://twitter.com/CurveFinance'>Twitter</a>.
				</div>
			</div>
			<one-split />
		</fieldset>
	</div>
</template>

<script>
	import OneSplit from './OneSplit.vue'
	
	import { contract, init, getters } from '../../contract'
    import * as shiftState from '../ren/shiftState'

	import { updatePoolInfo} from './tradeStore'
	
	const SwapNative = () => ({
        component: import('../ren/Gateway.vue'),

        loading: OneSplit,

        delay: 0,
    })

	export default {
		data: () => ({
			unwatch: null,
			loading: false,
		}),
		computed: {
			currentPool() {
				return getters.currentPool()
			},
			hasIncomplete() {
				return shiftState.hasIncomplete()
			},
			publicPath() {
                return process.env.BASE_URL
            },
            default_account() {
            	return getters.default_account() 
            },
            contactUs() {
            	return ['0x0f87dd03a74e6a48d56661d96f44880c79b9d795'].map(a => a.toLowerCase())
            		.includes(this.default_account.toLowerCase())
            },
		},
		async created() {
			this.unwatch = this.$watch(()=>contract.initializedContracts, async (val) => {
        console.log('BasicTrade:57')
				Promise.all(['test3'].map(p=>{
					return init(contract.contracts[p])
				}))
				this.unwatch()
			})
		},
		methods: {
			loaded() {
				if(this.swapComponent == 'SwapNative') this.loading = false;
			},
		},
		components: {
			OneSplit,
			SwapNative,
		}
	}
</script>

<style scoped>
	#select_pool {
		margin-bottom: 10px;
	}
	>>>.exchange {
		width: 80%;
	}
	>>>.trade-buttons {
		margin: 0;
	}
	.swapBTC-container {
		margin-top: 1em;
		margin-bottom: 1em;
	}
	.loading.line {
		margin-left: 1em;
	}
	.aligncontainer {
		margin: 0 auto;
		width: 80%;
	}
	.swapBTC-container.info-message {
		margin: 0;
		margin-top: 1em;
		margin-bottom: 1em;
	}
	.swapBTC-container a {
		color: white;
	}
	.swapBTC-wrapper {
		display: grid;
		grid-template-columns: minmax(30px, 210px) minmax(30px, 210px);
		grid-gap: 1em;
	}
	.swapBTC-container {
	}
</style>