import Vue from 'vue'
import VueRouter from 'vue-router'
const PoolApp = () => import('../components/PoolApp.vue')
const Swap = () => import('../components/swap/Swap.vue')
const SwapRouter = () => import('../components/swap/SwapRouter.vue')
const Deposit = () => import('../components/deposit/Deposit.vue')
const DepositRouter = () => import('../components/deposit/DepositRouter.vue')
const DepositRen = () => import('../components/ren/Deposit.vue')
const Withdraw = () => import('../components/withdraw/Withdraw.vue')
const WithdrawRouter = () => import('../components/withdraw/WithdrawRouter.vue')
const WithdrawRen = () => import('../components/ren/Withdraw.vue')
const WithdrawOld = () => import('../components/WithdrawOld.vue')
const Stats = () => import('../components/Stats.vue')
const FAQ = () => import('../views/FAQ.vue')
const Donate = () => import('../views/Donate.vue')
const Profit = () => import('../components/Profit.vue')
const ProfitRouter = () => import('../components/ProfitRouter.vue')
const RootApp = () => import('../components/root/RootApp.vue')
const Root = () => import('../components/root/Root.vue')
const CombinedStats = () => import('../components/root/CombinedStats.vue')
const StatsDaily = () => import('../components/root/StatsDaily.vue')
const ChartGraph = () => import('../components/graphs/Chart.vue')
const BasicTrade = () => import('../components/graphs/BasicTrade.vue')
const RootFAQ = () => import('../components/root/RootFAQ.vue')
const Audits = () => import('../views/Audits.vue')
const Contracts = () => import('../views/Contracts.vue')
const CurvePay = () => import('../components/CurvePay.vue')
const Events = () => import('../components/Events.vue')
const EstimateGas = () => import('../components/EstimateGas.vue')
const VolumePerCoin = () => import('../components/VolumePerCoin.vue')
const VolumePerPair = () => import('../components/VolumePerPair.vue')
const TotalDeposits = () => import('../components/TotalDeposits.vue')
const Integrations = () => import('../views/Integrations.vue')
const Risks = () => import('../views/Risks.vue')
const BugBounty = () => import('../views/BugBounty.vue')
const PoolRisks = () => import('../views/PoolRisks.vue')

const ycTokens = () => import('../components/ycTokens/Index.vue')

const Registry = () => import('../components/test/Registry.vue')

const Gateway = () => import('../components/ren/Gateway.vue')

//DAO
const Votes = () => import('../components/dao/votes/Votes.vue')
const VoteView = () => import('../components/dao/votes/VoteView.vue')
const CreateVote = () => import('../components/dao/votes/CreateVote.vue')
const DAOAudits = () => import('../components/dao/DAOAudits.vue')
const DAOContracts = () => import('../components/dao/Contracts.vue')
const Inflation = () => import('../components/dao/distribution/Inflation.vue')
const GaugeWeight = () => import('../components/dao/gaugevote/Index.vue')
const DAOStats = () => import('../components/dao/distribution/Stats.vue')
const GaugeStats = () => import('../components/dao/gaugevote/GaugeStats.vue')
const EmergencyMembers = () => import('../components/dao/emergencydao/EmergencyMembers.vue')

//Minter
const VotingEscrow = () => import('../components/minter/VotingEscrow.vue')
const Gauges = () => import('../components/minter/Gauges.vue')
const VestingView = () => import('../components/minter/VestingView.vue')
const Locks = () => import('../components/minter/Locks.vue')
const GaugeCalc = () => import('../components/minter/GaugeCalc.vue')

const DAOApp = () => import('../components/dao/DAOApp.vue')

import Index from '../components/Index.vue'

import init from '../init'
import { getters, contract as currentContract , setCurrencies, changeContract} from '../contract'
import * as common from '../utils/common.js'

Vue.use(VueRouter)

