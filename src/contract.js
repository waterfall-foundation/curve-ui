import Vue from "vue";
import * as BN from 'bignumber.js'
import allabis, { ERC20_abi, synthetixExchanger_address, synthetixExchanger_ABI,
	multicall_abi, multicall_address} from './allabis'
import web3Init from './init'
import { chunkArr } from './utils/helpers'
import * as common from './utils/common.js'

var N_COINS = 3;
var coin_precisions = [1e18, 1e18, 1e18];
// var old_swap_address = '0x2e60CF74d81ac34eB21eEff58Db4D385920ef419';
var swap_address = '0xB25EC166697f656e8A0962C520788cC75aC89249';
var token_address = '0xA2b08EdB08D98B2c3da234e31B940f7F37E45fD9';
var old_token_address = '0xA2b08EdB08D98B2c3da234e31B940f7F37E45fD9';

export const LENDING_PRECISION = 1e18;
export const PRECISION = 1e18;

var migration_address = '0x54Ee22d5593FC76fB20EafAb66C45aAb3268B800';
export const infura_url = '';

const currencies = {
	test3: {
		wwat: 'wWAT',
		alex: 'Alex',
		serg: 'Serg',
	},
}

export const allCurrencies = currencies

export const poolMenu = {
	test3: 'Test3',
	usdt: 'USDT',
}

export const gas = {
	swap: {
		test3: {
			exchange: (i, j) => 600000,
			exchange_underlying: (i, j) => 1200000
		},
	},
	deposit: {
		test3: 600000,
	},
	withdraw: {
		test3: {
			imbalance: x => 1500000,
		},
	},
	depositzap: {
		test3: {
			//use periodic fit here?
			deposit: x => (93795.5*x + 608935)*1.5 | 0,
			withdraw: 2000000 / 1.5,
			withdrawShare: 1000000,
			withdrawImbalance: x => (97226.5*x + 671880)*1.5 | 0,
		},
	},
	adapter: {}
}

let initState = () => ({
	deposit_zap: null,
	balances: [],
	wallet_balances: [],
	underlying_coins: [],
	c_rates: [],
	bal_info: [],
	total: 0,
	l_info: [],
	totalShare: 0,
	showShares: false,
	totalSupply: 0,
	totalBalance: 0,
	usdShare: null,
	swapbtc: false,
})

const state = Vue.observable({
	web3: null,
	multicall: null,
	walletName: null,
	allInitContracts: new Set(),
	contracts: {
		test3: {
			currentContract: 'test3',
			...initState(),
		}
	},
	swapbtc: false,
	adapterContract: null,
	currentContract: 'test3',
	currencies: currencies.compound,
	N_COINS: N_COINS,
	coin_precisions: coin_precisions,
	wrapped_precisions: [],
	swap_address: swap_address,
	token_address: token_address,
	old_token_address: old_token_address,
	migration_address: migration_address,
	infura_url: infura_url,

	coins: new Array(N_COINS),
	underlying_coins: new Array(N_COINS),
	swap: null,
	old_swap: null,
	swap_token: null,
	old_swap_token: null,

	totalBalance: null,
	totalSupply: null,
	oldBalance: null,

	ERC20Contract: null,
	balances: new Array(N_COINS),
	wallet_balances: new Array(N_COINS),
	fee: 0,
	admin_fee: 0,
	trade_timeout: 1800,
	max_allowance: BN(2).pow(BN(256)).minus(BN(1)),
	c_rates: [],
	bal_info: [],
	total: 0,
	l_info: [],
	totalShare: 0,
	showShares: false,

	staked_info: [],
	totalStake: -1,

	virtual_price: null,
	A: null,
	initial_A: null,
	initial_A_time: null,
	future_A: null,
	future_A_time: null,
	admin_actions_deadline: null,

	slippage: 0,
	showSlippage: false,
	showNoBalance: false,
	showNoBalanceCoin: '',

	initializedContracts: false,

	default_account: '',

	error: false,
	curveRewards: null,
	curveStakedBalance: null,

	usdShare: null,
	usdStake: null,

	snxExchanger: null,

	chi: null,

})

export let contract = state

export const getters = {
	default_account: () => state.default_account || '0x0000000000000000000000000000000000000000',
	walletName: () => state.walletName,
	currentPool: () => state.currentContract,
	oldBalance: () => state.oldBalance,
	bal_info: () => state.bal_info,
	balTotal: () => state.total,
	l_info: () => state.l_info,
	totalShare: () => state.totalShare,
	totalBalance: () => state.totalBalance / 1e18,
	totalSupply: () => state.totalSupply / 1e18,
	currencies: () => state.currencies,
	fee: () => state.fee * 100,
	admin_fee: () => state.admin_fee * 100,
	A: () => state.A,
	initial_A: () => state.initial_A,
	initial_A_time: () => state.initial_A_time,
	future_A: () => state.future_A,
	future_A_time: () => state.future_A_time,
	admin_actions_deadline: () => state.admin_actions_deadline, 
	initializedContracts: () => state.initializedContracts,
	showSlippage: () => state.showSlippage,
	slippage: () => state.slippage,
	N_COINS: () => state.N_COINS,
	error: () => state.error,
	showShares: () => state.showShares,

	staked_info: () => state.staked_info,
	totalStake: () => state.totalStake,

	usdShare: () => state.usdShare,
	usdStake: () => state.usdStake,
}


