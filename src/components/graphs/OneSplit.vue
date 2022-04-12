<template>
    <div>

        <div class='swap exchange'>
            <div id='poolselect'>
                <input id='test3pool' type='checkbox' value='test3' v-model='pools'/>
                <label for='test3pool'>Test3</label>
            </div>
            
            <div class='exchangefields'>
                <fieldset class='item'>
                    <legend>From:</legend>
                    <div class='maxbalance' :class="{'loading line': maxBalance == -1}" @click='set_max_balance'>
                        Max: 
                        <span v-show = 'maxBalance != -1'>{{maxBalanceText}}</span>
                        <span v-show='susdWaitingPeriod' class='susd-waiting-period'>
                            <span class='tooltip'>
                                <img src='@/assets/clock-regular.svg' class='icon small'>
                                <span class='tooltiptext'>
                                    Cannot transfer during waiting period. {{ (susdWaitingPeriodTime).toFixed(0) }} secs left.
                                </span>
                            </span>
                        </span>
                        <span v-show="[5,9].includes(from_currency)" class='tooltip'> [?]
                            <span class='tooltiptext'>
                                Max transferrable amount is {{ maxSynthBalanceText }}. You can free the remaining balance by settling.
                            </span>
                        </span>
                    </div>
                    <ul>
                        <li>
                            <input type="text" id="from_currency" :disabled='disabled || selldisabled' name="from_currency" value='0.00'
                            :style = "{backgroundColor: fromBgColor}"
                            @input='set_to_amount'
                            v-model='fromInput'>
                            <p class='actualvalue' v-show='swapwrapped'>
                                ≈ {{actualFromValue}} {{Object.keys(currencies)[this.from_currency] | capitalize}}
                            </p>
                        </li>
                        <li :class="{'coins': true, [currency]: true}" v-for='(currency, i) in Object.keys(currencies)'>
                            <input type="radio" :id="'from_cur_'+i" name="from_cur" :value='i' v-model='from_currency'>
                            <label :for="'from_cur_'+i">
                                <img :class="{'icon token-icon': true, [currency+'-icon']: true}" :src='getTokenIcon(currency)'>
                                <span v-show='!swapwrapped'> {{currency | capitalize}} </span>
                                <span v-show='swapwrapped'> {{currencies[currency]}} </span>
                            </label>
                        </li>
                    </ul>
                </fieldset>
                <fieldset class='item iconcontainer' @click='swapInputs'>
                    <img :src="publicPath + 'exchange-alt-solid.svg'" id='exchangeicon'/>
                </fieldset>
                <fieldset class='item'>
                    <legend>To:</legend>
                    <div class='maxbalance2'>Max: <span></span> </div>
                    <ul>
                        <li>
                            <input type="text" 
                            id="to_currency" 
                            name="to_currency" 
                            value="0.00" 
                            disabled
                            :style = "{backgroundColor: bgColor}"
                            v-model='toInput'>
                            <p class='actualvalue' v-show='swapwrapped'>
                                ≈ {{actualToValue}} {{Object.keys(currencies)[this.to_currency] | capitalize}}
                            </p>
                        </li>
                        <li :class="{'coins': true, [currency]: true}" v-for='(currency, i) in Object.keys(currencies)'>
                            <input type="radio" :id="'to_cur_'+i" name="to_cur" :value='i' v-model='to_currency'>
                            <label :for="'to_cur_'+i">
                                <img :class="{'icon token-icon': true, [currency+'-icon']: true}" :src='getTokenIcon(currency)'>
                                <span v-show='!swapwrapped'> {{currency | capitalize}} </span>
                                <span v-show='swapwrapped'> {{currencies[currency]}} </span>
                            </label>
                        </li>
                    </ul>
                </fieldset>
            </div>
            <p v-show='fromInput > 0' class='exchange-rate'>
                Exchange rate
                <span @click='swapExchangeRate' class='clickable underline'>
                    {{getPair(swaprate)}}
                    <img src='@/assets/sync-solid.svg' class='swaprates-icon'>
                </span> (including fees):
                <span id="exchange-rate" @click='swapExchangeRate' class='clickable'>
                    {{exchangeRateSwapped}}
                </span>
            </p>
            <p v-show='fromInput > 0' class='best-pool-text'>
                Trade routed through:
                <span id="best-pool">
                    <span>
                        {{bestPoolText}}
                    </span>
                </span>
            </p>
                <div v-show='fromInput > 0' id='max_slippage'><span>Max slippage:</span> 
                    <input id="slippage05" type="radio" name="slippage" value='0.005' @click='maxSlippage = 0.5; customSlippageDisabled = true'>
                    <label for="slippage05">0.5%</label>

                    <input id="slippage1" type="radio" name="slippage" checked value='0.01' @click='maxSlippage = 1; customSlippageDisabled = true'>
                    <label for="slippage1">1%</label>

                    <input id="custom_slippage" type="radio" name="slippage" value='-' @click='customippageDisabled = false'>
                    <label for="custom_slippage" @click='customSlippageDisabled = false'>
                        <input type="text" id="custom_slippage_input" :disabled='customSlippageDisabled' name="custom_slippage_input" v-model='maxInputSlippage'> %
                    </label>
            </div>
            <gas-price></gas-price>
            <ul>
                <li v-show='bestPool !== null'>
                    <input id="inf-approval" type="checkbox" name="inf-approval" checked v-model='inf_approval'>
                    <label for="inf-approval">Infinite approval - trust {{bestPoolText}} contract forever</label>
                </li>
                <!-- TODO add all wrapped tokens -->
                <!-- <li v-show="['compound', 'usdt'].some(p => pools.includes(p))">
                    <input id='swapc' type='checkbox' name='swapc' v-model = 'swapwrapped'>
                    <label for='swapc'>Swap compounded</label>

                    <input id='swapy' type='radio' name='swapy' :value='2' :checked='swapwrapped == 2' @click='handleCheck(2)' v-model = 'swapwrapped'>
                    <label for='swapy'>Swap y</label>
                </li> -->
            </ul>
            <p class='simple-error' id='no-balance-synth' v-show='notEnoughBalanceSynth && !susdWaitingPeriod && +maxSynthBalanceText > 0'>
                Max balance you can use is {{ maxSynthBalanceText }}
            </p>
            <div class='simple-error pulse' v-show="susdWaitingPeriod">
                Cannot transfer {{ from_currency == 5 ? 'sUSD' : 'sBTC' }} during waiting period {{ (susdWaitingPeriodTime).toFixed(0) }} secs left
            </div>
            <p class='trade-buttons'>
                <button id="trade" @click='handle_trade' :disabled='selldisabled'>
                    Sell <span class='loading line' v-show='loadingAction'></span>
                </button>
            </p>
            <div class='info-message gentle-message waiting-message' v-show='show_loading'>
                <span v-html='waitingMessage'></span>
                <span class='loading line'></span>
            </div>
            <div class='info-message gentle-message' v-show='estimateGas'>
                Estimated tx cost: {{ (+estimateGas).toFixed(2) }}$
            </div>
            <p class='simple-error' id='no-balance' v-show='maxBalance != -1 && +fromInput > +maxBalance*1.001 && from_currency !== 0'>
                Not enough balance for 
                <span v-show='!swapwrapped'>{{Object.keys(currencies)[from_currency] | capitalize}}</span>
                <span v-show='swapwrapped'>{{Object.values(currencies)[from_currency]}}</span>. <span>Swap is not available.</span>
            </p>
            <div class='info-message gentle-message' v-show='selldisabled'>
                Swapping between {{Object.values(currencies)[from_currency]}} and {{Object.values(currencies)[to_currency]}} is not available currently
            </div>
            <div class='info-message gentle-message' v-show='warningNoPool !== null'>
                Swap not available. Please select {{warningNoPool}} in pool select
            </div>
        </div>
    </div>