let routes = [
  {
    path: '/',
    name: 'Root',
    component: RootApp,
    children: [
      {
        name: 'RootIndex',
        path: '',
        component: Root
      },
      {
        path: '/basictrade',
        name: 'BasicTrade',
        component: BasicTrade,
      },
      {
        path: '/exchange/:params(.*)?',
        name: 'Exchange',
        component: ChartGraph,
      },
      {
        path: '/trade/:params(.*)?',
        name: 'Trade',
        component: ChartGraph,
      },
      {
        name: 'CombinedStats',
        path: 'combinedstats',
        component: CombinedStats,
      },
      {
        name: 'Donate',
        path: 'donate',
        component: Donate,
      },
      {
        name: 'StatsDaily',
        path: 'dailystats',
        component: StatsDaily,
      },
      {
        name: 'Audits',
        path: 'audits',
        component: Audits,
      },
      {
        name: 'RootFAQ',
        path: '/rootfaq',
        component: RootFAQ,
      },
      {
        name: 'Contracts',
        path: '/contracts',
        component: Contracts,
      },
      {
        path: 'curvepay/:pool?',
        name: 'CurvePay',
        component: CurvePay,
      },
      {
        path: 'events/:params(.*)?',
        name: 'Events',
        component: Events,
      },
      {
        path: 'volumepercoin',
        name: 'VolumePerCoin',
        component: VolumePerCoin,
      },
      {
        path: 'volumeperpair',
        name: 'VolumePerPair',
        component: VolumePerPair,
      },
      {
        path: 'totaldeposits',
        name: 'TotalDeposits',
        component: TotalDeposits,
      },
      {
        path: 'yctokens',
        name: 'ycTokens',
        component: ycTokens,
      },
      {
        path: 'estimategas',
        name: 'EstimateGas',
        component: EstimateGas,
      },
      {
        path: 'registry',
        name: 'Registry',
        component: Registry,
      },
      {
          path: 'integrations',
        name: 'Integrations',
        component: Integrations,
      },
      {
        path: 'risks',
        name: 'Risks',
        component: Risks,
      },
      {
        path: 'bugbounty',
        name: 'BugBounty',
        component: BugBounty,
      },
    ]
  },
  {
    path: '/compound/withdraw_old',
    component: PoolApp,
    children: [
      {
        path: '',
        name: 'WithdrawOld',
        component: WithdrawOld
      },
    ]
  },
    // {
    //   path:'/test3',
    //   name: 'Index',
    //   component: PoolApp,
    //   children: [
    //     {
    //       path: '',
    //       name: 'Withdraw',
    //       component: Withdraw
    //     },
    //     {
    //       path: '*',
    //       name: 'Withdraw',
    //       component: Withdraw
    //     }
    //   ]
    // },
  // {
  //   path:'/ren/gateway',
  //   component: PoolApp,
  //   children: [
  //     {
  //       path: '',
  //       name: 'Gateway',
  //       component: Gateway,
  //     }
  //   ],
  // },
  // {
  //   path:'/ren/depositren',
  //   component: PoolApp,
  //   children: [
  //     {
  //       path: '',
  //       name: 'DepositRen',
  //       component: DepositRen,
  //     }
  //   ],
  // },
  // {
  //   path:'/ren/withdrawren',
  //   component: PoolApp,
  //   children: [
  //     {
  //       path: '',
  //       name: 'WithdrawRen',
  //       component: WithdrawRen,
  //     }
  //   ],
  // },
  // {
  //   path:'/ren/native',
  //   component: PoolApp,
  //   children: [
  //     {
  //       path: '',
  //       name: 'Swap',
  //       component: SwapRouter,
  //     }
  //   ]
  // },
  {
    path:'/sbtc/native',
    component: PoolApp,
    children: [
      {
        path: '',
        name: 'Swap',
        component: SwapRouter,
      }
    ]
  },
  // {
  //   path: '/',
  //   name: 'DAO',
  //   component: DAOApp,
  //   children: [
  //     {
  //       path: '',
  //       name: 'Gauges',
  //       component: Gauges,
  //     },
  //     {
  //       path: 'dao',
  //       name: 'Votes',
  //       component: Votes,
  //     },
  //     {
  //       path: 'vote/:app/:id',
  //       name: 'Vote',
  //       component: VoteView,
  //     },
  //     {
  //       path: 'createvote',
  //       name: 'CreateVote',
  //       component: CreateVote,
  //     },
  //     {
  //       path: 'audits',
  //       name: 'DAOAudits',
  //       component: DAOAudits,
  //     },
  //     {
  //       path: 'daocontracts',
  //       name: 'DAOContracts',
  //       component: DAOContracts,
  //     },
  //     {
  //       path: 'inflation',
  //       name: 'Inflation',
  //       component: Inflation,
  //     },
  //     {
  //       path: 'stats',
  //       name: 'DAOStats',
  //       component: DAOStats,
  //     },
  //     {
  //       path: 'gaugeweight',
  //       name: 'GaugeWeight',
  //       component: GaugeWeight,
  //     },
  //     {
  //       path: 'locks/:timestamp?',
  //       name: 'Locks',
  //       component: Locks,
  //     },
  //     {
  //       path: 'gaugestats',
  //       name: 'GaugeStats',
  //       component: GaugeStats,
  //     },
  //     {
  //       path: 'emergencymembers',
  //       name: 'EmergencyMembers',
  //       component: EmergencyMembers,
  //     },
  //   ],
  // },
  {
    path: '/minter',
    name: 'Minter',
    component: DAOApp,
    children: [
      {
        path: '',
        name: 'VotingEscrow',
        component: VotingEscrow,
      },
      {
        path: 'gauges',
        name: 'Gauges',
        component: Gauges,
      },
      {
        path: 'vesting',
        name: 'VestingView',
        component: VestingView,
      },
      {
        path: 'calc',
        name: 'GaugeCalc',
        component: GaugeCalc,
      },
    ],
  },
  {
    path: '/locker',
    name: 'Locker',
    component: DAOApp,
    children: [
      {
        path: '',
        name: 'VotingEscrow',
        component: VotingEscrow,
      },
    ],
  },
  {
    path: '/:pool(compound|usdt|y|iearn|busd|susdv2|pax|tbtc|ren|test3)/',
    name: 'Index',
    component: PoolApp,
    children: [
      {
        path: '',
        name: 'Swap',
        component: SwapRouter,
      },
      {
        path: 'deposit',
        name: 'Deposit',
        component: DepositRouter
      },
      {
        path: 'withdraw',
        name: 'Withdraw',
        component: WithdrawRouter
      },
      {
        path: 'withdraw_old',
        name: 'WithdrawOld',
        beforeEnter: (to, from, next) => {
          return next('/' + to.params.pool + '/withdraw')
        }
      },
      {
        path: 'stats',
        name: 'Stats',
        component: Stats
      },
      {
        path: 'faq',
        name: 'FAQ',
        component: FAQ
      },
      {
        path: 'donate',
        name: 'Donate',
        component: Donate
      },
      {
        path: 'profit/:address?',
        name: 'Profit',
        component: ProfitRouter
      },
      {
        path: 'audits',
        name: 'Audits',
        component: Audits,
      },
      {
        path: 'risks',
        name: 'PoolRisks',
        component: PoolRisks,
      },
    ]
  },
  {
    path: '*',
    redirect: '/'
  }
]