export async function init(contract, refresh = true) {
	state.multicall = state.multicall || new web3.eth.Contract(multicall_abi, multicall_address)
	console.time('init')
	//contract = contracts.compound for example

	if(state.initializedContracts && contract.currentContract === state.currentContract && !refresh) return Promise.resolve();
	if(contract && (contract.currentContract == state.currentContract || state.contracts[contract.currentContract].initializedContracts) && !refresh) return Promise.resolve();
	if(!contract) contract = state
	try {
        let networkId = await state.web3.eth.net.getId();
        if(networkId != 333777333) {
            this.error = 'Error: wrong network type. Please switch to waterfall';
        }
    } catch(err) {
        console.error(err);
        this.error = 'There was an error connecting. Please refresh page';
    }

    let calls  = [
    	//get_virtual_price
    	[allabis[contract.currentContract].swap_address, '0xbb7b8b80'],
    	//A
    	[allabis[contract.currentContract].swap_address, '0xf446c1d0'],
    	//future_A
        [allabis[contract.currentContract].swap_address, '0xb4b577ad'],
        //admin_actions_deadline
        [allabis[contract.currentContract].swap_address, '0x405e28f8'],
    ];

    contract.swap = new state.web3.eth.Contract(allabis[contract.currentContract].swap_abi, allabis[contract.currentContract].swap_address);
    contract.swap_token = new state.web3.eth.Contract(ERC20_abi, allabis[contract.currentContract].token_address);
    window[contract.currentContract] = {};
    window[contract.currentContract].swap = contract.swap
    window[contract.currentContract].swap_token = contract.swap_token
    window[contract.currentContract].deposit_zap = contract.deposit_zap
    window[contract.currentContract].rewards = contract.curveRewards
    contract.coins = []
    contract.underlying_coins = []
    if(window.location.href.includes('withdraw_old')) 
      calls.push(...(await common.update_fee_info('old', contract, false)))
  	else 
      calls.push(...(await common.update_fee_info('new', contract, false)));
    for (let i = 0; i < allabis[contract.currentContract].N_COINS; i++) {
	  	let coinsCall = contract.swap.methods.coins(i).encodeABI()
	  	let underlyingCoinsCall = contract.swap.methods.coins(i).encodeABI();
    	calls.push([contract.swap._address, coinsCall])
    	calls.push([contract.swap._address, underlyingCoinsCall])
    }
    await common.multiInitState(calls, contract, true)
	contract.initializedContracts = true;
  	console.timeEnd('init')
  	state.allInitContracts = new Set(state.allInitContracts.add(contract.currentContract))
  	console.log([...state.allInitContracts])
}

export const allState = Vue.observable({
	swap: {},
	underlying_coins: {},
})

export async function getAllUnderlying() {
	for([key, contract] of Object.entries(allabis)) {
		if(key == 'susd') continue;
		allState.swap[key] = new state.web3.eth.Contract(contract.swap_abi, contract.swap_address);
        allState.underlying_coins[key] = [];
		for(let i = 0; i < contract.N_COINS; i++) {
			var addr = await allState.swap[key].methods.coins(i).call();
	        var underlying_addr = await allState.swap[key].swap.methods.underlying_coins(i).call();
	        allState.underlying_coins[key][i] = new state.web3.eth.Contract(ERC20_abi, underlying_addr);
		}
	}
}

export async function changeContract(pool) {
	//re-init contract with different pool
	if(!(pool in allabis)) return;
	state.initializedContracts = false;
	state.currentContract = pool;
	state.currencies = currencies[pool]
	state.N_COINS = allabis[pool].N_COINS;
	state.coin_precisions = allabis[pool].coin_precisions;
	state.wrapped_precisions = allabis[pool].wrapped_precisions;
	state.swap_address = allabis[pool].swap_address;
	state.old_swap_address = allabis[pool].old_swap_address;
	state.token_address = allabis[pool].token_address;
	state.old_token_address = allabis[pool].old_token_address;
	state.migration_address = allabis[pool].migration_address;
	state.coins = new Array(allabis[pool].coins);
	state.underlying_coins = new Array(allabis[pool].underlying_coins);
	state.balances = new Array(allabis[pool].balances);
	state.wallet_balances = new Array(allabis[pool].wallet_balances);
	state.bal_info = []
	state.l_info = []
	state.total = 0
	state.totalShare = 0
	await web3Init();
}

export function setCurrencies(pool) {
	contract.currencies = currencies[pool]
}