</template>

<script>
    import EventBus from './EventBus'

    import contractAbis, { ERC20_abi, cERC20_abi,
        synthetixExchanger_address, synthetixExchanger_ABI} from '../../allabis'
    import { notify, notifyHandler, notifyNotification } from '../../init'

    import { contract, LENDING_PRECISION, PRECISION, gas as contractGas } from '../../contract'
    import * as common from '../../utils/common'
    import * as helpers from '../../utils/helpers'
    import tradeStore from './tradeStore'

    import * as gasPriceStore from '../common/gasPriceStore'
    import GasPrice from '../common/GasPrice.vue'

    import * as errorStore from '../common/errorStore'

    import BN from 'bignumber.js'

    import * as Comlink from 'comlink'

    import Worker from 'worker-loader!./worker.js';
    const worker = new Worker();
    const calcWorker = Comlink.wrap(worker);

    export default {

        components: {
            GasPrice,
        },

        data: () => ({
            pools: ['test3'],
            maxBalance: -1,
            maxSynthBalance: -1,
            susdWaitingPeriod: false,
            susdWaitingPeriodTime: 0,
            snxExchanger: null,
            from_currency: 0,
            to_currency: 1,
            fromInput: '1.00',
            toInput: '0.00',
            updateTimer: null,
            disabled: true,
            bgColor: '#505070',
            fromBgColor: 'blue',
            exchangeRate: 'Not available',
            swaprate: false,
            maxSlippage: 1,
            maxInputSlippage: '',
            customSlippageDisabled: true,
            inf_approval: false,
            distribution: null,
            //WWAT, Alex, Serg
            coin_precisions: [1e18, 1e18, 1e18],
            swap: [],
            addresses: [],
            coins: [],
            underlying_coins: [],
            onesplit: null,
            onesplit_address: '',
            //0x01+0x02+0x04+0x08+0x10+0x20+0x40+0x80+0x100+0x400+0x800+0x10000+0x20000+0x40000 -> 462335
            swapPromise: helpers.makeCancelable(Promise.resolve()),
            usedFlags: '',
            usedParts: 0,
            multipath: 0,
            swapwrapped: false,
            bestPool: null,
            show_loading: false,
            waitingMessage: '',
            ethPrice: 0,
            estimateGas: 0,
            loadingAction: false,
        }),
        computed: {
            //onesplit exchanges [uniswap, kyber, bancor, oasis, cCurve, tCurve, yCurve, bCurve, sCurve]
            CONTRACT_FLAG() {
                //disable uniswap, kyber, bancor, oasis, compound, fulcrum, chai, aave, smart token, bdai, iearn, weth, idle, 
                    //mooniswap, uniswap v2 all, dforce
                //enable multipath DAI, multipath USDC
                //enabled curve compound, curve usdt, curve y, curve binance, curve susd, curve pax
                let disabled = 0x20000000 + 0x40000000;
                let enabled = 0x1000 + 0x2000 + 0x4000 + 0x8000 + 0x40000 + 0x80000000
                let enabledMulti = 0x10000 + 0x20000 + 0x400000000
                let curveFlags = {
                    compound: 0x1000,
                    usdt: 0x2000,
                    y: 0x4000,
                    busd: 0x8000,
                    susdv2: 0x40000,
                    pax: 0x80000000,
                    ren: 0x100000000,
                    sbtc: 0x40000000000,
                }
                let addPoolFlag = Object.keys(curveFlags).filter(pool=>this.pools.includes(pool)).map(pool=>curveFlags[pool])
                addPoolFlag = addPoolFlag.reduce((a, b) => a + b, 0)
                return disabled + addPoolFlag + enabledMulti;
            },
            currencies() {
                if(this.swapwrapped === false) {
                    return {
                        wwat: 'wWAT',
                        serg: 'Serg',
                        alex: 'Alex',
                    }
                }
                return {
                    dai: 'yDAI',
                    usdc: 'yUSDC',
                    tusd: 'yTUSD',
                    busd: 'yBUSD',
                }
            },
            maxBalanceText() {
                return this.toFixed(this.maxBalance / this.precisions(this.from_currency))
            },
            maxSynthBalanceText() {
                if(isNaN(this.maxSynthBalance)) return '0.00'
                return this.toFixed(this.maxSynthBalance / this.precisions(this.from_currency))
            },
            notEnoughBalanceSynth() {
                return [5,9].includes(this.from_currency) && BN(this.fromInput).gt(BN(this.maxSynthBalance).div(this.precisions(this.from_currency)))
            },
            actualFromValue() {
                if(!this.swapwrapped) return;
                return (this.fromInput * this.c_rates(this.from_currency)[this.from_currency] * this.precisions(this.from_currency)).toFixed(2)
            },
            actualToValue() {
                if(!this.swapwrapped) return;
                return (this.toInput * this.c_rates(this.to_currency)[this.to_currency] * this.precisions(this.to_currency)).toFixed(2)
            },
            bestPoolText() {
                // if((this.from_currency == 6 && [3,4,5].includes(this.to_currency)) 
                //     || (this.to_currency == 6 && [3,4,5].includes(this.from_currency))) return 'Not Available'\
                if(this.bestPool === null) return 'Not available'
                return ['test3',][this.bestPool]
            },
            selldisabled() {
                return false;
            },
            allPools() {
                return ['test3']
            },
            warningNoPool() {
                this.message = 'Please select '
                let poolMessage = null
                if(!this.pools.includes('test3')) {
                    poolMessage = 'test3'
                }
                return poolMessage
            },
            decodeDistribution() {
                if(this.distribution === null) return []
                let distArr = []
                this.multipath = 0;
                //onesplit exchanges [uniswap, kyber, bancor, oasis, cCurve, tCurve, yCurve, bCurve, sCurve]
                //multipath USDC
                if(this.usedFlags == this.CONTRACT_FLAG - 0x10000 - 0x400000000 && this.distribution.find(v=>+v > this.usedParts) !== undefined) {
                    this.multipath = 1
                }
                //multipath DAI
                if(this.usedFlags == this.CONTRACT_FLAG - 0x20000 - 0x400000000 && this.distribution.find(v=>+v > this.usedParts) !== undefined) {
                    this.multipath = 2
                }
                //multipath USDT
                if(this.usedFlags == this.CONTRACT_FLAG - 0x10000 - 0x20000 && this.distribution.find(v=>+v > this.usedParts) !== undefined) {
                    this.multipath = 3
                }
                //no multipath
                let curveDist = this.distribution.slice(4, 9)
                //pax
                curveDist.push(this.distribution[17])
                //ren, sbtc
                curveDist.push(this.distribution[14], this.distribution[18]);
                if(this.multipath == 0) {
                    distArr.push(curveDist)
                }
                else {
                    distArr.push(curveDist.map(v => v / 256))
                    distArr.push(curveDist.map(v => v % 256))
                }

                return distArr
            },
            distributionText() {
                if(!this.decodeDistribution.length) return null;
                let distPools = ['compound', 'usdt', 'y', 'busd', 'susdv2', 'pax', 'ren', 'sbtc']
                let text = '';
                let multipaths = ['DAI', 'USDC', 'USDT']

                for(let j = this.decodeDistribution.length-1; j >= 0; j--) {
                    if(this.multipath > 0 && j == 1) 
                        text += Object.values(this.currencies)[this.from_currency] + ' -> ' + (multipaths[this.multipath-1]) + '<br>'

                    if(this.multipath > 0 && j == 0) 
                        text += (multipaths[this.multipath-1]) + ' -> ' + Object.values(this.currencies)[this.to_currency] + '<br>'

                    for(let [i, v] of this.decodeDistribution[j].entries()) {
                        if(v < 1) continue;
                        text += '' + (100 * v / this.usedParts).toFixed(2) + '% ' + distPools[i] + '<br>';
                    }
                }

                return text;
            },
            publicPath() {
                return process.env.BASE_URL
            },
            exchangeRateSwapped() {
                if(this.swaprate)
                    return (1 / this.exchangeRate).toFixed(4)
                else
                    return this.exchangeRate
            },
            gasPrice() {
                return gasPriceStore.state.gasPrice
            },
            gasPriceWei() {
                return gasPriceStore.state.gasPriceWei
            },
        },
        watch: {
            from_currency(val, oldval) {
                if(val == this.to_currency) {
                    this.to_currency = oldval;
                }
                this.swapExchangeRate()
                this.from_cur_handler()
            },
            to_currency(val, oldval) {
                this.swapExchangeRate()
                this.to_cur_handler()
            },
            pools() {
                this.from_cur_handler()
            },
            swapwrapped(val) {
                if(val) this.pools = this.pools.filter(p=>['compound','usdt'].includes(p))
                if(this.from_currency > 1) this.from_currency = 0
                else this.from_cur_handler()
            },
            warningNoPool(val, oldval) {
                if(val !== null) {
                    this.bgColor = 'red'
                    this.toInput = '0.00'
                    this.exchangeRate = 'Not available'
                }
            },
            exchangeRateSwapped() {
                if(this.swaprate)
                    return (1 / this.exchangeRate).toFixed(4)
                else
                    return this.exchangeRate
            },
            gasPrice() {
                this.set_to_amount()
            },
        },
        async created() {
            //EventBus.$on('selected', this.selectPool)
            let unwatch = this.$watch(() => contract.web3 && contract.multicall, val => {
                this.mounted();
                unwatch()
            })

        },
        mounted() {
            contract.web3 && contract.multicall && this.mounted()
        },
        methods: {
            async mounted() {
                await this.setup();
                this.disabled = false;
                this.from_cur_handler()
                let promises = await Promise.all([helpers.getETHPrice()])
                this.ethPrice = promises[0]
            },
            swapInputs() {
                //look no temp variable! :D
                [this.fromInput, this.toInput] = [this.toInput, this.fromInput]
                this.from_currency = this.to_currency
                this.from_cur_handler()
            },
            swapExchangeRate() {
                if(isNaN(this.exchangeRate)) return;
                this.swaprate = !this.swaprate
            },
            getTokenIcon(token) {
                return helpers.getTokenIcon(token, this.swapwrapped, '')
            },
            getPair(inverse = false) {
                let from = !this.swapwrapped ? Object.keys(this.currencies)[this.from_currency] : Object.values(this.currencies)[this.from_currency]
                let to = !this.swapwrapped ? Object.keys(this.currencies)[this.to_currency] : Object.values(this.currencies)[this.to_currency]
                from = helpers.capitalize(from)
                to = helpers.capitalize(to)
                if(!inverse) return from + '/' + to
                if(inverse) return to + '/' + from
            },
            toFixed(num) {
                if(num == '' || num == undefined || num == 0) return '0.00'
                if(!BN.isBigNumber(num)) num = +num
                if([7, 8, 9].includes(this.from_currency)) return num.toFixed(8)
                return num.toFixed(2)
            },
            handleError(err) {
                console.error(err)
                this.waitingMessage = '',
                this.show_loading = false
                throw err;
            },
            handleCheck(val) {
                if(this.swapwrapped === val) this.swapwrapped = false;
                else this.swapwrapped = val
            },
            c_rates(i) {
                if(this.swapwrapped == 2 && i < 3) return contract.contracts.iearn.c_rates
                if(this.swapwrapped == 2 && i == 3) return contract.contracts.busd.c_rates
                else return contract.c_rates;
            },
            getCoins(i) {
              return this.coins[i]
                // if(this.swapwrapped == 1)
                //     return this.coins.slice(0,2)[i]
                // else if(this.swapwrapped == 2)
                //     return this.coins.slice(2)[i]
                // else
                //     return this.underlying_coins[i]
            },
            normalizeCurrency(i) {
                if([7, 8, 9].includes(i)) return i - 7;
                if(i > 3) return 3
                return i;
            },
            precisions(i, contractName) {
                if(!this.swapwrapped) return this.coin_precisions[i]
                // if(!contractName && this.swapwrapped == 1) contractName = 'compound'
                // if(!contractName && this.swapwrapped == 2 && i < 3) contractName = 'iearn'
                // if(!contractName && this.swapwrapped == 2 && i == 3) contractName = 'busd'
                // if(!contractName) contractName = contract.currentContract
                // if(this.swapwrapped) return contractAbis[contractName].wrapped_precisions[i];
                // return contractAbis[contractName].coin_precisions[i]
            },
            async highlight_input() {
                var balance = parseFloat(await this.getCoins(this.from_currency).methods.balanceOf(contract.default_account || '0x0000000000000000000000000000000000000000').call()) 
                                / this.precisions(this.from_currency);
                if (this.fromInput > balance)
                    this.fromBgColor = 'red'
                else
                    this.fromBgColor = 'blue'
            },
            async from_cur_handler() {
                await this.set_from_amount(this.from_currency);
                await this.set_to_amount();
            },
            async to_cur_handler() {
                if (this.to_currency == this.from_currency) {
                    if (this.to_currency == 0) {
                        this.from_currency = 1;
                    } else {
                        this.from_currency = 0;
                    }
                    await this.set_from_amount(this.from_currency);
                }
                await this.set_to_amount();
            },
            setLoadingAction() {
                this.loadingAction = true
                setTimeout(() => this.loadingAction = false, 500)
            },
            getCurrency(i) {
                return Object.values(this.currencies)[i]
            },
            async handle_trade() {
                if(this.loadingAction) return;
                if(this.pools.length === 0 ) return;
                this.setLoadingAction();
                this.show_loading = true;
                 //handle allowances
                var i = this.from_currency;
                var j = this.to_currency;
                let amount = BN(this.fromInput).times(this.precisions(i)).toFixed(0);
                let maxSlippage = this.maxSlippage / 100;
                if(this.maxInputSlippage) maxSlippage = this.maxInputSlippage / 100;
                let min_dy = BN(this.toInput).times(this.precisions(j)).times(BN(1 - maxSlippage)).toFixed(0)
                let pool = contract.currentContract;
                let bestContract = contract;
                // if(this.bestPool > 0 && this.bestPool < 7) {
                //     pool = Object.keys(contract.contracts)[this.bestPool]
                //     bestContract = contract.contracts[pool]
                // }
                let address = this.swap[0]._address || bestContract.swap._address;
                this.waitingMessage = `Please approve ${this.fromInput} ${this.getCurrency(this.from_currency)} for exchange`
                var { dismiss } = notifyNotification(this.waitingMessage)
                try {
                    if (this.inf_approval)
                        await common.ensure_underlying_allowance(this.from_currency, contract.max_allowance, this.coins, address, this.swapwrapped, bestContract)
                    else
                        await common.ensure_underlying_allowance(this.from_currency, amount, this.coins, address, this.swapwrapped, bestContract);
                } catch(err) {
                  dismiss();
                  this.handleError(err)
                }
                dismiss();
                this.waitingMessage = `Please confirm swap
                                        from ${this.fromInput} ${this.getCurrency(this.from_currency)}
                                        for min ${this.toFixed(min_dy / this.precisions(j))} ${this.getCurrency(this.to_currency)}`
                dismiss= notifyNotification(this.waitingMessage).dismiss;

                let exchangeMethod = this.swap[0].methods.exchange;
                i = this.normalizeCurrency(i);
                j = this.normalizeCurrency(j);
                try {
                    await exchangeMethod(i, j, amount, min_dy).send({
                        from: contract.default_account,
                        gasPrice: this.gasPriceWei,
                        gas: this.swapwrapped ? contractGas.swap[pool].exchange(i, j) : contractGas.swap[pool].exchange_underlying(i, j),
                    })
                    .once('transactionHash', hash => {
                        dismiss();
                        this.waitingMessage = `Waiting for swap
                                                <a href='https://explorer.waterfall.network/tx/${hash}'>transaction</a>
                                                to confirm: no further action needed`;
                      dismiss = notifyNotification(this.waitingMessage).dismiss;
                    })
                } catch(err) {
                    dismiss();
                    this.handleError(err);
                    errorStore.handleError(err);
                }
                dismiss();
                this.waitingMessage = ''
                this.show_loading = false;

                this.from_cur_handler();
                let balance = await this.getCoins(this.from_currency).methods.balanceOf(contract.default_account || '0x0000000000000000000000000000000000000000').call();
                if(!contract.default_account) balance = 0
                let maxAmount = balance / this.precisions(i)
                this.maxBalance = this.toFixed(maxAmount);

            },
            async set_from_amount(i) {
                let coinAddress = this.getCoins(i)._address
                let balanceCalls = [
                    [coinAddress, this.getCoins(i).methods.balanceOf(contract.default_account || '0x0000000000000000000000000000000000000000').encodeABI()]]
                if([5, 9].includes(i)) {
                    balanceCalls.push([coinAddress, 
                        this.getCoins(i).methods.transferableSynths(contract.default_account || '0x0000000000000000000000000000000000000000').encodeABI()])
                    let currencyKey = '0x7355534400000000000000000000000000000000000000000000000000000000'
                    if(i == 9) 
                        currencyKey = '0x7342544300000000000000000000000000000000000000000000000000000000'
                    balanceCalls.push([this.snxExchanger._address, 
                        this.snxExchanger.methods
                            .maxSecsLeftInWaitingPeriod(contract.default_account, currencyKey)
                            .encodeABI()
                    ])
                }
                let aggcalls = await contract.multicall.methods.aggregate(balanceCalls).call()
                let balances = aggcalls[1].map(hex => contract.web3.eth.abi.decodeParameter('uint256', hex))
                let amounts = balances.map(balance => contract.default_account ? balance : 0)
                this.maxBalance = amounts[0]
                let highlight_red = this.fromInput > balances[0] / this.precisions(this.from_currency)
                if([5, 9].includes(i)) {
                    this.maxSynthBalance = amounts[1]
                    this.susdWaitingPeriod = (+amounts[2] != 0)
                    this.susdWaitingPeriodTime = +amounts[2]
                    highlight_red = this.fromInput > this.maxSynthBalance / this.precisions(this.from_currency)
                    if(this.susdWaitingPeriod) highlight_red = true
                }   
                if(highlight_red) 
                    this.fromBgColor = 'red'
                else
                    this.fromBgColor = 'blue'
                // let balance = await this.getCoins(i).methods.balanceOf(contract.default_account || '0x0000000000000000000000000000000000000000').call();
                // if(!contract.default_account) balance = 0
                // let amount = balance / this.precisions(i)

                // if (this.fromInput == '' || this.val == 0) {
                //     if(!contract.default_account) balance = 0
                //     this.fromInput = this.toFixed(amount)
                // }
                // this.maxBalance = this.toFixed(amount);
            },
            makeCall(amount, parts, flags) {
                if(this.swapwrapped == 1) flags -= 0x10
                if(this.swapwrapped == 2) flags -= 0x800
                return [
                    this.onesplit._address,
                    this.onesplit.methods.getExpectedReturn(
                        this.getCoins(this.from_currency)._address,
                        this.getCoins(this.to_currency)._address,
                        amount,
                        parts,
                        flags
                    ).encodeABI()
                ]
            },
            getCalls(amount) {
                let defaultCalls = [
                    this.makeCall(amount, 10, this.CONTRACT_FLAG - 0x10000 - 0x20000 - 0x400000000),
                ]
                let calls = defaultCalls.concat();
                if([3,4,5,6].includes(this.from_currency) && [3,4,5,6].includes(this.to_currency)) {
                    calls = defaultCalls.slice(1)
                    calls.push(
                        this.makeCall(amount, 15, this.CONTRACT_FLAG - 0x10000 - 0x400000000),
                        this.makeCall(amount, 15, this.CONTRACT_FLAG - 0x20000 - 0x400000000),
                        this.makeCall(amount, 15, this.CONTRACT_FLAG - 0x10000 - 0x20000),
                        this.makeCall(amount, 30, this.CONTRACT_FLAG - 0x10000 - 0x400000000),
                        this.makeCall(amount, 30, this.CONTRACT_FLAG - 0x20000 - 0x400000000),
                        this.makeCall(amount, 30, this.CONTRACT_FLAG - 0x10000 - 0x20000),
                    )
                }
                if([7,8].includes(this.from_currency) && [7,8].includes(this.to_currency)) {
                    calls.push(
                        this.makeCall(amount, 1000, 4403952091136)
                    )
                }
                return calls
            },
            async set_to_amount_onesplit() {
                let amount = BN(this.fromInput).times(this.precisions(this.from_currency)).toFixed(0)
                let calls = this.getCalls(amount)
                this.swapPromise.cancel();
                let aggcalls = contract.multicall.methods.aggregate(calls).call()
                this.swapPromise = helpers.makeCancelable(aggcalls)
                let split_swap = await this.swapPromise
                let decoded = split_swap[1].map(hex => contract.web3.eth.abi.decodeParameters(['uint256', 'uint256[]'], hex))
                let max = decoded.reduce((a, b) => a[0] > b[0] ? a : b)
                let decodedCall = contract.web3.eth.abi.decodeParameters(['address', 'address', 'uint256', 'uint256', 'uint256'], 
                                                                calls[decoded.indexOf(max)][1].slice(10))
                this.usedFlags = decodedCall[4]
                this.usedParts = decodedCall[3]

                let amount_dy = max[0];
                let exchangeRate = BN(amount_dy).div(this.precisions(this.to_currency)).div(this.fromInput)
                this.distribution = max[1]
                return ['1split', exchangeRate, amount_dy]
                // this.setExchangeRate(exchangeRate)
                // this.toInput = BN(amount_dy).div(this.precisions(this.to_currency)).toFixed(2);
                // this.disabled = false
            },
            setExchangeRate(exchangeRate) {
              this.bgColor= '#505070'
              if(isNaN(+exchangeRate))
                this.exchangeRate = "Not available"
              else
                this.exchangeRate = (+exchangeRate).toFixed(4)
            },
              getPoolsCalls() {
                let pools = this.pools
                console.log('pools', pools)
                let calls = []
                pools.map((el) => this.swap.push(new contract.web3.eth.Contract(contractAbis[el].swap_abi, contractAbis[el].swap_address)));
                if(!this.swapwrapped) {
                    let dx = BN(this.fromInput).times(contractAbis.test3.coin_precisions[this.from_currency])
                    if(this.pools.includes('test3')) {
                      calls = [
                        [
                          this.swap[0]._address,
                          this.swap[0].methods.get_dy(this.from_currency, this.to_currency, dx.toFixed(0, 1)).encodeABI(),
                        ]
                      ]
                    } else {
                        //susd is already checked outside this function
                        //now coins are DAI, USDC, USDT, other cases are handled and they go through all pools
                        dx = BN(this.fromInput).times(contractAbis.usdt.coin_precisions[this.from_currency])
                        let poolidx = this.pools.filter(pool => !['tbtc', 'ren', 'sbtc'].includes(pool)).map(pool => this.allPools.indexOf(pool))
                        if(this.from_currency == 2 || this.to_currency == 2) poolidx =  poolidx.filter(id => id != 0)
                        console.log('pools', this.pools)
                        calls = poolidx.map(i =>
                            [
                                this.swap[i]._address, 
                                this.swap[i].methods.get_dy_underlying(this.from_currency, this.to_currency, dx.toFixed(0,1)).encodeABI()
                            ]
                        )
                    }
                }
                return calls
            },
            async realComparePools() {
                //use addresses of coins instead of checking from_currency, to_currency?
                let calls = this.getPoolsCalls();
                let aggcalls = await contract.multicall.methods.aggregate(calls).call()
                let decoded = aggcalls[1].map(hex => contract.web3.eth.abi.decodeParameter('uint256', hex))
                let poolRates = calls.map((call, i) => [call[0], decoded[i]])
                return poolRates.reduce((a, b) => {
                    let pool1 = this.addresses.find(v => v.address == a[0]).pool
                    let pool2 = this.addresses.find(v => v.address == b[0]).pool
                    let gas1 = this.calculateGas(pool1)[0]
                    let gas2 = this.calculateGas(pool2)[0]
                    let precisions = this.precisions(this.to_currency)
                    return (a[1] / precisions) - gas1 > (b[1] / precisions) - gas2 ? a : b
                })
            },
            calculateGas(pool) {
                let i = this.normalizeCurrency(this.from_currency)
                let j = this.normalizeCurrency(this.to_currency)
                let onesplitGas = 4000000
                let txPricePool = 0
                if(pool != '1split') {
                    let poolgas = contractGas.swap[pool].exchange_underlying(i, j) / 2
                    txPricePool = poolgas * this.gasPrice / 1e9 * this.ethPrice
                }
                let txPrice1split = onesplitGas * this.gasPrice / 1e9 * this.ethPrice
                return [txPricePool, txPrice1split]
            },
            async set_to_amount() {
                this.distribution = null
                let minAmount = 10000
                if(this.swapwrapped) minAmount *= 50
                let exchangeRate;
                let bestdy_ = 0;
                try {
                    if(this.fromInput == 0) {
                        this.disabled = false;
                        this.toInput = '0.00';
                        return;
                    } else {
                        let pools = ['test3'];
                        this.swapPromise.cancel();
                        let promises = [this.realComparePools()];
                        this.swapPromise = helpers.makeCancelable(Promise.all(promises));
                        let result = await this.swapPromise;
                        let [poolAddress, dy] = result[0];
                        let pool = this.addresses.find(v => v.address == poolAddress).pool;
                        let dy_ = BN(dy).div(this.precisions(this.to_currency, pool))
                        exchangeRate = BN(dy_).div(BN(this.fromInput))
                        bestdy_ = dy_
                        let pool1 = 0
                        let exchangeRate1 = 0
                        let dy_1split = 0
                        if(result[1]) {
                            [pool1, exchangeRate1, dy_1split] = result[1]
                        }
                        let [txPricePool] = this.calculateGas(pool)
                        this.estimateGas = txPricePool;
                        this.bestPool = 0
                    }
                    let bestPool = this.bestPool
                    if(bestPool > 0) bestPool +=1
                    let address = this.swap[bestPool]._address
                    // if (BN(await this.getCoins(this.from_currency).methods.allowance(contract.default_account || '0x0000000000000000000000000000000000000000', address).call()).gt(contract.max_allowance.div(BN(2))))
                    //     this.inf_approval = true;
                    // else
                    //     this.inf_approval = false;

                    //show converted exchange rate when swapping wrapped coins?
                    this.toInput = this.toFixed(BN(this.fromInput).times(BN(exchangeRate)));
                    if(this.swapwrapped) {
                        let cdy_ = bestdy_ * this.c_rates(this.to_currency)[this.to_currency] * contractAbis.compound.wrapped_precisions[this.to_currency]
                        let cdx_ = this.fromInput * this.c_rates(this.from_currency)[this.from_currency] * contractAbis.compound.wrapped_precisions[this.from_currency]
                        exchangeRate = (cdy_ / cdx_)
                    }
                    this.setExchangeRate(exchangeRate)
                } catch(err) {
                    if(!err.canceled) {
                        console.error(err)
                        this.toInput = 0
                    }
                } finally {
                    this.set_from_amount(this.from_currency)
                }
            },
            async set_max_balance() {
                let balance
                if([5,9].includes(this.from_currency)) {
                    balance = await this.getCoins(this.from_currency).methods.transferableSynths(contract.default_account || '0x0000000000000000000000000000000000000000').call();
                    if(this.susdWaitingPeriod) balance = 0
                }
                else
                    balance = await this.getCoins(this.from_currency).methods.balanceOf(contract.default_account || '0x0000000000000000000000000000000000000000').call();
                let amount = BN(balance).div(this.precisions(this.from_currency)).toFixed()
                this.fromInput = contract.default_account ? amount : 0
                await this.set_to_amount();
            },
            async setup() {
                this.swap = []
                this.addresses = []
                let abis = Object.keys(contractAbis).filter(p => p != 'susd' && p != 'y')
                for(const pool of abis) {
                  console.log('pushing', pool)
                  this.swap.push(new contract.web3.eth.Contract(contractAbis[pool].swap_abi, contractAbis[pool].swap_address))
                  this.addresses.push({address: contractAbis[pool].swap_address, pool: pool})
                }

                this.coins.push(new contract.web3.eth.Contract(ERC20_abi, contractAbis.test3.coins[0]))
                this.coins.push(new contract.web3.eth.Contract(ERC20_abi, contractAbis.test3.coins[1]))
                this.coins.push(new contract.web3.eth.Contract(ERC20_abi, contractAbis.test3.coins[2]))


                this.snxExchanger = new contract.web3.eth.Contract(synthetixExchanger_ABI, synthetixExchanger_address)
            }
        }
    }
</script>

<style scoped>
   #poolselect {
        margin-bottom: 1em;
    }
    #poolselect > label:nth-of-type(1) {
        margin-left: 0;
    }
    #poolselect > label {
        margin-left: 1em;
    }
    .actualvalue {
        margin: 0.5em 0 0 0;
        text-align: right;
        font-size: 0.9em;
    }
    .exchange {
        width: 60%;
    }
    #best-pool .tooltiptext {
        text-align: left;
        padding-left: 1em;
    }
    .maxbalance.loading.line {
        display: block;
    }
    .coins.renbtc {
        margin-top: 1em;
    }
    .pulse {
        animation: pulse 1s 3;
        margin-bottom: 8px;
    }
    #no-balance-synth {
        margin-bottom: 0.3em;
    }
    @media only screen and (max-device-width: 1200px) {
        .exchange {
            width: 80%;
        }
    }
</style>