const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

const pools = ['compound','test3']

router.beforeEach(async (to, from, next) => {
  if(from.path.includes('/compound/withdraw_old')) await common.update_fee_info()
  //if(from.path.includes('profit') && to.path.includes('profit')) return window.location.href = to.path
  if(['Donate', 'StatsDaily', 'Audits'].includes(to.name)) return next();
  if(to.name == 'RootIndex') {

    init('test3');
    return next();
  }
  let subdomain;
  if(pools.includes(to.path.split('/')[1])) subdomain = to.path.split('/')[1]
  else subdomain = window.location.hostname.split('.')[0]
  if(!pools.includes(subdomain)) subdomain = 'test3'

  currentContract.swapbtc = false

  if((currentContract.currentContract != subdomain && !['Stats', 'FAQ', 'Donate'].includes(to.name)) || ['Stats', 'FAQ', 'Donate'].includes(from.name)) {
    console.log("1")
    await changeContract(subdomain)
    currentContract.currentContract = subdomain
    return next();
  } else if(!['Stats', 'FAQ', 'Donate'].includes(to.name)) {
    console.log("2")
    await changeContract(subdomain)
    currentContract.currentContract = subdomain
    return next();
  } else {
    console.log("3")
    currentContract.currentContract = subdomain;
    return next();
  }
})

export default router
